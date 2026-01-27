/**
 * TravelPanel - Travel progress and encounter UI
 *
 * Shows travel progress between locations and handles random encounters
 * that occur during travel.
 */

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useGameStore } from '../store/webGameStore';

// ============================================================================
// ICONS
// ============================================================================

function HorseIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M22 10c-1-3-4-6-7-6-2 0-4 2-5 4-2-1-4-1-6 1-1 1-2 3-2 5 0 3 2 6 5 6h4l1 2h4l1-2h2c2 0 3-1 4-3 0-2-1-5-1-7z" />
      <path d="M5 11c0 1 1 2 2 2" />
    </svg>
  );
}

function TrainIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="4" y="3" width="16" height="14" rx="2" />
      <path d="M4 11h16" />
      <path d="M12 3v8" />
      <circle cx="8" cy="19" r="2" />
      <circle cx="16" cy="19" r="2" />
      <path d="M8 17h8" />
    </svg>
  );
}

function BootIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M7 21h10c1 0 2-1 2-2v-4c0-1-1-2-2-2h-1l-1-8c0-1-1-2-2-2H11c-1 0-2 1-2 2l-1 8H7c-1 0-2 1-2 2v4c0 1 1 2 2 2z" />
    </svg>
  );
}

function SkullIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="10" r="7" />
      <path d="M8 10a1 1 0 1 0 2 0 1 1 0 1 0-2 0" />
      <path d="M14 10a1 1 0 1 0 2 0 1 1 0 1 0-2 0" />
      <path d="M9 17v4h2v-2h2v2h2v-4" />
      <path d="M12 14v1" />
    </svg>
  );
}

function CompassIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" fill="currentColor" />
    </svg>
  );
}

function SwordIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
      <path d="M13 19l6-6" />
      <path d="M16 16l4 4" />
      <path d="M19 21l2-2" />
    </svg>
  );
}

function RunIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M13 4v4l3 3" />
      <circle cx="13" cy="4" r="2" />
      <path d="M7 21l3-9 4 2" />
      <path d="M4 15l6 2" />
      <path d="M18 12l2 4" />
    </svg>
  );
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DANGER_STYLES: Record<string, { badge: string; text: string }> = {
  safe: {
    badge: 'bg-green-900/50 text-green-400 border-green-700/50',
    text: 'text-green-400',
  },
  low: {
    badge: 'bg-lime-900/50 text-lime-400 border-lime-700/50',
    text: 'text-lime-400',
  },
  moderate: {
    badge: 'bg-yellow-900/50 text-yellow-400 border-yellow-700/50',
    text: 'text-yellow-400',
  },
  high: {
    badge: 'bg-orange-900/50 text-orange-400 border-orange-700/50',
    text: 'text-orange-400',
  },
  extreme: {
    badge: 'bg-red-900/50 text-red-400 border-red-700/50',
    text: 'text-red-400',
  },
};

const METHOD_INFO: Record<string, { icon: typeof HorseIcon; label: string; speed: string }> = {
  road: { icon: HorseIcon, label: 'Road', speed: 'Fast' },
  trail: { icon: BootIcon, label: 'Trail', speed: 'Moderate' },
  railroad: { icon: TrainIcon, label: 'Railroad', speed: 'Very Fast' },
  wilderness: { icon: BootIcon, label: 'Wilderness', speed: 'Slow' },
  river: { icon: HorseIcon, label: 'River', speed: 'Varies' },
};

// ============================================================================
// PROGRESS BAR
// ============================================================================

function TravelProgressBar({
  progress,
  fromName,
  toName,
}: {
  progress: number;
  fromName: string;
  toName: string;
}) {
  return (
    <div className="space-y-2">
      {/* Progress Track */}
      <div className="relative h-4 bg-amber-900/50 rounded-full overflow-hidden border border-amber-700/50">
        {/* Background Track Pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 12px)',
          }}
        />
        {/* Progress Fill */}
        <motion.div
          className="h-full bg-gradient-to-r from-amber-600 to-amber-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
        {/* Progress Marker */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-amber-300 rounded-full border-2 border-amber-700 shadow-lg"
          initial={{ left: '0%' }}
          animate={{ left: `${Math.min(progress, 97)}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>

      {/* Labels */}
      <div className="flex justify-between text-xs">
        <span className="text-amber-500 truncate max-w-[40%]">{fromName}</span>
        <span className="text-amber-400 font-mono">{Math.round(progress)}%</span>
        <span className="text-amber-500 truncate max-w-[40%] text-right">{toName}</span>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function TravelPanel() {
  const { travelState, loadedWorld, completeTravel, cancelTravel, startCombat } = useGameStore();

  const [progress, setProgress] = useState(0);
  const [showEncounter, setShowEncounter] = useState(false);

  // Get location names
  const fromLocation = loadedWorld?.getLocation(travelState?.fromLocationId ?? '');
  const toLocation = loadedWorld?.getLocation(travelState?.toLocationId ?? '');

  // Animate travel progress
  useEffect(() => {
    if (!travelState) {
      setProgress(0);
      setShowEncounter(false);
      return;
    }

    // If there's an encounter, show it at 50% progress
    if (travelState.encounterId) {
      const timer = setTimeout(() => {
        setProgress(50);
        setTimeout(() => setShowEncounter(true), 500);
      }, 1000);
      return () => clearTimeout(timer);
    }

    // Normal travel - animate to 100%
    const duration = Math.min(travelState.travelTime * 200, 3000); // Cap at 3s
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);

      if (newProgress < 100) {
        requestAnimationFrame(animate);
      } else {
        // Travel complete
        setTimeout(() => completeTravel(), 500);
      }
    };

    requestAnimationFrame(animate);
  }, [travelState, completeTravel]);

  // Handle encounter fight
  const handleFight = useCallback(() => {
    if (travelState?.encounterId) {
      startCombat(travelState.encounterId);
    }
  }, [travelState, startCombat]);

  // Handle flee
  const handleFlee = useCallback(() => {
    cancelTravel();
  }, [cancelTravel]);

  if (!travelState) {
    return null;
  }

  const methodInfo = METHOD_INFO[travelState.method] || METHOD_INFO.trail;
  const MethodIcon = methodInfo.icon;
  const dangerStyle = DANGER_STYLES[travelState.dangerLevel] || DANGER_STYLES.moderate;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/85"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="w-full max-w-md mx-4 bg-amber-950 border-2 border-amber-700/60 rounded-xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-amber-900/40 border-b border-amber-800/50 p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-amber-800/50 border border-amber-700/50 flex items-center justify-center">
                {showEncounter ? (
                  <SkullIcon className="w-7 h-7 text-red-400" />
                ) : (
                  <MethodIcon className="w-7 h-7 text-amber-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2
                  className={cn(
                    'text-lg font-bold',
                    showEncounter ? 'text-red-400' : 'text-amber-200'
                  )}
                >
                  {showEncounter ? 'Ambush!' : 'Traveling...'}
                </h2>
                <p className="text-sm text-amber-400/80 truncate">
                  {fromLocation?.ref.name ?? 'Unknown'} <span className="text-amber-500">→</span>{' '}
                  {toLocation?.ref.name ?? 'Unknown'}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Route Info Badges */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-900/50 border border-amber-700/50">
                  <MethodIcon className="w-4 h-4 text-amber-400" />
                  <span className="text-xs text-amber-200 font-medium">{methodInfo.label}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-900/50 border border-amber-700/50">
                  <CompassIcon className="w-4 h-4 text-amber-400" />
                  <span className="text-xs text-amber-300">{travelState.travelTime}h</span>
                </div>
              </div>
              <div
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-md border capitalize text-xs font-medium',
                  dangerStyle.badge
                )}
              >
                {travelState.dangerLevel} danger
              </div>
            </div>

            {/* Progress Bar */}
            <TravelProgressBar
              progress={progress}
              fromName={fromLocation?.ref.name ?? 'Origin'}
              toName={toLocation?.ref.name ?? 'Destination'}
            />

            {/* Encounter Panel */}
            {showEncounter && travelState.encounterId && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-950/40 border border-red-800/50 rounded-lg p-4"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-red-900/50 border border-red-700/50 flex items-center justify-center">
                    <SkullIcon className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-red-200">Road Ambush!</h3>
                    <p className="text-sm text-red-400/80">
                      Hostiles have blocked the {travelState.method}!
                    </p>
                  </div>
                </div>

                <p className="text-amber-200/70 text-sm mb-4">
                  You've been waylaid by enemies. You can fight your way through or attempt to flee
                  back the way you came.
                </p>

                <div className="flex gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={handleFight}
                    className="flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-lg bg-red-800 hover:bg-red-700 text-red-100 font-medium transition-colors min-h-[44px] text-sm sm:text-base"
                  >
                    <SwordIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    Fight
                  </button>
                  <button
                    type="button"
                    onClick={handleFlee}
                    className="flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-lg bg-amber-900/50 hover:bg-amber-800/50 text-amber-200 border border-amber-700/50 font-medium transition-colors min-h-[44px] text-sm sm:text-base"
                  >
                    <RunIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    Flee
                  </button>
                </div>
              </motion.div>
            )}

            {/* Traveling Animation (no encounter) */}
            {!showEncounter && !travelState.encounterId && (
              <div className="text-center py-6">
                <motion.div
                  animate={{ x: [0, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                  className="inline-block"
                >
                  <MethodIcon className="w-16 h-16 text-amber-500 mx-auto" />
                </motion.div>
                <p className="text-amber-400/70 mt-3 text-sm">
                  Traveling via {methodInfo.label.toLowerCase()}...
                </p>
                <p className="text-amber-500/50 text-xs mt-1">{methodInfo.speed} travel speed</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-amber-800/50 bg-amber-900/20">
            <div className="text-center text-[10px] text-amber-500/50">
              {showEncounter
                ? 'Choose your course of action'
                : 'The frontier stretches before you...'}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default TravelPanel;
