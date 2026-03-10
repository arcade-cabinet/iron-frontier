import type { PlayerAttributes, PlayerSkills } from "@/src/game/store/types";

export const ATTRIBUTE_ENTRIES: {
  key: keyof PlayerAttributes;
  label: string;
  abbrev: string;
  description: string;
}[] = [
  { key: "grit", label: "Grit", abbrev: "G", description: "Raw toughness and willpower" },
  { key: "perception", label: "Perception", abbrev: "P", description: "Awareness and aim" },
  { key: "endurance", label: "Endurance", abbrev: "E", description: "Stamina and resilience" },
  { key: "charisma", label: "Charisma", abbrev: "C", description: "Speech and persuasion" },
  {
    key: "intelligence",
    label: "Intelligence",
    abbrev: "I",
    description: "Problem solving and crafting",
  },
  { key: "agility", label: "Agility", abbrev: "A", description: "Speed and reflexes" },
  { key: "luck", label: "Luck", abbrev: "L", description: "Fortune and critical chance" },
];

export const SKILL_ENTRIES: { key: keyof PlayerSkills; label: string }[] = [
  { key: "guns", label: "Guns" },
  { key: "melee", label: "Melee" },
  { key: "lockpick", label: "Lockpick" },
  { key: "speech", label: "Speech" },
  { key: "repair", label: "Repair" },
  { key: "medicine", label: "Medicine" },
  { key: "survival", label: "Survival" },
  { key: "barter", label: "Barter" },
];

export interface Perk {
  id: string;
  name: string;
  icon: string;
  description: string;
  minLevel: number;
}

export const PERKS: Perk[] = [
  { id: "steady_hand", name: "Steady Hand", icon: "+", description: "+10% accuracy", minLevel: 2 },
  {
    id: "quick_draw",
    name: "Quick Draw",
    icon: ">",
    description: "Faster weapon swap",
    minLevel: 4,
  },
  {
    id: "tough_hide",
    name: "Tough Hide",
    icon: "#",
    description: "+5 damage resistance",
    minLevel: 6,
  },
  {
    id: "silver_tongue",
    name: "Silver Tongue",
    icon: "*",
    description: "+15 speech skill",
    minLevel: 8,
  },
  { id: "deadeye", name: "Deadeye", icon: "@", description: "+20% crit chance", minLevel: 10 },
];
