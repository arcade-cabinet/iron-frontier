export type CombatActionType =
  | 'attack'
  | 'aimed_shot'
  | 'defend'
  | 'reload'
  | 'use_item'
  | 'flee'
  | 'quick_draw'
  | 'overwatch'
  | 'first_aid'
  | 'intimidate';

export interface Combatant {
  definitionId: string;
  name: string;
  isPlayer: boolean;
  health: number;
  maxHealth: number;
  actionPoints: number;
  maxActionPoints: number;
  position: { q: number; r: number };
  statusEffects: any[];
  weaponId: string;
  ammoInClip: number;
  baseDamage?: number;
  armor?: number;
  accuracy?: number;
  evasion?: number;
  level?: number;
  isActive: boolean;
  hasActed: boolean;
  isDead: boolean;
}

export interface CombatAction {
  type: CombatActionType;
  actorId: string;
  targetId?: string;
  itemId?: string;
  apCost: number;
  timestamp: number;
}

export interface CombatResult {
  action: CombatAction;
  success: boolean;
  damage?: number;
  isCritical?: boolean;
  wasDodged?: boolean;
  message: string;
  targetHealthRemaining?: number;
}

export type CombatPhase = 'player_turn' | 'enemy_turn' | 'victory' | 'defeat' | 'fled';

export interface CombatState {
  encounterId: string;
  phase: CombatPhase;
  combatants: Combatant[];
  turnOrder: string[];
  currentTurnIndex: number;
  round: number;
  log: CombatResult[];
  startedAt: number;
  selectedAction?: CombatActionType;
  selectedTargetId?: string;
}
