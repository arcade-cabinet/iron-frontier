/**
 * GameOverScreen - Western-themed death screen
 * Displayed when the player dies
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

// ============================================================================
// ICONS
// ============================================================================

function SkullIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12c0 3.5 1.8 6.58 4.53 8.38V22h2.94v-1h5.06v1h2.94v-1.62C20.2 18.58 22 15.5 22 12c0-5.52-4.48-10-10-10zm-2.5 12c-.83 0-1.5-.67-1.5-1.5S8.67 11 9.5 11s1.5.67 1.5 1.5S10.33 14 9.5 14zm5 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
    </svg>
  );
}

function CrossIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path d="M12 2v20M8 6h8M6 22h12" />
    </svg>
  );
}

function RiseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" />
    </svg>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function GameOverScreen() {
  const { phase, playerName, resetGame, setPhase, playerStats, heal } = useGameStore();

  if (phase !== 'game_over') return null;

  const handleLoadLastSave = () => {
    // For now, just restore health and continue
    // In a full implementation, this would load from save file
    heal(playerStats.maxHealth);
    setPhase('playing');
  };

  const handleReturnToTitle = () => {
    resetGame();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/95 flex items-center justify-center z-50"
      >
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Vignette */}
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.8) 100%)',
            }}
          />
          {/* Dust particles */}
          <div className="absolute inset-0 opacity-20">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-amber-500/50 rounded-full"
                initial={{ x: Math.random() * 100 + '%', y: '100%' }}
                animate={{
                  y: [100, -20],
                  opacity: [0, 0.5, 0],
                }}
                transition={{
                  duration: 4 + Math.random() * 3,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
        </div>

        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="relative bg-amber-950 border-2 border-red-900/60 rounded-xl max-w-md w-full mx-4 overflow-hidden shadow-2xl"
        >
          {/* Header Decoration */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent" />

          {/* Content */}
          <div className="p-8 text-center">
            {/* Skull Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 12, delay: 0.2 }}
              className="mb-6"
            >
              <div className="w-24 h-24 mx-auto bg-red-950/50 border-2 border-red-800/50 rounded-full flex items-center justify-center">
                <SkullIcon className="w-16 h-16 text-red-600" />
              </div>
            </motion.div>

            {/* Death Message */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h1 className="text-4xl font-bold text-red-500 tracking-wider mb-3"
                  style={{ fontFamily: 'serif', textShadow: '0 0 20px rgba(239, 68, 68, 0.4)' }}>
                DEAD
              </h1>

              <p className="text-amber-300/90 mb-1">
                {playerName} met their end on the frontier.
              </p>
              <p className="text-amber-500/60 text-sm mb-6">
                The West claims another soul...
              </p>
            </motion.div>

            {/* Tombstone Decoration */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex justify-center mb-6"
            >
              <div className="flex items-end gap-3 text-amber-800/40">
                <CrossIcon className="w-6 h-10" />
                <div className="bg-amber-900/30 border border-amber-800/30 rounded-t-lg px-4 py-2">
                  <div className="text-[10px] text-amber-500/50 uppercase tracking-widest">R.I.P.</div>
                  <div className="text-xs text-amber-400/60">{playerName}</div>
                </div>
                <CrossIcon className="w-6 h-10" />
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="space-y-3"
            >
              <button
                onClick={handleLoadLastSave}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-amber-700 hover:bg-amber-600 text-amber-100 font-medium transition-colors"
              >
                <RiseIcon className="w-5 h-5" />
                Rise Again
              </button>
              <button
                onClick={handleReturnToTitle}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-amber-900/50 hover:bg-amber-800/50 text-amber-300 border border-amber-700/50 font-medium transition-colors"
              >
                <HomeIcon className="w-5 h-5" />
                Return to Title
              </button>
            </motion.div>

            {/* Footer Quote */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-8 pt-4 border-t border-amber-800/30"
            >
              <p className="text-amber-600/40 text-xs italic">
                "Every man dies. Not every man really lives."
              </p>
            </motion.div>
          </div>

          {/* Bottom Decoration */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-700/50 to-transparent" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default GameOverScreen;
