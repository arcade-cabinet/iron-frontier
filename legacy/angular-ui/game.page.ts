import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Subject } from 'rxjs';
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
import { audioService } from './services/AudioService';

declare global {
  interface Window {
    __IRON_FRONTIER_TEST__?: {
      startCombat: (encounterId?: string) => void;
      startDialogue: (npcId?: string) => void;
      openShop: (shopId?: string) => void;
      startPuzzle: (width?: number, height?: number) => void;
      setPhase: (phase: GamePhase) => void;
      startQuest: (questId: string) => void;
      updateObjective: (questId: string, objectiveId: string, progress: number) => void;
      advanceQuestStage: (questId: string) => void;
      completeQuest: (questId: string) => void;
      addItem: (itemId: string, quantity?: number) => void;
      addGold: (amount: number) => void;
      setPlayerStats: (stats: Partial<{ health: number; maxHealth: number; xp: number; level: number; gold: number }>) => void;
      fastTravel: (locationId: string) => boolean;
      setTime: (hour: number, minute?: number) => void;
      setFatigue: (value: number) => void;
      setState: (partial: Record<string, unknown>) => void;
      getState: () => unknown;
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
  private timeTimer: ReturnType<typeof setInterval> | null = null;
  private prevLocationId: string | null = null;
  private readonly keyHandler = (event: KeyboardEvent) => this.handleKeyDown(event);
  private isE2E = false;
  isLoading = true;
  loadError: string | null = null;
  worldMapOpen = false;

  constructor(private readonly zone: NgZone, readonly gameStore: GameStoreService) {}

  ngOnInit(): void {
    this.isE2E = typeof window !== 'undefined' && window.location.search.includes('e2e=1');
    audioService.initialize().catch(() => {});
    this.registerTestHarness();

    this.gameStore
      .select((state) => state.phase)
      .pipe(takeUntil(this.destroy$))
      .subscribe((phase) => {
        if (phase === 'playing' && !this.timeTimer) {
          this.timeTimer = setInterval(() => this.gameStore.actions().tickClock(), 1000);
        } else if (phase !== 'playing' && this.timeTimer) {
          clearInterval(this.timeTimer);
          this.timeTimer = null;
        }
      });

    this.gameStore.state$.pipe(takeUntil(this.destroy$)).subscribe((state) => {
      if (state.phase === 'playing' && !state.loadedWorld) {
        this.gameStore.actions().initWorld('frontier_territory');
      }

      if (this.isE2E && state.phase !== 'title') {
        this.isLoading = false;
        return;
      }

      if (!this.sceneManager && state.phase !== 'title' && state.loadedWorld && state.currentLocationId) {
        void this.initScene(state.loadedWorld, state.currentLocationId, state.worldSeed);
      }

      if (state.currentLocationId && this.prevLocationId === null) {
        this.prevLocationId = state.currentLocationId;
      }

      if (
        this.sceneManager &&
        state.currentLocationId &&
        this.prevLocationId &&
        state.currentLocationId !== this.prevLocationId
      ) {
        const nextLocation = state.currentLocationId;
        this.prevLocationId = nextLocation;
        void this.reloadScene(state.loadedWorld, nextLocation, state.worldSeed);
      }
    });

    this.gameStore
      .select((state) => state.weather)
      .pipe(takeUntil(this.destroy$))
      .subscribe((weather) => {
        const time = this.gameStore.getState().time;
        this.sceneManager?.updateEnvironment(time, weather);
      });

    this.gameStore
      .select((state) => state.playerPosition)
      .pipe(takeUntil(this.destroy$))
      .subscribe((pos) => {
        const state = this.gameStore.getState();
        if (this.sceneManager && (state.phase === 'playing' || state.phase === 'dialogue')) {
          this.sceneManager.setPlayerPosition(pos as HexWorldPosition);
        }
      });

    window.addEventListener('keydown', this.keyHandler);
  }

  ngAfterViewInit(): void {
    this.registerTestHarness();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.timeTimer) {
      clearInterval(this.timeTimer);
      this.timeTimer = null;
    }
    this.sceneManager?.dispose();
    window.removeEventListener('keydown', this.keyHandler);
    if (typeof window !== 'undefined' && window.__IRON_FRONTIER_TEST__) {
      delete window.__IRON_FRONTIER_TEST__;
    }
  }

  private registerTestHarness(): void {
    if (environment.production) return;
    if (typeof window === 'undefined') return;
    if (!window.location.search.includes('e2e=1')) return;

    window.__IRON_FRONTIER_TEST__ = {
      startCombat: (encounterId = 'roadside_bandits') =>
        this.gameStore.actions().startCombat(encounterId),
      startDialogue: (npcId = 'doc_chen') => this.gameStore.actions().startDialogue(npcId),
      openShop: (shopId = 'general_store') => this.gameStore.actions().openShop(shopId),
      startPuzzle: (width = 5, height = 5) =>
        this.gameStore.actions().startPuzzle(width, height),
      setPhase: (phase: GamePhase) => this.gameStore.actions().setPhase(phase),
      startQuest: (questId: string) => this.gameStore.actions().startQuest(questId),
      updateObjective: (questId: string, objectiveId: string, progress: number) =>
        this.gameStore.actions().updateObjective(questId, objectiveId, progress),
      advanceQuestStage: (questId: string) => this.gameStore.actions().advanceQuestStage(questId),
      completeQuest: (questId: string) => this.gameStore.actions().completeQuest(questId),
      addItem: (itemId: string, quantity = 1) =>
        this.gameStore.actions().addItemById(itemId, quantity),
      addGold: (amount: number) => this.gameStore.actions().addGold(amount),
      setPlayerStats: (stats) => this.gameStore.actions().updatePlayerStats(stats),
      fastTravel: (locationId: string) => {
        this.gameStore.actions().travelTo(locationId);
        const travel = this.gameStore.getState().travelState;
        if (!travel) return false;
        this.gameStore.actions().completeTravel();
        return true;
      },
      setTime: (hour: number, minute = 0) => this.gameStore.actions().setTime(hour, minute),
      setFatigue: (value: number) => this.gameStore.actions().setFatigue(value),
      setState: (partial: Record<string, unknown>) => this.gameStore.setState(partial as any),
      getState: () => this.gameStore.getState(),
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

      const initialPos = manager.getPlayerPosition();
      this.gameStore.actions().setPlayerPosition(initialPos);

      this.spawnMarkers(manager, currentLocationId);

      this.isLoading = false;
    } catch (error) {
      this.loadError = error instanceof Error ? error.message : 'Failed to initialize scene';
      this.isLoading = false;
    }
  }

  private async reloadScene(loadedWorld: LoadedWorld, locationId: string, worldSeed: number): Promise<void> {
    if (!this.sceneManager || !this.canvasRef?.nativeElement) return;

    this.isLoading = true;
    this.loadError = null;

    try {
      this.sceneManager.dispose();

      const manager = new HexSceneManager(this.canvasRef.nativeElement, {
        seed: worldSeed,
        mapWidth: 32,
        mapHeight: 32,
        hexSize: 1,
      });

      const resolvedLocation = loadedWorld.getLocation(locationId);
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

      const initialPos = manager.getPlayerPosition();
      this.gameStore.actions().setPlayerPosition(initialPos);
      this.spawnMarkers(manager, locationId);

      this.isLoading = false;
    } catch (error) {
      this.loadError = error instanceof Error ? error.message : 'Failed to reload scene';
      this.isLoading = false;
    }
  }

  private spawnMarkers(manager: HexSceneManager, locationId: string): void {
    const npcsInLocation = getNPCsByLocation(locationId);
    for (const npc of npcsInLocation) {
      if (npc.spawnCoord) {
        manager.spawnNPCMarker(
          npc.id,
          { q: npc.spawnCoord.q, r: npc.spawnCoord.r },
          npc.name,
          npc.questGiver ?? false,
        );
      }
    }

    const state = this.gameStore.getState();
    const worldItems = getWorldItemsForLocation(locationId);
    for (const item of worldItems) {
      if (!state.collectedItemIds.includes(item.id)) {
        manager.spawnItemMarker(item.id, item.coord, getWorldItemName(item.itemId));
      }
    }
  }

  private handleKeyDown(event: KeyboardEvent): void {
    const state = this.gameStore.getState();
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;

    if ((event.key === 'm' || event.key === 'M') && state.phase === 'playing') {
      this.worldMapOpen = !this.worldMapOpen;
    }

    if (event.key === 'Escape' && this.worldMapOpen) {
      this.worldMapOpen = false;
    }
  }

  reloadPage(): void {
    window.location.reload();
  }
}
