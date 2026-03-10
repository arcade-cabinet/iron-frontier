import { GroundVariation } from "./ground.tsx";
import { DistantRailroad, TelegraphLine, WornFence } from "./structures.tsx";
import { GroundDustWisps, WispyClouds } from "./weather.tsx";
import { CirclingBuzzards, RollingTumbleweeds } from "./wildlife.tsx";
import { Windmill } from "./windmill.tsx";

export interface DesertAtmosphereProps {
  /** PRNG seed for deterministic placement. */
  seed?: string;
  /** Center point for player-relative elements [x, y, z]. */
  townCenter?: [number, number, number];
}

export function DesertAtmosphere({
  seed = "iron-frontier-atmosphere",
  townCenter = [0, 0, 0],
}: DesertAtmosphereProps) {
  const [cx, , cz] = townCenter;

  return (
    <group name="desert-atmosphere">
      {/* Sky enhancements: drifting wispy clouds */}
      <WispyClouds seed={`${seed}:clouds`} />

      {/* Animated wildlife: buzzards circling overhead */}
      <CirclingBuzzards seed={`${seed}:buzzards`} cx={cx} cz={cz} />

      {/* Animated rolling tumbleweeds */}
      <RollingTumbleweeds seed={`${seed}:tumbleweeds`} cx={cx} cz={cz} />

      {/* Ground color variation patches and scattered pebbles */}
      <GroundVariation seed={`${seed}:ground`} cx={cx} cz={cz} />

      {/* Infrastructure / civilization hints */}
      <TelegraphLine seed={`${seed}:telegraph`} cx={cx} cz={cz} />
      <WornFence seed={`${seed}:fence`} cx={cx} cz={cz} />
      <DistantRailroad seed={`${seed}:railroad`} cx={cx} cz={cz} />
      <Windmill position={[cx + 35, 0, cz - 25]} />

      {/* Ambient ground-level dust wisps */}
      <GroundDustWisps seed={`${seed}:dust-wisps`} cx={cx} cz={cz} />
    </group>
  );
}
