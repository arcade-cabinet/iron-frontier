import type React from 'react';
import { useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { type PipeCell, PipeLogic } from '@/puzzles/pipe-fitter';
import { useGameStore } from '../store/webGameStore';

// --- Visual Components for Pipes (SVG) ---

const PipeGraphic = ({
  type,
  active,
  rotation,
}: {
  type: string;
  active: boolean;
  rotation: number;
}) => {
  const color = active ? '#3b82f6' : '#71717a'; // Blue active, Zinc inactive
  const strokeWidth = 12;

  // Basic SVG paths for pipe shapes centered in 100x100 box
  const paths: Record<string, React.ReactNode> = {
    straight: <path d="M50,0 L50,100" />,
    corner: <path d="M50,0 L50,50 L100,50" />,
    tee: <path d="M50,0 L50,100 M50,50 L100,50" />,
    cross: <path d="M50,0 L50,100 M0,50 L100,50" />,
    cap: <path d="M50,0 L50,50" />,
    source: (
      <>
        <path d="M50,0 L50,50" />
        <circle cx="50" cy="50" r="15" fill={active ? '#60a5fa' : '#a1a1aa'} />
      </>
    ),
    sink: (
      <>
        <path d="M50,0 L50,50" />
        <rect x="35" y="35" width="30" height="30" fill={active ? '#60a5fa' : '#a1a1aa'} />
      </>
    ),
    empty: null,
  };

  return (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full transition-transform duration-300 ease-in-out"
      style={{ transform: `rotate(${rotation * 90}deg)` }}
    >
      <g
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {paths[type]}
      </g>
    </svg>
  );
};

export const PipePuzzle = () => {
  const activePuzzle = useGameStore((state) => state.activePuzzle);
  const updatePuzzle = useGameStore((state) => state.updatePuzzle);
  const closePuzzle = useGameStore((state) => state.closePuzzle);
  const phase = useGameStore((state) => state.phase);

  if (phase !== 'puzzle' || !activePuzzle) return null;

  const handleCellClick = (cell: PipeCell) => {
    if (activePuzzle.solved) return;
    if (cell.fixed) return;

    // Rotate cell locally
    const newCell = PipeLogic.rotateCell(cell);

    // Create new grid copy
    const newGrid = activePuzzle.grid.map((row) => [...row]);
    newGrid[newCell.y][newCell.x] = newCell;

    // Dispatch update
    updatePuzzle(newGrid);
  };

  const handleClose = () => {
    closePuzzle(activePuzzle.solved);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-amber-900/50 p-6 rounded-lg shadow-2xl max-w-2xl w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-amber-500 font-serif tracking-wide">
              Steamfitter's Challenge
            </h2>
            <p className="text-zinc-400 text-sm">
              Connect the Source (Circle) to the Sink (Square)
            </p>
          </div>
          <div className="flex items-center gap-4">
            {activePuzzle.solved && (
              <span className="text-green-400 font-bold animate-pulse">FLOW ESTABLISHED</span>
            )}
            <Button
              variant="outline"
              className="border-amber-900/50 hover:bg-amber-900/20 text-amber-100"
              onClick={handleClose}
            >
              {activePuzzle.solved ? 'Complete' : 'Cancel'}
            </Button>
          </div>
        </div>

        {/* Grid Container */}
        <div
          className="grid gap-1 bg-zinc-950 p-4 rounded-md border border-zinc-800 mx-auto"
          style={{
            gridTemplateColumns: `repeat(${activePuzzle.width}, minmax(0, 1fr))`,
            width: 'fit-content',
          }}
        >
          {activePuzzle.grid.map((row, y) =>
            row.map((cell, x) => (
              <button
                key={`${x}-${y}`}
                className={cn(
                  'w-16 h-16 bg-zinc-900 rounded border border-zinc-800 hover:border-amber-500/50 transition-colors relative',
                  cell.fixed && 'cursor-not-allowed opacity-80',
                  activePuzzle.solved && 'cursor-default'
                )}
                onClick={() => handleCellClick(cell)}
                disabled={cell.fixed || activePuzzle.solved}
              >
                {/* Background Grid Lines (Decoration) */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                  <svg width="100%" height="100%" viewBox="0 0 10 10">
                    <path
                      d="M0 0 L10 0 M0 10 L10 10 M0 0 L0 10 M10 0 L10 10"
                      stroke="currentColor"
                      strokeWidth="0.5"
                      fill="none"
                    />
                  </svg>
                </div>

                <PipeGraphic type={cell.type} active={cell.active} rotation={cell.rotation} />
              </button>
            ))
          )}
        </div>

        {/* Footer / Instructions */}
        <div className="mt-4 text-center text-zinc-500 text-xs">
          <p>Click pipes to rotate. Fixed pipes cannot be moved.</p>
        </div>
      </div>
    </div>
  );
};
