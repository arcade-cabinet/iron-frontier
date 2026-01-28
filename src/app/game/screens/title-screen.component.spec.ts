import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { TitleScreenComponent } from './title-screen.component';
import { GameStoreService } from '../services/game-store.service';

class MockGameStoreService {
  state = { initialized: false, playerName: 'Stranger' };
  actionsSpy = jasmine.createSpyObj('actions', ['initGame', 'setPhase']);

  getState() {
    return this.state as any;
  }

  actions() {
    return this.actionsSpy as any;
  }
}

describe('TitleScreenComponent', () => {
  let mockStore: MockGameStoreService;

  beforeEach(async () => {
    mockStore = new MockGameStoreService();
    await TestBed.configureTestingModule({
      imports: [TitleScreenComponent],
      providers: [{ provide: GameStoreService, useValue: mockStore }],
    }).compileComponents();
  });

  it('hides splash after delay', fakeAsync(() => {
    const fixture = TestBed.createComponent(TitleScreenComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    expect(component.showSplash).toBeTrue();
    tick(2500);
    fixture.detectChanges();
    expect(component.showSplash).toBeFalse();
  }));

  it('starts new game when name entered', () => {
    const fixture = TestBed.createComponent(TitleScreenComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.handleNewGame();
    expect(component.showNameInput).toBeTrue();

    component.inputName = 'Ada';
    component.handleStart();

    expect(mockStore.actionsSpy.initGame).toHaveBeenCalledWith('Ada');
  });
});
