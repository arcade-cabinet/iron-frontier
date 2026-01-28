import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { TravelPanelComponent } from './travel-panel.component';
import { GameStoreService } from '../services/game-store.service';

class MockGameStoreService {
  state: any = {
    travelState: {
      fromLocationId: 'dusty_springs',
      toLocationId: 'sunset_ranch',
      method: 'road',
      travelTime: 2,
      progress: 40,
      dangerLevel: 'safe',
      startedAt: Date.now(),
      encounterId: null,
    },
    loadedWorld: null,
  };
  state$ = new BehaviorSubject(this.state);
  actionsSpy = jasmine.createSpyObj('actions', ['cancelTravel', 'completeTravel']);

  getState() {
    return this.state;
  }

  actions() {
    return this.actionsSpy as any;
  }
}

describe('TravelPanelComponent', () => {
  let mockStore: MockGameStoreService;

  beforeEach(async () => {
    mockStore = new MockGameStoreService();
    await TestBed.configureTestingModule({
      imports: [TravelPanelComponent],
      providers: [{ provide: GameStoreService, useValue: mockStore }],
    }).compileComponents();
  });

  it('uses explicit progress when available', () => {
    const fixture = TestBed.createComponent(TravelPanelComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    expect(component.progressPercent).toBe(40);
  });

  it('cancels travel via store action', () => {
    const fixture = TestBed.createComponent(TravelPanelComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.cancelTravel();

    expect(mockStore.actionsSpy.cancelTravel).toHaveBeenCalled();
  });
});
