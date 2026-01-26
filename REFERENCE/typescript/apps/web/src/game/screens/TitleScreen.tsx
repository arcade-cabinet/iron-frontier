// Title Screen - Iron Frontier

import { AnimatePresence, motion } from 'framer-motion';
import React, { useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useGameStore } from '../store/webGameStore';

// Gear SVG component
function GearIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className}>
      <path
        fill="currentColor"
        d="M50 10c-2.5 0-4.5 2-4.5 4.5v5c-3.5.5-6.8 1.5-9.8 3l-3.5-3.5c-1.8-1.8-4.7-1.8-6.4 0l-6.4 6.4c-1.8 1.8-1.8 4.7 0 6.4l3.5 3.5c-1.5 3-2.5 6.3-3 9.8h-5c-2.5 0-4.5 2-4.5 4.5v9c0 2.5 2 4.5 4.5 4.5h5c.5 3.5 1.5 6.8 3 9.8l-3.5 3.5c-1.8 1.8-1.8 4.7 0 6.4l6.4 6.4c1.8 1.8 4.7 1.8 6.4 0l3.5-3.5c3 1.5 6.3 2.5 9.8 3v5c0 2.5 2 4.5 4.5 4.5h9c2.5 0 4.5-2 4.5-4.5v-5c3.5-.5 6.8-1.5 9.8-3l3.5 3.5c1.8 1.8 4.7 1.8 6.4 0l6.4-6.4c1.8-1.8 1.8-4.7 0-6.4l-3.5-3.5c1.5-3 2.5-6.3 3-9.8h5c2.5 0 4.5-2 4.5-4.5v-9c0-2.5-2-4.5-4.5-4.5h-5c-.5-3.5-1.5-6.8-3-9.8l3.5-3.5c1.8-1.8 1.8-4.7 0-6.4l-6.4-6.4c-1.8-1.8-4.7-1.8-6.4 0l-3.5 3.5c-3-1.5-6.3-2.5-9.8-3v-5c0-2.5-2-4.5-4.5-4.5h-9zM50 35c8.3 0 15 6.7 15 15s-6.7 15-15 15-15-6.7-15-15 6.7-15 15-15z"
      />
    </svg>
  );
}

// Splash screen component
function SplashScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-stone-950 flex flex-col items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="relative"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="w-24 h-24 text-amber-600"
        >
          <GearIcon className="w-full h-full" />
        </motion.div>
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          className="absolute top-8 left-8 w-12 h-12 text-amber-700"
        >
          <GearIcon className="w-full h-full" />
        </motion.div>
      </motion.div>

      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="mt-8 text-3xl font-bold text-amber-500 tracking-wider"
      >
        IRON FRONTIER
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="mt-2 text-amber-700 text-sm tracking-widest uppercase"
      >
        Loading Steam...
      </motion.p>
    </motion.div>
  );
}

// Main menu component
function MainMenu() {
  const { initGame, initialized, playerName: savedPlayerName, setPhase } = useGameStore();
  const [showNameInput, setShowNameInput] = useState(false);
  const [inputName, setInputName] = useState('');
  const [showAbout, setShowAbout] = useState(false);

  const hasSaveData = initialized;

  const handleNewGame = () => {
    if (showNameInput) {
      if (inputName.trim()) {
        initGame(inputName.trim());
      }
    } else {
      setShowNameInput(true);
    }
  };

  const handleContinue = () => {
    // Just set game phase to playing, data is already in store
    setPhase('playing');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-gradient-to-b from-stone-900 via-stone-850 to-stone-950 flex flex-col items-center justify-center p-6 overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-amber-500/10 blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-orange-600/10 blur-[80px]" />

        {/* Rotating gears */}
        <motion.div
          className="absolute top-10 right-10 w-24 h-24 text-amber-600/20"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        >
          <GearIcon className="w-full h-full" />
        </motion.div>

        <motion.div
          className="absolute bottom-20 left-10 w-16 h-16 text-amber-700/15"
          animate={{ rotate: -360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
          <GearIcon className="w-full h-full" />
        </motion.div>

        <motion.div
          className="absolute top-1/2 right-1/4 w-20 h-20 text-amber-800/10"
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        >
          <GearIcon className="w-full h-full" />
        </motion.div>
      </div>

      {/* Title */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-8 relative z-10"
      >
        <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-amber-300 via-amber-500 to-amber-700 font-serif tracking-wide">
          IRON FRONTIER
        </h1>
        <p className="text-amber-600/80 text-sm md:text-base mt-2 tracking-widest uppercase">
          Tales of the Steam Frontier
        </p>
      </motion.div>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="text-stone-400 text-center max-w-sm mb-12 text-sm relative z-10"
      >
        The year is 1887. Steam and brass have conquered the frontier. Fortune awaits those brave
        enough to claim it.
      </motion.p>

      {/* Main actions */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="flex flex-col gap-3 w-full max-w-xs relative z-10"
      >
        <AnimatePresence mode="wait">
          {showNameInput ? (
            <motion.div
              key="name-input"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              <input
                type="text"
                placeholder="Enter your name, stranger..."
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                maxLength={20}
                autoFocus
                className={cn(
                  'w-full px-4 py-3 rounded-lg text-center',
                  'bg-stone-800 border-2 border-amber-700/50',
                  'text-amber-100 placeholder:text-stone-500',
                  'focus:outline-none focus:border-amber-500',
                  'font-serif text-lg'
                )}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && inputName.trim()) {
                    initGame(inputName.trim());
                  }
                }}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowNameInput(false)}
                  className={cn(
                    'flex-1 py-3 px-4 rounded-lg font-medium',
                    'bg-stone-700 hover:bg-stone-600 text-stone-300',
                    'transition-colors'
                  )}
                >
                  Back
                </button>
                <button
                  onClick={handleNewGame}
                  disabled={!inputName.trim()}
                  className={cn(
                    'flex-1 py-3 px-4 rounded-lg font-medium',
                    'bg-amber-700 hover:bg-amber-600 text-white',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'flex items-center justify-center gap-2',
                    'transition-colors'
                  )}
                >
                  <PlayIcon />
                  Start
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="main-buttons"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {hasSaveData && (
                <button
                  onClick={handleContinue}
                  className={cn(
                    'w-full py-4 px-6 rounded-lg font-medium text-lg',
                    'bg-gradient-to-r from-amber-700 to-amber-600',
                    'hover:from-amber-600 hover:to-amber-500',
                    'text-white shadow-lg shadow-amber-900/30',
                    'flex items-center justify-center gap-2',
                    'border border-amber-500/30',
                    'transition-all active:scale-[0.98]'
                  )}
                >
                  <PlayIcon />
                  Continue as {savedPlayerName}
                </button>
              )}

              <button
                onClick={handleNewGame}
                className={cn(
                  'w-full py-4 px-6 rounded-lg font-medium text-lg',
                  hasSaveData
                    ? 'bg-stone-700 hover:bg-stone-600 text-stone-200'
                    : 'bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white shadow-lg shadow-amber-900/30 border border-amber-500/30',
                  'flex items-center justify-center gap-2',
                  'transition-all active:scale-[0.98]'
                )}
              >
                {hasSaveData ? (
                  'New Game'
                ) : (
                  <>
                    <PlayIcon />
                    Begin Adventure
                  </>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Bottom info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="absolute bottom-6 flex items-center gap-4"
      >
        <button
          onClick={() => setShowAbout(true)}
          className="text-stone-500 hover:text-stone-400 transition-colors flex items-center gap-1 text-sm"
        >
          <InfoIcon />
          About
        </button>
      </motion.div>

      {/* About modal */}
      <AnimatePresence>
        {showAbout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50"
            onClick={() => setShowAbout(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-stone-800 rounded-xl p-6 max-w-sm border border-amber-700/30"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-amber-300 mb-3">About Iron Frontier</h2>
              <p className="text-stone-300 text-sm mb-4">
                A mobile-first isometric RPG set in a steampunk American frontier. Explore
                procedurally generated towns, meet quirky NPCs, and uncover the mysteries of the
                steam age.
              </p>
              <p className="text-stone-500 text-xs mb-4">
                Built with React and React Three Fiber. Procedural generation ensures every
                playthrough is unique.
              </p>
              <button
                onClick={() => setShowAbout(false)}
                className="w-full py-2 bg-stone-700 hover:bg-stone-600 rounded-lg text-stone-300 transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Simple icons
function PlayIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" strokeWidth="2" />
      <path strokeLinecap="round" d="M12 16v-4M12 8h.01" strokeWidth="2" />
    </svg>
  );
}

// Main title screen component
export function TitleScreen() {
  const [showSplash, setShowSplash] = useState(true);

  // Auto-transition after 2.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('[TitleScreen] Splash timer complete, showing main menu');
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Simple conditional render without AnimatePresence complexity
  if (showSplash) {
    return <SplashScreen key="splash" onComplete={() => setShowSplash(false)} />;
  }

  return <MainMenu key="menu" />;
}
