/**
 * TravelPanel - Travel progress and encounter UI
 *
 * Shows travel progress between locations and handles random encounters
 * that occur during travel.
 */

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, type TravelState } from '../store/gameStore';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

// ============================================================================
// ICONS
// ============================================================================

function HorseIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 10c-1-3-4-6-7-6-2 0-4 2-5 4-2-1-4-1-6 1-1 1-2 3-2 5 0 3 2 6 5 6h4l1 2h4l1-2h2c2 0 3-1 4-3 0-2-1-5-1-7z" />
      <path d="M5 11c0 1 1 2 2 2" />
    </svg>
  );
}

function TrainIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M7 21h10c1 0 2-1 2-2v-4c0-1-1-2-2-2h-1l-1-8c0-1-1-2-2-2H11c-1 0-2 1-2 2l-1 8H7c-1 0-2 1-2 2v4c0 1 1 2 2 2z" />
    </svg>
  );
}

function SkullIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="10" r="7" />
      <path d="M8 10a1 1 0 1 0 2 0 1 1 0 1 0-2 0" />
      <path d="M14 10a1 1 0 1 0 2 0 1 1 0 1 0-2 0" />
      <path d="M9 17v4h2v-2h2v2h2v-4" />
      <path d="M12 14v1" />
    </svg>
  );
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DANGER_COLORS: Record<string, string> = {
  safe: 'text-green-400 bg-green-900/30 border-green-700',
  low: 'text-lime-400 bg-lime-900/30 border-lime-700',
  moderate: 'text-yellow-400 bg-yellow-900/30 border-yellow-700',
  high: 'text-orange-400 bg-orange-900/30 border-orange-700',
  extreme: 'text-red-400 bg-red-900/30 border-red-700',
};

const METHOD_INFO: Record<string, { icon: typeof HorseIcon; label: string; speed: string }> = {
  road: { icon: HorseIcon, label: 'Road', speed: 'Fast' },
  trail: { icon: BootIcon, label: 'Trail', speed: 'Moderate' },
  railroad: { icon: TrainIcon, label: 'Railroad', speed: 'Very Fast' },
  wilderness: { icon: BootIcon, label: 'Wilderness', speed: 'Slow' },
  river: { icon: HorseIcon, label: 'River', speed: 'Varies' },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function TravelPanel() {
  const {
    travelState,
    loadedWorld,
    completeTravel,
    cancelTravel,
    startCombat,
  } = useGameStore();

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

  // Handle continue after winning combat
  const handleContinue = useCallback(() => {
    completeTravel();
  }, [completeTravel]);

  if (!travelState) {
    return null;
  }

  const methodInfo = METHOD_INFO[travelState.method] || METHOD_INFO.trail;
  const MethodIcon = methodInfo.icon;
  const dangerClass = DANGER_COLORS[travelState.dangerLevel] || DANGER_COLORS.moderate;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/90"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="w-full max-w-md mx-4 bg-stone-900 border-2 border-amber-800/50 rounded-lg shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-amber-900/30 border-b border-amber-800/50 p-4">
            <div className="flex items-center gap-3">
              <MethodIcon className="w-8 h-8 text-amber-400" />
              <div>
                <h2 className="text-lg font-bold text-amber-100">
                  {showEncounter ? 'Encounter!' : 'Traveling...'}
                </h2>
                <p className="text-sm text-amber-400">
                  {fromLocation?.ref.name ?? 'Unknown'} → {toLocation?.ref.name ?? 'Unknown'}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Route Info */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-stone-800 text-amber-200 border-stone-700">
                  {methodInfo.label}
                </Badge>
                <span className="text-stone-400">{travelState.travelTime}h travel time</span>
              </div>
              <Badge className={`capitalize ${dangerClass}`}>
                {travelState.dangerLevel} danger
              </Badge>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <Progress value={progress} className="h-3 bg-stone-800" />
              <div className="flex justify-between text-xs text-stone-500">
                <span>{fromLocation?.ref.name ?? 'Origin'}</span>
                <span>{Math.round(progress)}%</span>
                <span>{toLocation?.ref.name ?? 'Destination'}</span>
              </div>
            </div>

            {/* Encounter Panel */}
            {showEncounter && travelState.encounterId && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-950/30 border border-red-800/50 rounded-lg p-4"
              >
                <div className="flex items-center gap-3 mb-3">
                  <SkullIcon className="w-8 h-8 text-red-400" />
                  <div>
                    <h3 className="font-bold text-red-200">Ambush!</h3>
                    <p className="text-sm text-red-400">
                      Hostiles have blocked the {travelState.method}!
                    </p>
                  </div>
                </div>

                <p className="text-stone-300 text-sm mb-4">
                  You've been waylaid by enemies. You can fight your way through or attempt to flee
                  back the way you came.
                </p>

                <div className="flex gap-3">
                  <Button
                    onClick={handleFight}
                    className="flex-1 bg-red-800 hover:bg-red-700 text-red-100"
                  >
                    Fight
                  </Button>
                  <Button
                    onClick={handleFlee}
                    variant="outline"
                    className="flex-1 border-stone-600 text-stone-300 hover:bg-stone-800"
                  >
                    Flee
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Traveling Message (no encounter) */}
            {!showEncounter && !travelState.encounterId && (
              <div className="text-center py-4">
                <motion.div
                  animate={{ x: [0, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="inline-block"
                >
                  <MethodIcon className="w-12 h-12 text-amber-500 mx-auto" />
                </motion.div>
                <p className="text-stone-400 mt-2">
                  Traveling via {methodInfo.label.toLowerCase()}...
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default TravelPanel;
