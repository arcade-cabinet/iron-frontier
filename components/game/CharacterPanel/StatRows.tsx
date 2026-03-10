import { View } from "react-native";

import { Text } from "@/components/ui";

import type { Perk } from "./data.ts";
import { styles } from "./styles.ts";
import { AMBER, AMBER_DIM, GREEN_GOOD } from "./theme.ts";

export function AttributeRow({
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
          {Array.from({ length: max }).map((_, i) => (
            <View key={i} style={[styles.barPip, { left: `${((i + 1) / max) * 100}%` }]} />
          ))}
        </View>
        <Text style={styles.attrDesc}>{description}</Text>
      </View>
    </View>
  );
}

export function SkillRow({ label, value, max }: { label: string; value: number; max: number }) {
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

export function XPBar({ xp, xpToNext }: { xp: number; xpToNext: number }) {
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

export function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionLine} />
    </View>
  );
}

export function PerkRow({ perk, earned }: { perk: Perk; earned: boolean }) {
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
