export interface PlayerAttributes {
  grit: number;
  perception: number;
  endurance: number;
  charisma: number;
  intelligence: number;
  agility: number;
  luck: number;
}

export interface PlayerSkills {
  guns: number;
  melee: number;
  lockpick: number;
  speech: number;
  repair: number;
  medicine: number;
  survival: number;
  barter: number;
}

export interface PlayerStats {
  health: number;
  maxHealth: number;
  stamina: number;
  maxStamina: number;
  xp: number;
  xpToNext: number;
  level: number;
  gold: number;
  ivrcScript: number;
  reputation: number;
  attributes: PlayerAttributes;
  skills: PlayerSkills;
}
