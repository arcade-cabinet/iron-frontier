export type GamePhase =
  | 'title'
  | 'loading'
  | 'playing'
  | 'paused'
  | 'dialogue'
  | 'inventory'
  | 'travel'
  | 'combat'
  | 'game_over'
  | 'puzzle';

export type PanelType = 'inventory' | 'quests' | 'settings' | 'menu' | 'character';

export interface Notification {
  id: string;
  type: 'item' | 'xp' | 'quest' | 'level' | 'info' | 'warning';
  message: string;
  timestamp: number;
}
