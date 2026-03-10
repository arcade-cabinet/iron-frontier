import { Platform, StyleSheet } from "react-native";

import { AMBER, AMBER_DARK, AMBER_DIM, GREEN_GOOD } from "./theme.ts";

export const statRowStyles = StyleSheet.create({
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
});
