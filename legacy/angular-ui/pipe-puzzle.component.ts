import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { PipeLogic, type PipeCell } from '@/puzzles/pipe-fitter';
import { GameStoreService } from '../services/game-store.service';

@Component({
  selector: 'app-pipe-puzzle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pipe-puzzle.component.html',
  styleUrls: ['./pipe-puzzle.component.scss'],
})
export class PipePuzzleComponent {
  constructor(readonly gameStore: GameStoreService) {}

  get activePuzzle() {
    return this.gameStore.getState().activePuzzle;
  }

  get phase() {
    return this.gameStore.getState().phase;
  }

  handleCellClick(cell: PipeCell): void {
    const activePuzzle = this.activePuzzle;
    if (!activePuzzle || activePuzzle.solved || cell.fixed) return;

    const newCell = PipeLogic.rotateCell(cell);
    const newGrid = activePuzzle.grid.map((row) => [...row]);
    newGrid[newCell.y][newCell.x] = newCell;

    this.gameStore.actions().updatePuzzle(newGrid);
  }

  closePuzzle(): void {
    const activePuzzle = this.activePuzzle;
    if (!activePuzzle) return;
    this.gameStore.actions().closePuzzle(activePuzzle.solved);
  }

  trackByIndex(index: number): number {
    return index;
  }
}
