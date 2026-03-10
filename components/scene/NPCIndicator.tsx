/**
 * NPCIndicator - Floating indicators above NPCs in the 3D scene.
 *
 * Renders contextual markers above NPC entities:
 * - "!" (gold exclamation) for quest-giving NPCs
 * - "?" (gold question mark) for quest turn-in NPCs
 * - "..." (speech bubble dots) for talkable NPCs
 *
 * Queries the game store for NPC and quest state to determine
 * which indicator to show. Placed inside the R3F Canvas.
 */

import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type * as THREE from "three";

import { useGameStoreShallow } from "@/hooks/useGameStore";
import { getNPCById } from "@/src/game/data/npcs";
import type { NPC } from "@/src/game/store/types";
import { gameStore } from "@/src/game/store/webGameStore";
import { rngTick, scopedRNG } from "../../src/game/lib/prng.ts";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const QUEST_GOLD = "#D4A049";
const TALK_WHITE = "#C4A882";
const INDICATOR_Y_OFFSET = 2.6; // above NPC head (chibi height ~2.25)
const BOB_SPEED = 2.0;
const BOB_AMPLITUDE = 0.08;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type IndicatorType = "quest_give" | "quest_turnin" | "talk" | null;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Determine which indicator to show for an NPC.
 */
function getIndicatorType(npcId: string): IndicatorType {
  const state = gameStore.getState();

  // Check NPC definition for quest data
  const npcDef = getNPCById(npcId);
  if (!npcDef) return "talk";

  // Check if this NPC is a turn-in target for any active quest objective
  for (const aq of state.activeQuests) {
    const questDef = state.getQuestDefinition(aq.questId);
    if (!questDef) continue;

    const stage = questDef.stages[aq.currentStageIndex];
    if (!stage) continue;

    for (const obj of stage.objectives) {
      const progress = aq.objectiveProgress[obj.id] ?? 0;
      const isComplete = progress >= obj.count;
      if (isComplete) continue;

      // If this objective targets this NPC (talk/deliver)
      if (
        (obj.type === "talk" || obj.type === "deliver") &&
        (obj.target === npcId || obj.deliverTo === npcId)
      ) {
        return "quest_turnin";
      }

      // Check markerTarget for NPC references
      if (obj.markerTarget?.type === "npc" && obj.markerTarget.npcId === npcId) {
        return "quest_turnin";
      }
    }
  }

  // Check if NPC is a quest giver with available quests
  if (npcDef.questGiver && npcDef.questIds && npcDef.questIds.length > 0) {
    // Check if any of their quests haven't been started yet
    const activeQuestIds = state.activeQuests.map((aq) => aq.questId);
    const completedIds = state.completedQuestIds ?? [];

    const hasAvailableQuest = npcDef.questIds.some(
      (qid) => !activeQuestIds.includes(qid) && !completedIds.includes(qid),
    );

    if (hasAvailableQuest) {
      return "quest_give";
    }
  }

  // Default: talkable NPC
  return "talk";
}

// ---------------------------------------------------------------------------
// Single NPC Indicator
// ---------------------------------------------------------------------------

interface SingleIndicatorProps {
  npcId: string;
  position: { x: number; y: number; z: number };
}

function SingleNPCIndicator({ npcId, position }: SingleIndicatorProps) {
  const groupRef = useRef<THREE.Group>(null);
  const animPhase = useRef(scopedRNG("npc", 42, rngTick()) * Math.PI * 2);

  useFrame((_state, delta) => {
    const group = groupRef.current;
    if (!group) return;

    animPhase.current += delta;

    // Bob up and down
    group.position.y =
      position.y + INDICATOR_Y_OFFSET + Math.sin(animPhase.current * BOB_SPEED) * BOB_AMPLITUDE;
    group.position.x = position.x;
    group.position.z = position.z;

    // Billboard toward camera
    group.lookAt(_state.camera.position);
  });

  const indicatorType = useMemo(() => getIndicatorType(npcId), [npcId]);

  // Re-evaluate periodically by using playerRotation as a cheap refresh trigger
  // (This ensures indicators update as quests progress)
  const freshIndicator = useRef(indicatorType);
  useFrame(() => {
    // Only re-evaluate every ~60 frames to avoid perf hit
    if (scopedRNG("npc", 42, rngTick()) < 0.016) {
      freshIndicator.current = getIndicatorType(npcId);
    }
  });

  if (!indicatorType) return null;

  const displayType = freshIndicator.current ?? indicatorType;

  let text: string;
  let color: string;
  let fontSize: number;

  switch (displayType) {
    case "quest_give":
      text = "!";
      color = QUEST_GOLD;
      fontSize = 0.35;
      break;
    case "quest_turnin":
      text = "?";
      color = QUEST_GOLD;
      fontSize = 0.35;
      break;
    case "talk":
      text = "...";
      color = TALK_WHITE;
      fontSize = 0.22;
      break;
    default:
      return null;
  }

  return (
    <group ref={groupRef} position={[position.x, position.y + INDICATOR_Y_OFFSET, position.z]}>
      <Text
        fontSize={fontSize}
        color={color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
        font={undefined}
        fontWeight="bold"
      >
        {text}
      </Text>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Main Component - renders indicators for all visible NPCs
// ---------------------------------------------------------------------------

export function NPCIndicators() {
  const npcs = useGameStoreShallow((s) => s.npcs);

  const visibleNPCs = useMemo(() => {
    return Object.values(npcs).filter((npc: NPC) => npc.isAlive);
  }, [npcs]);

  if (visibleNPCs.length === 0) return null;

  return (
    <group name="npc-indicators">
      {visibleNPCs.map((npc: NPC) => (
        <SingleNPCIndicator key={npc.id} npcId={npc.id} position={npc.position} />
      ))}
    </group>
  );
}
