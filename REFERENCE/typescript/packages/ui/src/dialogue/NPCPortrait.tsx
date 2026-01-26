/**
 * NPC Portrait Component
 *
 * Displays NPC portrait with name, title, and emotion states.
 * Features a subtle breathing animation for immersion.
 */

import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '../primitives/utils';
import type { DialogueBaseProps, NPCEmotion, NPCPortraitData } from './types';

/**
 * Portrait frame variants using CVA
 */
const portraitFrameVariants = cva(
  // Base frame styles - brass/bronze steampunk frame
  [
    'relative',
    'overflow-hidden',
    'rounded-lg',
    'border-4',
    'shadow-lg',
    // Brass frame effect
    'border-bronze-500',
    'bg-gradient-to-br from-bronze-400 via-bronze-500 to-bronze-600',
  ].join(' '),
  {
    variants: {
      size: {
        sm: 'w-20 h-20',
        md: 'w-24 h-24 sm:w-28 sm:h-28',
        lg: 'w-32 h-32 sm:w-36 sm:h-36',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

/**
 * Portrait image container
 */
const portraitImageVariants = cva(
  [
    'absolute inset-1',
    'rounded',
    'overflow-hidden',
    'bg-parchment-100',
    // Inner shadow for depth
    'shadow-inner',
  ].join(' '),
  {
    variants: {
      emotion: {
        neutral: '',
        happy: 'ring-2 ring-sage-400',
        angry: 'ring-2 ring-crimson-400',
        sad: 'ring-2 ring-sky-400',
        suspicious: 'ring-2 ring-amber-400',
        worried: 'ring-2 ring-amber-300',
        determined: 'ring-2 ring-bronze-400',
        thoughtful: 'ring-2 ring-sky-300',
      },
    },
    defaultVariants: {
      emotion: 'neutral',
    },
  }
);

/**
 * Name label variants
 */
const nameLabelVariants = cva(
  [
    'absolute -bottom-1 left-1/2 -translate-x-1/2',
    'px-3 py-1',
    'rounded',
    'text-center',
    'whitespace-nowrap',
    'shadow-md',
    // Parchment label with brass edges
    'bg-parchment-100',
    'border border-bronze-400',
    // Western serif font
    'font-serif',
  ].join(' '),
  {
    variants: {
      size: {
        sm: 'text-xs min-w-16',
        md: 'text-sm min-w-20',
        lg: 'text-base min-w-24',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface NPCPortraitProps
  extends DialogueBaseProps,
    VariantProps<typeof portraitFrameVariants> {
  /** NPC data for display */
  npc: NPCPortraitData;
  /** Override emotion (defaults to npc.emotion) */
  emotion?: NPCEmotion;
  /** Whether to show breathing animation */
  animate?: boolean;
  /** Whether to show name label */
  showName?: boolean;
  /** Custom portrait render function */
  renderPortrait?: (npc: NPCPortraitData) => React.ReactNode;
}

/**
 * Placeholder portrait component
 */
function PlaceholderPortrait({ npc, emotion }: { npc: NPCPortraitData; emotion: NPCEmotion }) {
  // Generate consistent color from NPC ID
  const hash = npc.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue = hash % 360;

  // Emotion-based adjustments
  const emotionStyles: Record<NPCEmotion, { eyebrows: string; mouth: string }> = {
    neutral: { eyebrows: 'M12 8h4 M28 8h4', mouth: 'M18 26h8' },
    happy: { eyebrows: 'M12 9h4 M28 9h4', mouth: 'M16 24 Q22 30 28 24' },
    angry: { eyebrows: 'M10 10 L16 7 M28 7 L34 10', mouth: 'M16 28 Q22 24 28 28' },
    sad: { eyebrows: 'M10 7 L16 10 M28 10 L34 7', mouth: 'M16 28 Q22 24 28 28' },
    suspicious: { eyebrows: 'M12 8h4 M26 9 L32 7', mouth: 'M18 26h6' },
    worried: { eyebrows: 'M10 7 L16 10 M28 10 L34 7', mouth: 'M18 27h8' },
    determined: { eyebrows: 'M10 10 L16 7 M28 7 L34 10', mouth: 'M16 26h12' },
    thoughtful: { eyebrows: 'M12 8h4 M28 9h4', mouth: 'M18 25 Q22 27 26 25' },
  };

  const { eyebrows, mouth } = emotionStyles[emotion];

  return (
    <svg viewBox="0 0 44 44" className="w-full h-full">
      {/* Background */}
      <rect width="44" height="44" fill={`hsl(${hue}, 30%, 85%)`} />

      {/* Simple face shape */}
      <ellipse cx="22" cy="22" rx="16" ry="18" fill={`hsl(${hue}, 20%, 75%)`} />

      {/* Eyes */}
      <circle cx="15" cy="18" r="3" fill="white" />
      <circle cx="29" cy="18" r="3" fill="white" />
      <circle cx="15" cy="18" r="1.5" fill="#333" />
      <circle cx="29" cy="18" r="1.5" fill="#333" />

      {/* Eyebrows */}
      <path d={eyebrows} stroke="#5a4a3a" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* Mouth */}
      <path d={mouth} stroke="#7a5a4a" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* Initial letter */}
      <text
        x="22"
        y="40"
        textAnchor="middle"
        fontSize="8"
        fill="#5a4a3a"
        fontFamily="serif"
        fontWeight="bold"
      >
        {npc.name.charAt(0).toUpperCase()}
      </text>
    </svg>
  );
}

/**
 * NPCPortrait component
 *
 * Displays an NPC's portrait with western/steampunk styling.
 * Features a brass frame, name label, and subtle breathing animation.
 */
export const NPCPortrait = React.forwardRef<HTMLDivElement, NPCPortraitProps>(
  (
    {
      npc,
      emotion: emotionOverride,
      size,
      animate = true,
      showName = true,
      renderPortrait,
      className,
      testID,
    },
    ref
  ) => {
    const emotion = emotionOverride ?? npc.emotion ?? 'neutral';

    return (
      <div className="flex flex-col items-center gap-2" data-testid={testID} ref={ref}>
        {/* Portrait frame */}
        <div className={cn(portraitFrameVariants({ size }), className)}>
          {/* Corner rivets */}
          <div className="absolute top-0.5 left-0.5 w-2 h-2 rounded-full bg-bronze-600 shadow-inner" />
          <div className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-bronze-600 shadow-inner" />
          <div className="absolute bottom-0.5 left-0.5 w-2 h-2 rounded-full bg-bronze-600 shadow-inner" />
          <div className="absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full bg-bronze-600 shadow-inner" />

          {/* Portrait image container */}
          <div
            className={cn(
              portraitImageVariants({ emotion }),
              // Breathing animation
              animate && 'animate-breathe'
            )}
            style={{
              // CSS custom animation for breathing
              animation: animate ? 'breathe 4s ease-in-out infinite' : undefined,
            }}
          >
            {renderPortrait ? (
              renderPortrait(npc)
            ) : npc.portraitId ? (
              // Real portrait image
              <img
                src={npc.portraitId}
                alt={`Portrait of ${npc.name}`}
                className="w-full h-full object-cover"
              />
            ) : (
              // Placeholder
              <PlaceholderPortrait npc={npc} emotion={emotion} />
            )}
          </div>

          {/* Emotion indicator glow */}
          {emotion !== 'neutral' && (
            <div
              className={cn(
                'absolute inset-0 pointer-events-none opacity-20 rounded-lg',
                emotion === 'happy' && 'bg-sage-400',
                emotion === 'angry' && 'bg-crimson-400',
                emotion === 'sad' && 'bg-sky-400',
                emotion === 'suspicious' && 'bg-amber-400',
                emotion === 'worried' && 'bg-amber-300',
                emotion === 'determined' && 'bg-bronze-400',
                emotion === 'thoughtful' && 'bg-sky-300'
              )}
            />
          )}
        </div>

        {/* Name label */}
        {showName && (
          <div className={cn(nameLabelVariants({ size }), 'relative')}>
            <span className="text-obsidian-800 font-semibold">{npc.name}</span>
            {npc.title && (
              <span className="block text-obsidian-500 text-xs italic">"{npc.title}"</span>
            )}
          </div>
        )}
      </div>
    );
  }
);

NPCPortrait.displayName = 'NPCPortrait';

/**
 * CSS keyframes for breathing animation
 * Add this to your global styles or Tailwind config
 */
export const breatheKeyframes = `
@keyframes breathe {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.015);
  }
}
`;

export { portraitFrameVariants, portraitImageVariants, nameLabelVariants };
