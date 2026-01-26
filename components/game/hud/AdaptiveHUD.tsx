// AdaptiveHUD.tsx - Adaptive HUD that switches between modes
// Automatically selects the appropriate HUD based on screen size and orientation
import React from 'react';
import { useWindowDimensions } from 'react-native';
import { CompactHUD } from './CompactHUD';
import { FullHUD } from './FullHUD';
import { MinimalHUD } from './MinimalHUD';

interface Quest {
  id: string;
  title: string;
  progress: string;
}

interface AdaptiveHUDProps {
  playerName: string;
  level: number;
  health: number;
  maxHealth: number;
  xp: number;
  xpToNextLevel: number;
  stamina: number;
  maxStamina: number;
  gold: number;
  location: string;
  activeQuests: Quest[];
}

export function AdaptiveHUD(props: AdaptiveHUDProps) {
  const { width, height } = useWindowDimensions();
  const isPortrait = height > width;
  const isTablet = Math.min(width, height) >= 768;

  // Tablet or foldable unfolded: Full HUD
  if (isTablet) {
    return <FullHUD {...props} />;
  }

  // Phone landscape: Compact HUD
  if (!isPortrait) {
    return (
      <CompactHUD
        playerName={props.playerName}
        level={props.level}
        health={props.health}
        maxHealth={props.maxHealth}
        xp={props.xp}
        xpToNextLevel={props.xpToNextLevel}
        gold={props.gold}
        currentQuest={props.activeQuests[0]?.title}
      />
    );
  }

  // Phone portrait: Minimal HUD
  return (
    <MinimalHUD
      playerName={props.playerName}
      level={props.level}
      health={props.health}
      maxHealth={props.maxHealth}
      gold={props.gold}
    />
  );
}
