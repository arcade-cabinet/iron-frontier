import { Platform, StyleSheet } from "react-native";

import {
  AMBER,
  AMBER_DARK,
  AMBER_DIM,
  BG_DARK,
  BG_SECTION,
  BORDER_AMBER,
  GOLD,
  GREEN_GOOD,
} from "./theme.ts";

export const panelStyles = StyleSheet.create({
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
