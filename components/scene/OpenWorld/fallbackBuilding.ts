// fallbackBuilding — Procedural PBR building generator for structure types
// without a registered archetype.

import * as THREE from "three";
import {
  createGlassTexture,
  createPBRClayAdobe,
  createPBRMetalCorrugated,
  createPBRMetalRusted,
  createPBRRustHeavy,
  createPBRStoneRough,
  createPBRWoodAged,
  createPBRWoodPlanks,
  createPBRWoodSiding,
  createWoodTexture,
} from "@/src/game/engine/materials";

// ---------------------------------------------------------------------------
// Structure → Archetype mapping
// ---------------------------------------------------------------------------

export const STRUCTURE_TO_ARCHETYPE: Record<string, string> = {
  saloon_building: "saloon",
  store_building: "general_store",
  office_building: "doctor_office",
  bank_building: "bank",
  hotel_building: "inn",
  church_building: "church",
  telegraph_building: "telegraph_office",
  workshop_building: "blacksmith",
  mine_building: "mining_office",
  stable: "livery",
  // These have no matching archetype — fall through to procedural building
  station_building: "station",
  warehouse: "warehouse",
  mansion: "mansion",
  house: "house",
  cabin: "cabin",
  well: "well",
  water_tower: "water_tower",
  watch_tower: "watch_tower",
  fort: "fort",
};

// ---------------------------------------------------------------------------
// Fallback material configs
// ---------------------------------------------------------------------------

type MaterialConfig = {
  wall: () => THREE.MeshStandardMaterial;
  roof: () => THREE.MeshStandardMaterial;
  trim?: () => THREE.MeshStandardMaterial;
};

const FALLBACK_MATERIALS: Record<string, MaterialConfig> = {
  saloon_building: {
    wall: () => createPBRWoodSiding(),
    roof: () => createPBRMetalCorrugated(),
  },
  store_building: {
    wall: () => createPBRWoodPlanks(),
    roof: () => createPBRMetalCorrugated(),
  },
  office_building: {
    wall: () => createPBRStoneRough(),
    roof: () => createPBRWoodAged(),
  },
  bank_building: {
    wall: () => createPBRStoneRough(),
    roof: () => createPBRMetalRusted(),
    trim: () => createPBRMetalRusted(),
  },
  hotel_building: {
    wall: () => createPBRWoodSiding(),
    roof: () => createPBRWoodAged(),
  },
  church_building: {
    wall: () => createPBRClayAdobe(),
    roof: () => createPBRWoodAged(),
  },
  station_building: {
    wall: () => createPBRStoneRough(),
    roof: () => createPBRMetalCorrugated(),
  },
  stable: {
    wall: () => createPBRWoodPlanks(),
    roof: () => createPBRWoodAged(),
  },
  mansion: {
    wall: () => createPBRClayAdobe(),
    roof: () => createPBRWoodAged(),
    trim: () => createPBRWoodSiding(),
  },
  house: {
    wall: () => createPBRWoodSiding(),
    roof: () => createPBRWoodPlanks(),
  },
  cabin: {
    wall: () => createPBRWoodPlanks(),
    roof: () => createPBRWoodAged(),
  },
  well: {
    wall: () => createPBRStoneRough(),
    roof: () => createPBRWoodAged(),
  },
  water_tower: {
    wall: () => createPBRMetalCorrugated(),
    roof: () => createPBRMetalRusted(),
    trim: () => createPBRWoodAged(),
  },
  warehouse: {
    wall: () => createPBRMetalCorrugated(),
    roof: () => createPBRRustHeavy(),
  },
};

// ---------------------------------------------------------------------------
// Fallback builder
// ---------------------------------------------------------------------------

export function buildFallbackBuilding(structureType: string, importance: number): THREE.Group {
  const group = new THREE.Group();
  group.name = `fallback-${structureType}`;
  const w = 2 + importance * 0.5,
    h = 2 + importance * 0.4;

  const matConfig = FALLBACK_MATERIALS[structureType] ?? {
    wall: () => createWoodTexture("#7B6B5B", "#5A4A3A"),
    roof: () => createWoodTexture("#3A2518", "#2A1A10"),
  };

  // Main body — textured walls
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), matConfig.wall());
  body.position.y = h / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // Roof — textured
  const roof = new THREE.Mesh(new THREE.ConeGeometry(w * 0.75, h * 0.4, 4), matConfig.roof());
  roof.position.y = h + h * 0.2;
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  group.add(roof);

  // Door — dark wood plank
  const doorMat = createWoodTexture("#3A2010", "#251508");
  const door = new THREE.Mesh(new THREE.BoxGeometry(w * 0.18, h * 0.45, 0.05), doorMat);
  door.position.set(0, h * 0.22, w / 2 + 0.025);
  door.name = "door-panel";
  group.add(door);

  // Windows — glass panes on two sides
  const glassMat = createGlassTexture("#C8DDE8");
  const windowGeo = new THREE.BoxGeometry(w * 0.15, h * 0.18, 0.03);
  const windowOffsetY = h * 0.55;

  // Front windows flanking the door
  const winL = new THREE.Mesh(windowGeo, glassMat);
  winL.position.set(-w * 0.28, windowOffsetY, w / 2 + 0.02);
  group.add(winL);
  const winR = new THREE.Mesh(windowGeo, glassMat);
  winR.position.set(w * 0.28, windowOffsetY, w / 2 + 0.02);
  group.add(winR);

  // Side windows
  const winSide = new THREE.Mesh(windowGeo, glassMat);
  winSide.position.set(w / 2 + 0.02, windowOffsetY, 0);
  winSide.rotation.y = Math.PI / 2;
  group.add(winSide);

  // Trim / accent details if configured
  if (matConfig.trim) {
    const trimMat = matConfig.trim();
    // Corner trim posts
    const trimGeo = new THREE.BoxGeometry(0.08, h, 0.08);
    const corners: [number, number][] = [
      [w / 2, w / 2],
      [-w / 2, w / 2],
      [w / 2, -w / 2],
      [-w / 2, -w / 2],
    ];
    for (const [cx, cz] of corners) {
      const post = new THREE.Mesh(trimGeo, trimMat);
      post.position.set(cx, h / 2, cz);
      post.castShadow = true;
      group.add(post);
    }
  }

  return group;
}
