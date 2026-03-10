import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { DamageNumberData } from "@/src/game/engine/combat";

export function DamageNumber({ data }: { data: DamageNumberData }) {
  const meshRef = useRef<THREE.Sprite>(null);
  const materialRef = useRef<THREE.SpriteMaterial>(null);
  const startY = data.position.y;

  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 64;
    const ctx = canvas.getContext("2d")!;

    const displayText = data.label ?? String(data.value);

    ctx.font = data.label
      ? "bold 40px monospace"
      : data.isCritical
        ? "bold 48px monospace"
        : "bold 36px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 4;
    ctx.strokeText(displayText, 64, 32);

    ctx.fillStyle = data.label ? "#FFD700" : data.isCritical ? "#FFD700" : "#FFFFFF";
    ctx.fillText(displayText, 64, 32);

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, [data.value, data.isCritical, data.label]);

  useFrame(() => {
    if (!meshRef.current || !materialRef.current) return;

    const elapsed = (performance.now() - data.createdAt) / 1000;
    const progress = elapsed / data.duration;

    if (progress >= 1) {
      materialRef.current.opacity = 0;
      return;
    }

    meshRef.current.position.y = startY + elapsed * 1.5;

    const scale = data.label || data.isCritical ? 0.4 + Math.sin(progress * Math.PI) * 0.2 : 0.3;
    meshRef.current.scale.set(scale, scale * 0.5, 1);

    materialRef.current.opacity = 1 - progress * progress;
  });

  return (
    <sprite ref={meshRef} position={[data.position.x, data.position.y, data.position.z]}>
      <spriteMaterial
        ref={materialRef}
        map={texture}
        transparent
        depthTest={false}
        depthWrite={false}
      />
    </sprite>
  );
}
