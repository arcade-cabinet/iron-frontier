/**
 * CharacterPanel - Fallout/Western themed RPG stats overlay.
 *
 * Displays player attributes (S.P.E.C.I.A.L-style with Western naming),
 * skills with visual bars, level/XP progress, skill points status,
 * earned perks, and equipment bonuses.
 *
 * Matches the warm dark-tinted Pip-Boy aesthetic with amber accents.
 */

import * as React from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { Text } from "@/components/ui";
import { gameStore } from "@/src/game/store";
import type { PlayerAttributes, PlayerSkills } from "@/src/game/store/types";

// ---------------------------------------------------------------------------
// Prop types
// ---------------------------------------------------------------------------

export interface CharacterPanelProps {
  /** Whether the panel is visible */
  visible: boolean;
  /** Called when the panel should close */
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Theme constants (matching ShopPanel / global HUD)
// ---------------------------------------------------------------------------

const AMBER = "#D4A855";
const AMBER_DIM = "#8B7034";
const AMBER_FAINT = "#D4A85530";
const AMBER_DARK = "#3D3118";
const BG_DARK = "#1A150E";
const BG_SECTION = "#221C12";
const BORDER_AMBER = "#4A3D20";
const GREEN_GOOD = "#4ADE80";
const GOLD = "#FFD700";

// ---------------------------------------------------------------------------
// Attribute & skill metadata
// ---------------------------------------------------------------------------

/**
 * S.P.E.C.I.A.L.-style attribute system with Western RPG naming:
 * G.P.E.C.I.A.L. = Grit, Perception, Endurance, Charisma, Intelligence, Agility, Luck
 */
const ATTRIBUTE_ENTRIES: {
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

const SKILL_ENTRIES: { key: keyof PlayerSkills; label: string }[] = [
  { key: "guns", label: "Guns" },
  { key: "melee", label: "Melee" },
  { key: "lockpick", label: "Lockpick" },
  { key: "speech", label: "Speech" },
  { key: "repair", label: "Repair" },
  { key: "medicine", label: "Medicine" },
  { key: "survival", label: "Survival" },
  { key: "barter", label: "Barter" },
];

// ---------------------------------------------------------------------------
// Perk definitions (basic set)
// ---------------------------------------------------------------------------

interface Perk {
  id: string;
  name: string;
  icon: string;
  description: string;
  minLevel: number;
}

const PERKS: Perk[] = [
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

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** S.P.E.C.I.A.L-style attribute row with large letter, name, value, and bar. */
function AttributeRow({
  abbrev,
  label,
  description,
  value,
  max,
}: {
  abbrev: string;
  label: string;
  description: string;
  value: number;
  max: number;
}) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  // Color-code based on stat level
  const barColor =
    value <= 3 ? "#EF4444" : value <= 5 ? AMBER : value <= 7 ? AMBER_DIM : GREEN_GOOD;

  return (
    <View style={styles.attrRow}>
      <View style={styles.attrLetterBox}>
        <Text style={styles.attrLetter}>{abbrev}</Text>
      </View>
      <View style={styles.attrContent}>
        <View style={styles.attrHeader}>
          <Text style={styles.attrLabel}>{label}</Text>
          <Text style={styles.attrValue}>{value}</Text>
        </View>
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: barColor }]} />
          {/* Pip markers at each unit */}
          {Array.from({ length: max }).map((_, i) => (
            <View key={i} style={[styles.barPip, { left: `${((i + 1) / max) * 100}%` }]} />
          ))}
        </View>
        <Text style={styles.attrDesc}>{description}</Text>
      </View>
    </View>
  );
}

/** Skill row with name, value, and progress bar. */
function SkillRow({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;

  return (
    <View style={styles.skillRow}>
      <View style={styles.skillHeader}>
        <Text style={styles.skillLabel}>{label}</Text>
        <Text style={styles.skillValue}>{value}</Text>
      </View>
      <View style={styles.barTrackThin}>
        <View style={[styles.barFillThin, { width: `${pct}%` }]} />
      </View>
    </View>
  );
}

/** XP progress bar */
function XPBar({ xp, xpToNext }: { xp: number; xpToNext: number }) {
  const pct = xpToNext > 0 ? Math.min((xp / xpToNext) * 100, 100) : 0;

  return (
    <View style={styles.xpSection}>
      <View style={styles.xpHeader}>
        <Text style={styles.xpLabel}>EXPERIENCE</Text>
        <Text style={styles.xpValue}>
          {xp} / {xpToNext}
        </Text>
      </View>
      <View style={styles.xpBarTrack}>
        <View style={[styles.xpBarFill, { width: `${pct}%` }]} />
      </View>
      <Text style={styles.xpPercent}>{Math.round(pct)}% TO NEXT LEVEL</Text>
    </View>
  );
}

/** Section header with amber accent line. */
function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionLine} />
    </View>
  );
}

/** Perk row */
function PerkRow({ perk, earned }: { perk: Perk; earned: boolean }) {
  return (
    <View style={[styles.perkRow, !earned && { opacity: 0.35 }]}>
      <View style={styles.perkIcon}>
        <Text style={styles.perkIconText}>{perk.icon}</Text>
      </View>
      <View style={styles.perkContent}>
        <Text style={styles.perkName}>{perk.name}</Text>
        <Text style={styles.perkDesc}>{perk.description}</Text>
      </View>
      {earned ? (
        <Text style={styles.perkEarned}>ACTIVE</Text>
      ) : (
        <Text style={styles.perkLocked}>LV {perk.minLevel}</Text>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function CharacterPanel({ visible, onClose }: CharacterPanelProps) {
  const playerName = gameStore((s) => s.playerName);
  const playerStats = gameStore((s) => s.playerStats);
  const equipment = gameStore((s) => s.equipment);
  const getEquipmentBonuses = gameStore((s) => s.getEquipmentBonuses);

  const bonuses = React.useMemo(() => getEquipmentBonuses(), [equipment, getEquipmentBonuses]);

  if (!visible) return null;

  const { level, xp, xpToNext, attributes, skills, gold } = playerStats;

  // Simulate skill points (based on level, 2 per level after 1)
  const totalSkillPoints = Math.max(0, (level - 1) * 2);
  const usedSkillPoints =
    Object.values(skills).reduce((a, b) => a + b, 0) - SKILL_ENTRIES.length * 15;
  const availableSkillPoints = Math.max(0, totalSkillPoints - usedSkillPoints);

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(150)}
        style={StyleSheet.absoluteFill}
        pointerEvents="box-none"
      >
        {/* Dismiss backdrop */}
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.panelContainer} pointerEvents="auto">
          <View style={styles.panel}>
            {/* ---- Header ---- */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text style={styles.headerName}>{playerName || "STRANGER"}</Text>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelLabel}>LV</Text>
                  <Text style={styles.levelValue}>{level}</Text>
                </View>
              </View>
              <View style={styles.headerRight}>
                <Text style={styles.goldDisplay}>$ {gold}</Text>
                <Pressable onPress={onClose} style={styles.closeBtn}>
                  <Text style={styles.closeBtnText}>[X]</Text>
                </Pressable>
              </View>
            </View>

            {/* ---- XP Bar ---- */}
            <XPBar xp={xp} xpToNext={xpToNext} />

            {/* ---- Skill Points Banner ---- */}
            {availableSkillPoints > 0 && (
              <View style={styles.skillPointsBanner}>
                <Text style={styles.skillPointsText}>
                  {availableSkillPoints} SKILL POINT{availableSkillPoints !== 1 ? "S" : ""}{" "}
                  AVAILABLE
                </Text>
              </View>
            )}

            <View style={styles.separator} />

            {/* ---- Scrollable body ---- */}
            <Animated.ScrollView
              style={styles.scrollBody}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* G.P.E.C.I.A.L. Attributes */}
              <SectionHeader title="G.P.E.C.I.A.L." />
              {ATTRIBUTE_ENTRIES.map(({ key, label, abbrev, description }) => (
                <AttributeRow
                  key={key}
                  abbrev={abbrev}
                  label={label}
                  description={description}
                  value={attributes[key]}
                  max={10}
                />
              ))}

              <View style={styles.separator} />

              {/* Skills */}
              <SectionHeader title="SKILLS" />
              {SKILL_ENTRIES.map(({ key, label }) => (
                <SkillRow key={key} label={label} value={skills[key]} max={100} />
              ))}

              {/* Equipment bonuses */}
              {(bonuses.damage > 0 || bonuses.defense > 0 || bonuses.accuracy > 0) && (
                <>
                  <View style={styles.separator} />
                  <SectionHeader title="EQUIPMENT BONUSES" />
                  {bonuses.damage > 0 && (
                    <View style={styles.bonusRow}>
                      <Text style={styles.bonusLabel}>Damage</Text>
                      <Text style={styles.bonusValue}>+{bonuses.damage}</Text>
                    </View>
                  )}
                  {bonuses.defense > 0 && (
                    <View style={styles.bonusRow}>
                      <Text style={styles.bonusLabel}>Defense</Text>
                      <Text style={styles.bonusValue}>+{bonuses.defense}</Text>
                    </View>
                  )}
                  {bonuses.accuracy > 0 && (
                    <View style={styles.bonusRow}>
                      <Text style={styles.bonusLabel}>Accuracy</Text>
                      <Text style={styles.bonusValue}>+{bonuses.accuracy}</Text>
                    </View>
                  )}
                </>
              )}

              {/* Perks */}
              <View style={styles.separator} />
              <SectionHeader title="PERKS" />
              {PERKS.map((perk) => (
                <PerkRow key={perk.id} perk={perk} earned={level >= perk.minLevel} />
              ))}
            </Animated.ScrollView>

            {/* ---- Footer ---- */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>[C] CLOSE</Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  panelContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: "85%",
    maxWidth: 500,
    paddingVertical: 16,
    paddingLeft: 16,
    paddingRight: 16,
    justifyContent: "center",
  },
  panel: {
    backgroundColor: BG_DARK,
    borderWidth: 1,
    borderColor: BORDER_AMBER,
    overflow: "hidden",
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: BG_SECTION,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_AMBER,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerName: {
    color: AMBER,
    fontSize: 18,
    fontFamily: Platform.select({ web: "monospace", default: undefined }),
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  levelBadge: {
    flexDirection: "row",
    alignItems: "baseline",
    backgroundColor: "rgba(212,168,85,0.12)",
    borderWidth: 1,
    borderColor: BORDER_AMBER,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 4,
  },
  levelLabel: {
    color: AMBER_DIM,
    fontSize: 10,
    fontFamily: Platform.select({ web: "monospace", default: undefined }),
    letterSpacing: 1,
  },
  levelValue: {
    color: AMBER,
    fontSize: 16,
    fontFamily: Platform.select({ web: "monospace", default: undefined }),
    fontWeight: "700",
  },
  goldDisplay: {
    color: GOLD,
    fontSize: 14,
    fontFamily: Platform.select({ web: "monospace", default: undefined }),
    fontWeight: "700",
  },
  closeBtn: {
    minHeight: 44,
    minWidth: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnText: {
    color: AMBER_DIM,
    fontSize: 14,
    fontFamily: Platform.select({ web: "monospace", default: undefined }),
    fontWeight: "700",
  },

  // XP Section
  xpSection: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  xpHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  xpLabel: {
    color: AMBER_DIM,
    fontSize: 10,
    fontFamily: Platform.select({ web: "monospace", default: undefined }),
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  xpValue: {
    color: AMBER,
    fontSize: 12,
    fontFamily: Platform.select({ web: "monospace", default: undefined }),
  },
  xpBarTrack: {
    height: 8,
    backgroundColor: AMBER_DARK,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: BORDER_AMBER,
  },
  xpBarFill: {
    height: "100%",
    backgroundColor: AMBER,
  },
  xpPercent: {
    color: AMBER_DIM,
    fontSize: 9,
    fontFamily: Platform.select({ web: "monospace", default: undefined }),
    letterSpacing: 1,
    marginTop: 3,
    textAlign: "center",
  },

  // Skill Points Banner
  skillPointsBanner: {
    backgroundColor: "rgba(74,222,128,0.15)",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: GREEN_GOOD,
    paddingVertical: 6,
    alignItems: "center",
  },
  skillPointsText: {
    color: GREEN_GOOD,
    fontSize: 11,
    fontFamily: Platform.select({ web: "monospace", default: undefined }),
    fontWeight: "700",
    letterSpacing: 2,
  },

  // Separator
  separator: {
    height: 1,
    backgroundColor: BORDER_AMBER,
    marginHorizontal: 16,
  },

  // Section header
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
    marginTop: 6,
  },
  sectionTitle: {
    color: AMBER,
    fontSize: 11,
    fontFamily: Platform.select({ web: "monospace", default: undefined }),
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: BORDER_AMBER,
  },

  // Attribute rows (S.P.E.C.I.A.L.)
  attrRow: {
    flexDirection: "row",
    marginBottom: 10,
    gap: 10,
  },
  attrLetterBox: {
    width: 28,
    height: 28,
    borderWidth: 1,
    borderColor: AMBER,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(212,168,85,0.08)",
  },
  attrLetter: {
    color: AMBER,
    fontSize: 16,
    fontFamily: Platform.select({ web: "monospace", default: undefined }),
    fontWeight: "700",
  },
  attrContent: {
    flex: 1,
  },
  attrHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 3,
  },
  attrLabel: {
    color: AMBER,
    fontSize: 13,
    fontFamily: Platform.select({ web: "monospace", default: undefined }),
    fontWeight: "600",
  },
  attrValue: {
    color: AMBER,
    fontSize: 14,
    fontFamily: Platform.select({ web: "monospace", default: undefined }),
    fontWeight: "700",
  },
  attrDesc: {
    color: AMBER_DIM,
    fontSize: 9,
    fontFamily: Platform.select({ web: "monospace", default: undefined }),
    marginTop: 2,
  },

  // Bar (thick, for attributes)
  barTrack: {
    height: 6,
    backgroundColor: AMBER_DARK,
    overflow: "hidden",
    position: "relative",
  },
  barFill: {
    height: "100%",
    backgroundColor: AMBER,
  },
  barPip: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: "rgba(26,21,14,0.7)",
  },

  // Bar (thin, for skills)
  barTrackThin: {
    height: 3,
    backgroundColor: AMBER_DARK,
    overflow: "hidden",
  },
  barFillThin: {
    height: "100%",
    backgroundColor: AMBER,
  },

  // Skill rows
  skillRow: {
    marginBottom: 8,
  },
  skillHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 3,
  },
  skillLabel: {
    color: AMBER,
    fontSize: 12,
    fontFamily: Platform.select({ web: "monospace", default: undefined }),
  },
  skillValue: {
    color: AMBER,
    fontSize: 12,
    fontFamily: Platform.select({ web: "monospace", default: undefined }),
    fontWeight: "700",
  },

  // Bonus rows
  bonusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  bonusLabel: {
    color: AMBER_DIM,
    fontSize: 13,
    fontFamily: Platform.select({ web: "monospace", default: undefined }),
  },
  bonusValue: {
    color: GREEN_GOOD,
    fontSize: 13,
    fontFamily: Platform.select({ web: "monospace", default: undefined }),
    fontWeight: "700",
  },

  // Perk rows
  perkRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(212,168,85,0.08)",
    gap: 10,
  },
  perkIcon: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: AMBER_DIM,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(212,168,85,0.06)",
  },
  perkIconText: {
    color: AMBER,
    fontSize: 14,
    fontFamily: Platform.select({ web: "monospace", default: undefined }),
    fontWeight: "700",
  },
  perkContent: {
    flex: 1,
  },
  perkName: {
    color: AMBER,
    fontSize: 12,
    fontFamily: Platform.select({ web: "monospace", default: undefined }),
    fontWeight: "600",
  },
  perkDesc: {
    color: AMBER_DIM,
    fontSize: 9,
    fontFamily: Platform.select({ web: "monospace", default: undefined }),
    marginTop: 1,
  },
  perkEarned: {
    color: GREEN_GOOD,
    fontSize: 9,
    fontFamily: Platform.select({ web: "monospace", default: undefined }),
    fontWeight: "700",
    letterSpacing: 1,
  },
  perkLocked: {
    color: AMBER_DIM,
    fontSize: 9,
    fontFamily: Platform.select({ web: "monospace", default: undefined }),
    letterSpacing: 1,
  },

  // Scrollable body
  scrollBody: {
    flexShrink: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  // Footer
  footer: {
    borderTopWidth: 1,
    borderTopColor: BORDER_AMBER,
    paddingVertical: 8,
    alignItems: "center",
    backgroundColor: BG_SECTION,
  },
  footerText: {
    color: AMBER_DIM,
    fontSize: 11,
    fontFamily: Platform.select({ web: "monospace", default: undefined }),
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});
