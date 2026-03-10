export interface InitGameOptions {
  playerName?: string;
  seed?: string;
  difficulty?: 'easy' | 'normal' | 'hard';
}

export const STARTING_LOCATION = 'dusty_springs';
export const STARTING_WORLD = 'frontier_territory';
export const AUTOSAVE_INTERVAL_MS = 5 * 60 * 1000;
export const TICK_INTERVAL_MS = 100;
export const LOW_HEALTH_THRESHOLD = 0.25;
export const IDLE_PROVISION_RATE = 0.25;
export const SURVIVAL_TICK_INTERVAL_MS = 1000;
export const TUTORIAL_QUEST_ID = 'main_the_inheritance';
export const MORNING_HOUR = 8;
