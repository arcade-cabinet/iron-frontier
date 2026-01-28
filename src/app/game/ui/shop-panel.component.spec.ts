import { TestBed } from '@angular/core/testing';
import { ShopPanelComponent } from './shop-panel.component';
import { GameStoreService } from '../services/game-store.service';

class MockGameStoreService {
  state: any = {
    shopState: { shopId: 'general_store', ownerId: 'shop_keeper' },
    playerStats: { gold: 999, reputation: 0 },
    inventory: [],
  };
  actionsSpy = jasmine.createSpyObj('actions', ['buyItem', 'sellItem', 'closeShop']);

  getState() {
    return this.state;
  }

  actions() {
    return this.actionsSpy as any;
  }
}

describe('ShopPanelComponent', () => {
  let mockStore: MockGameStoreService;

  beforeEach(async () => {
    mockStore = new MockGameStoreService();
    await TestBed.configureTestingModule({
      imports: [ShopPanelComponent],
      providers: [{ provide: GameStoreService, useValue: mockStore }],
    }).compileComponents();
  });

  it('exposes available shop items', () => {
    const fixture = TestBed.createComponent(ShopPanelComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    expect(component.availableItems.length).toBeGreaterThan(0);
  });

  it('buys item via store action', () => {
    const fixture = TestBed.createComponent(ShopPanelComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    const itemId = component.availableItems[0]?.itemId;
    if (!itemId) {
      fail('No shop items available for test');
      return;
    }

    component.buyItem(itemId);

    expect(mockStore.actionsSpy.buyItem).toHaveBeenCalledWith(itemId);
  });
});
