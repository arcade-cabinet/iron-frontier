import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

import { gameStore, type GameState } from '../store/webGameStore';

@Injectable({
  providedIn: 'root',
})
export class GameStoreService implements OnDestroy {
  private readonly stateSubject = new BehaviorSubject<GameState>(gameStore.getState());
  private readonly unsubscribe = gameStore.subscribe((state) => {
    this.stateSubject.next(state);
  });

  readonly state$ = this.stateSubject.asObservable();

  select<T>(selector: (state: GameState) => T): Observable<T> {
    return this.state$.pipe(map(selector), distinctUntilChanged());
  }

  getState(): GameState {
    return gameStore.getState();
  }

  setState(partial: Partial<GameState>): void {
    gameStore.setState(partial);
  }

  actions(): GameState {
    return gameStore.getState();
  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }
}
