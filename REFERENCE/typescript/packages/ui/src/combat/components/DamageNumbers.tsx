/**
 * Damage Numbers Component
 *
 * Displays floating damage/heal numbers that animate upward and fade out.
 * Supports different styles for crits, heals, misses, and blocks.
 */

import * as React from 'react';
import { useEffect, useState } from 'react';
import { cn } from '../../primitives/utils';
import type { DamageNumberConfig, DamageNumbersProps } from '../types';

/**
 * Get styles for damage number type
 */
function getDamageNumberStyles(
  type: DamageNumberConfig['type']
): { color: string; size: string; prefix?: string } {
  switch (type) {
    case 'critical':
      return {
        color: 'text-amber-300',
        size: 'text-2xl sm:text-3xl font-bold',
        prefix: 'CRIT! ',
      };
    case 'damage':
      return {
        color: 'text-crimson-400',
        size: 'text-lg sm:text-xl font-semibold',
      };
    case 'heal':
      return {
        color: 'text-sage-400',
        size: 'text-lg sm:text-xl font-semibold',
        prefix: '+',
      };
    case 'miss':
      return {
        color: 'text-obsidian-400',
        size: 'text-base sm:text-lg italic',
      };
    case 'block':
      return {
        color: 'text-sky-400',
        size: 'text-base sm:text-lg font-medium',
      };
  }
}

/**
 * Single floating damage number
 */
const FloatingNumber = React.memo<{
  config: DamageNumberConfig;
  onComplete: () => void;
}>(({ config, onComplete }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger animation on mount
    requestAnimationFrame(() => setVisible(true));

    // Call complete callback after animation
    const timer = setTimeout(() => {
      onComplete();
    }, 1500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const styles = getDamageNumberStyles(config.type);
  const displayValue =
    config.type === 'miss' ? 'MISS' : config.type === 'block' ? 'BLOCKED' : config.value;

  return (
    <div
      className={cn(
        'absolute pointer-events-none select-none',
        'transition-all duration-[1500ms] ease-out',
        styles.color,
        styles.size,
        visible ? 'opacity-0 -translate-y-16' : 'opacity-100 translate-y-0'
      )}
      style={{
        left: `calc(50% + ${config.offsetX ?? 0}px)`,
        top: `calc(50% + ${config.offsetY ?? 0}px)`,
        transform: `translateX(-50%)`,
        textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0 0 10px currentColor',
      }}
    >
      {styles.prefix}
      {displayValue}
    </div>
  );
});

FloatingNumber.displayName = 'FloatingNumber';

/**
 * Container for all damage numbers
 */
export const DamageNumbers = React.forwardRef<HTMLDivElement, DamageNumbersProps>(
  ({ damageNumbers, onAnimationComplete, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('absolute inset-0 pointer-events-none overflow-hidden z-50', className)}
        aria-hidden="true"
      >
        {damageNumbers.map((config) => (
          <FloatingNumber
            key={config.id}
            config={config}
            onComplete={() => onAnimationComplete(config.id)}
          />
        ))}
      </div>
    );
  }
);

DamageNumbers.displayName = 'DamageNumbers';
