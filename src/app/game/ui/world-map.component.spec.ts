import { TestBed } from '@angular/core/testing';
import { WorldMapComponent } from './world-map.component';
import { GameStoreService } from '../services/game-store.service';
import { FrontierTerritory } from '@/data/worlds/frontier_territory';
import { loadWorld } from '@/data/worlds';

class MockGameStoreService {
  state: any = {
    loadedWorld: loadWorld(FrontierTerritory),
    currentLocationId: 'dusty_springs',
    discoveredLocationIds: ['dusty_springs', 'sunset_ranch'],
  };
  actionsSpy = jasmine.createSpyObj('actions', ['travelTo']);

  getState() {
    return this.state;
  }

  actions() {
    return this.actionsSpy as any;
  }
}

describe('WorldMapComponent', () => {
  let mockStore: MockGameStoreService;

  beforeEach(async () => {
    mockStore = new MockGameStoreService();
    await TestBed.configureTestingModule({
      imports: [WorldMapComponent],
      providers: [{ provide: GameStoreService, useValue: mockStore }],
    }).compileComponents();
  });

  it('selects a location and initiates travel', () => {
    const fixture = TestBed.createComponent(WorldMapComponent);
    fixture.componentInstance.isOpen = true;
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const target = component.world.locations.find((loc) => loc.id === 'sunset_ranch');
    expect(target).toBeDefined();

    component.selectLocation(target!);
    expect(component.selectedLocationId).toBe('sunset_ranch');

    component.handleTravel();
    expect(mockStore.actionsSpy.travelTo).toHaveBeenCalledWith('sunset_ranch');
  });
});
