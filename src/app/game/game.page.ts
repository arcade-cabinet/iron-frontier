import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { interval, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import type { LoadedWorld } from '@/data/worlds/WorldLoader';

import { getNPCsByLocation } from '@/data/npcs';
import { getLocationData } from '@/data/worlds';
import { getWorldItemsForLocation, getWorldItemName } from '@/data/items/worldItems';
import { ProceduralLocationManager } from '@/data/generation/ProceduralLocationManager';
import { SeededRandom } from '@/data/generation/seededRandom';
import { generateRandomEncounter, shouldTriggerEncounter } from '@/data/generation/generators/encounterGenerator';
import { HexSceneManager, type HexWorldPosition } from '@/engine/hex';
import { HexBuildingType, hexKey } from '@/engine/hex/HexTypes';

import { TitleScreenComponent } from './screens/title-screen.component';
import { ActionBarComponent } from './ui/action-bar.component';
import { GameHudComponent } from './ui/game-hud.component';
import { NotificationFeedComponent } from './ui/notification-feed.component';
import { InventoryPanelComponent } from './ui/inventory-panel.component';
import { CharacterPanelComponent } from './ui/character-panel.component';
import { QuestLogComponent } from './ui/quest-log.component';
import { MenuPanelComponent } from './ui/menu-panel.component';
import { DialogueBoxComponent } from './ui/dialogue-box.component';
import { CombatPanelComponent } from './ui/combat-panel.component';
import { ShopPanelComponent } from './ui/shop-panel.component';
import { TravelPanelComponent } from './ui/travel-panel.component';
import { WorldMapComponent } from './ui/world-map.component';
import { PipePuzzleComponent } from './ui/pipe-puzzle.component';
import { GameOverScreenComponent } from './ui/game-over-screen.component';
import { GameStoreService } from './services/game-store.service';
import { environment } from '../../environments/environment';
import type { GamePhase } from '@/store';

declare global {
  interface Window {
    __IRON_FRONTIER_TEST__?: {
      startCombat: (encounterId?: string) => void;
      startDialogue: (npcId?: string) => void;
      openShop: (shopId?: string) => void;
      startPuzzle: (width?: number, height?: number) => void;
      setPhase: (phase: GamePhase) => void;
    };
  }
}

@Component({
  selector: 'app-game',
  templateUrl: './game.page.html',
  styleUrls: ['./game.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    TitleScreenComponent,
    GameHudComponent,
    ActionBarComponent,
    NotificationFeedComponent,
    InventoryPanelComponent,
    CharacterPanelComponent,
    QuestLogComponent,
    MenuPanelComponent,
    DialogueBoxComponent,
    CombatPanelComponent,
    ShopPanelComponent,
    TravelPanelComponent,
    WorldMapComponent,
    PipePuzzleComponent,
    GameOverScreenComponent,
  ],
})
export class GamePage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('renderCanvas', { static: true })
  private readonly canvasRef?: ElementRef<HTMLCanvasElement>;

  private sceneManager: HexSceneManager | null = null;
  private readonly destroy$ = new Subject<void>();
  isLoading = true;
  loadError: string | null = null;
  worldMapOpen = false;

  constructor(private readonly zone: NgZone, readonly gameStore: GameStoreService) {}

  ngOnInit(): void {
    this.gameStore.select((state) => state.phase).pipe(takeUntil(this.destroy$)).subscribe((phase) => {
      if (phase === 'playing') {
        interval(1000)
          .pipe(takeUntil(this.destroy$))
          .subscribe(() => this.gameStore.actions().updateTime(0.1));
      }
    });

    this.gameStore.state$.pipe(takeUntil(this.destroy$)).subscribe((state) => {
      if (!this.sceneManager && state.phase !== 'title' && state.loadedWorld && state.currentLocationId) {
        void this.initScene(state.loadedWorld, state.currentLocationId, state.worldSeed);
      }

      if (state.phase === 'playing' && !state.loadedWorld) {
        this.gameStore.actions().initWorld('frontier_territory');
      }
    });

    this.gameStore
      .select((state) => state.weather)
      .pipe(takeUntil(this.destroy$))
      .subscribe((weather) => {
        const time = this.gameStore.getState().time;
        this.sceneManager?.updateEnvironment(time, weather);
      });
  }

  ngAfterViewInit(): void {
    this.registerTestHarness();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.sceneManager?.dispose();
    if (typeof window !== 'undefined' && window.__IRON_FRONTIER_TEST__) {
      delete window.__IRON_FRONTIER_TEST__;
    }
  }

  private registerTestHarness(): void {
    if (environment.production) return;
    if (typeof window === 'undefined') return;
    if (!window.location.search.includes('e2e=1')) return;

    window.__IRON_FRONTIER_TEST__ = {
      startCombat: (encounterId = 'test_encounter') =>
        this.gameStore.actions().startCombat(encounterId),
      startDialogue: (npcId = 'doc_chen') => this.gameStore.actions().startDialogue(npcId),
      openShop: (shopId = 'general_store') => this.gameStore.actions().openShop(shopId),
      startPuzzle: (width = 5, height = 5) =>
        this.gameStore.actions().startPuzzle(width, height),
      setPhase: (phase: GamePhase) => this.gameStore.actions().setPhase(phase),
    };
  }

  private async initScene(loadedWorld: LoadedWorld, currentLocationId: string, worldSeed: number) {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas || this.sceneManager) {
      return;
    }

    this.isLoading = true;
    this.loadError = null;

    try {
      const manager = new HexSceneManager(canvas, {
        seed: worldSeed,
        mapWidth: 32,
        mapHeight: 32,
        hexSize: 1,
      });

      const resolvedLocation = loadedWorld.getLocation(currentLocationId);
      const locationData = resolvedLocation ? getLocationData(resolvedLocation) : null;

      if (locationData) {
        await manager.init(locationData);
      } else {
        await manager.init();
      }

      manager.start();

      this.sceneManager = manager;

      manager.setHexClickHandler((hexCoord, tile) => {
        const state = this.gameStore.getState();

        if (tile?.building && tile.building !== HexBuildingType.None && state.currentLocationId) {
          const key = hexKey(hexCoord);
          const status = ProceduralLocationManager.getOrGenerateStructureState(
            state.currentLocationId,
            key,
          );

          if (status === 'broken' || status === 'locked') {
            this.gameStore.actions().addNotification('info', `This ${tile.building} is ${status}. Starting bypass...`);
            this.gameStore.actions().startPuzzle(5, 5);
            return;
          }

          this.gameStore.actions().addNotification('info', `This ${tile.building} is functioning normally.`);
        }

        if (state.currentLocationId) {
          const npcsInLocation = getNPCsByLocation(state.currentLocationId);
          const npcAtHex = npcsInLocation.find(
            (npc) => npc.spawnCoord && npc.spawnCoord.q === hexCoord.q && npc.spawnCoord.r === hexCoord.r,
          );

          if (npcAtHex) {
            this.gameStore.actions().talkToNPC(npcAtHex.id);
            return;
          }

          const worldItems = getWorldItemsForLocation(state.currentLocationId);
          const itemAtHex = worldItems.find(
            (item) =>
              item.coord.q === hexCoord.q &&
              item.coord.r === hexCoord.r &&
              !state.collectedItemIds.includes(item.id),
          );

          if (itemAtHex) {
            this.gameStore.actions().collectWorldItem(itemAtHex.id);
            manager.removeItemMarker(itemAtHex.id);
            this.gameStore.actions().addNotification('item', `Collected ${getWorldItemName(itemAtHex.itemId)}!`);
            return;
          }
        }

        manager.movePlayerTo(hexCoord);
      });

      manager.setGroundClickHandler((pos: HexWorldPosition) => {
        const state = this.gameStore.getState();

        if (state.currentLocationId && state.loadedWorld) {
          const resolvedLocation = state.loadedWorld.getLocation(state.currentLocationId);
          const locData = resolvedLocation ? getLocationData(resolvedLocation) : null;
          const isSafe = locData?.type === 'town' || locData?.type === 'city' || locData?.type === 'village';

          if (!isSafe) {
            const rng = new SeededRandom(Date.now());
            if (
              shouldTriggerEncounter(
                rng,
                {
                  worldSeed: state.worldSeed,
                  playerLevel: state.playerStats.level,
                  gameHour: state.time.hour,
                  factionTensions: {},
                  activeEvents: [],
                  contextTags: [],
                },
                0.1,
              )
            ) {
              const encounter = generateRandomEncounter(
                rng,
                {
                  playerLevel: state.playerStats.level,
                  locationId: state.currentLocationId,
                  contextTags: ['wild'],
                  worldSeed: state.worldSeed,
                  regionId: 'unknown',
                  gameHour: state.time.hour,
                  factionTensions: {},
                  activeEvents: [],
                },
                {},
              );

              if (encounter) {
                this.gameStore.actions().addNotification('warning', 'Ambush! Prepare for combat!');
                this.gameStore.actions().startCombat(encounter.id);
                return;
              }
            }
          }
        }

        const height = manager.getHeightAt(pos.x, pos.z);
        this.gameStore.actions().setPlayerPosition({ x: pos.x, y: height, z: pos.z });
      });

      const playerPos = this.gameStore.getState().playerPosition as HexWorldPosition;
      manager.setPlayerPosition(playerPos);

      this.isLoading = false;
    } catch (error) {
      this.loadError = error instanceof Error ? error.message : 'Failed to initialize scene';
    }
  }
}
