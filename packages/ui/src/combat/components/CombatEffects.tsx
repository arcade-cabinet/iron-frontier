/**
 * Combat Effects Component
 *
 * Renders visual effects like screen flashes, shakes, and hit sparks.
 */

import * as React from 'react';
import { useEffect, useState } from 'react';
import { cn } from '../../primitives/utils';
import type { CombatEffect, CombatEffectsProps } from '../types';

/**
 * Screen Flash Effect
 */
const ScreenFlash = React.memo<{ effect: CombatEffect; onComplete: () => void }>(
  ({ effect, onComplete }) => {
    const [active, setActive] = useState(true);

    useEffect(() => {
      const timer = setTimeout(() => {
        setActive(false);
        onComplete();
      }, effect.duration);

      return () => clearTimeout(timer);
    }, [effect.duration, onComplete]);

    const opacityMap = {
      light: 'opacity-10',
      medium: 'opacity-20',
      heavy: 'opacity-40',
    };

    if (!active) return null;

    return (
      <div
        className={cn(
          'fixed inset-0 pointer-events-none z-[60] transition-opacity',
          opacityMap[effect.intensity ?? 'medium']
        )}
        style={{ backgroundColor: effect.color ?? '#ffffff' }}
      />
    );
  }
);

ScreenFlash.displayName = 'ScreenFlash';

/**
 * Screen Shake Effect (using CSS transform)
 */
const ScreenShake = React.memo<{ effect: CombatEffect; onComplete: () => void }>(
  ({ effect, onComplete }) => {
    useEffect(() => {
      const root = document.getElementById('combat-screen-container');
      if (!root) {
        onComplete();
        return;
      }

      const intensityMap = {
        light: 2,
        medium: 4,
        heavy: 8,
      };

      const intensity = intensityMap[effect.intensity ?? 'medium'];
      let frame = 0;
      const totalFrames = Math.floor(effect.duration / 16); // ~60fps

      const shake = () => {
        if (frame >= totalFrames) {
          root.style.transform = '';
          onComplete();
          return;
        }

        const decay = 1 - frame / totalFrames;
        const x = (Math.random() - 0.5) * intensity * decay;
        const y = (Math.random() - 0.5) * intensity * decay;
        root.style.transform = `translate(${x}px, ${y}px)`;

        frame++;
        requestAnimationFrame(shake);
      };

      requestAnimationFrame(shake);

      return () => {
        root.style.transform = '';
      };
    }, [effect, onComplete]);

    return null;
  }
);

ScreenShake.displayName = 'ScreenShake';

/**
 * Hit Spark Effect
 */
const HitSpark = React.memo<{ effect: CombatEffect; onComplete: () => void }>(
  ({ effect, onComplete }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete();
      }, effect.duration);

      return () => clearTimeout(timer);
    }, [effect.duration, onComplete]);

    if (!visible) return null;

    return (
      <div
        className="absolute w-8 h-8 pointer-events-none animate-ping"
        style={{
          backgroundColor: effect.color ?? '#ff6600',
          borderRadius: '50%',
          opacity: 0.6,
          filter: 'blur(4px)',
        }}
        data-target={effect.targetId}
      />
    );
  }
);

HitSpark.displayName = 'HitSpark';

/**
 * Heal Glow Effect
 */
const HealGlow = React.memo<{ effect: CombatEffect; onComplete: () => void }>(
  ({ effect, onComplete }) => {
    const [opacity, setOpacity] = useState(0);

    useEffect(() => {
      // Fade in
      requestAnimationFrame(() => setOpacity(1));

      // Fade out and complete
      const fadeTimer = setTimeout(() => {
        setOpacity(0);
      }, effect.duration * 0.6);

      const completeTimer = setTimeout(() => {
        onComplete();
      }, effect.duration);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(completeTimer);
      };
    }, [effect.duration, onComplete]);

    return (
      <div
        className="absolute inset-0 pointer-events-none rounded-lg transition-opacity duration-300"
        style={{
          backgroundColor: effect.color ?? '#00ff88',
          opacity: opacity * 0.2,
          boxShadow: `0 0 20px ${effect.color ?? '#00ff88'}`,
        }}
        data-target={effect.targetId}
      />
    );
  }
);

HealGlow.displayName = 'HealGlow';

/**
 * Main Combat Effects Container
 */
export const CombatEffects = React.forwardRef<HTMLDivElement, CombatEffectsProps>(
  ({ effects, onEffectComplete, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('fixed inset-0 pointer-events-none z-[55]', className)}
        aria-hidden="true"
      >
        {effects.map((effect) => {
          switch (effect.type) {
            case 'screen_flash':
              return (
                <ScreenFlash
                  key={effect.id}
                  effect={effect}
                  onComplete={() => onEffectComplete(effect.id)}
                />
              );
            case 'screen_shake':
              return (
                <ScreenShake
                  key={effect.id}
                  effect={effect}
                  onComplete={() => onEffectComplete(effect.id)}
                />
              );
            case 'hit_spark':
              return (
                <HitSpark
                  key={effect.id}
                  effect={effect}
                  onComplete={() => onEffectComplete(effect.id)}
                />
              );
            case 'heal_glow':
              return (
                <HealGlow
                  key={effect.id}
                  effect={effect}
                  onComplete={() => onEffectComplete(effect.id)}
                />
              );
            default:
              return null;
          }
        })}
      </div>
    );
  }
);

CombatEffects.displayName = 'CombatEffects';
