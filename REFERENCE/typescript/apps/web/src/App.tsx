import { lazy, Suspense } from 'react';

// Lazy load the game for code splitting
const R3FGame = lazy(() => import('./game/R3FGame'));

/**
 * Loading fallback for lazy-loaded game
 */
function GameLoadingFallback() {
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-stone-950">
      <div className="text-center">
        <div className="text-amber-500 text-xl mb-2">Loading Iron Frontier...</div>
        <div className="text-stone-400 text-sm">Initializing 3D engine</div>
        <div className="mt-4 flex justify-center">
          <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="w-screen h-screen overflow-hidden bg-stone-950 dark">
      <Suspense fallback={<GameLoadingFallback />}>
        <R3FGame />
      </Suspense>
    </div>
  );
}

export default App;
