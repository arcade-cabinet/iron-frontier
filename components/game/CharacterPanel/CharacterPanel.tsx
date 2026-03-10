import * as React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { Text } from "@/components/ui";
import { gameStore } from "@/src/game/store";

import { ATTRIBUTE_ENTRIES, PERKS, SKILL_ENTRIES } from "./data.ts";
import { AttributeRow, PerkRow, SectionHeader, SkillRow, XPBar } from "./StatRows.tsx";
import { styles } from "./styles.ts";

export interface CharacterPanelProps {
  visible: boolean;
  onClose: () => void;
}

export function CharacterPanel({ visible, onClose }: CharacterPanelProps) {
  const playerName = gameStore((s) => s.playerName);
  const playerStats = gameStore((s) => s.playerStats);
  const equipment = gameStore((s) => s.equipment);
  const getEquipmentBonuses = gameStore((s) => s.getEquipmentBonuses);

  const bonuses = React.useMemo(() => getEquipmentBonuses(), [equipment, getEquipmentBonuses]);

  if (!visible) return null;

  const { level, xp, xpToNext, attributes, skills, gold } = playerStats;

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
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.panelContainer} pointerEvents="auto">
          <View style={styles.panel}>
            {/* Header */}
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

            <XPBar xp={xp} xpToNext={xpToNext} />

            {availableSkillPoints > 0 && (
              <View style={styles.skillPointsBanner}>
                <Text style={styles.skillPointsText}>
                  {availableSkillPoints} SKILL POINT{availableSkillPoints !== 1 ? "S" : ""}{" "}
                  AVAILABLE
                </Text>
              </View>
            )}

            <View style={styles.separator} />

            <Animated.ScrollView
              style={styles.scrollBody}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
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

              <SectionHeader title="SKILLS" />
              {SKILL_ENTRIES.map(({ key, label }) => (
                <SkillRow key={key} label={label} value={skills[key]} max={100} />
              ))}

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

              <View style={styles.separator} />
              <SectionHeader title="PERKS" />
              {PERKS.map((perk) => (
                <PerkRow key={perk.id} perk={perk} earned={level >= perk.minLevel} />
              ))}
            </Animated.ScrollView>

            <View style={styles.footer}>
              <Text style={styles.footerText}>[C] CLOSE</Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}
