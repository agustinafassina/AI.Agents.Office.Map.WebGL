import { materials } from '../../materials';

export function StringLights({
  start,
  count,
  spacing,
  height = 1.55,
  depth = -0.35,
}: {
  start: [number, number, number];
  count: number;
  spacing: number;
  height?: number;
  depth?: number;
}) {
  const [sx, , sz] = start;
  const z = sz + depth;
  const span = (count - 1) * spacing;
  return (
    <group>
      <mesh position={[sx + span / 2, height + 0.05, z - 0.02]} material={materials.metal}>
        <boxGeometry args={[span + 0.4, 0.012, 0.012]} />
      </mesh>
      {Array.from({ length: count }, (_, i) => (
        <group key={i} position={[sx + i * spacing, height, z]}>
          <mesh material={materials.stringLight}>
            <sphereGeometry args={[0.045, 8, 8]} />
          </mesh>
          <pointLight intensity={0.18} color="#ffedb8" distance={2.5} decay={2} />
        </group>
      ))}
    </group>
  );
}

export function ZoneMat({
  position,
  size,
  variant = 'sage',
}: {
  position: [number, number, number];
  size: [number, number];
  variant?: 'sage' | 'jute';
}) {
  const mat = variant === 'sage' ? materials.zoneMatSage : materials.rugWeave;
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[position[0], 0.013, position[2]]} receiveShadow material={mat}>
      <planeGeometry args={size} />
    </mesh>
  );
}

export function DeskSucculent({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.04, 0]} material={materials.plantPot}>
        <cylinderGeometry args={[0.04, 0.045, 0.045, 8]} />
      </mesh>
      <mesh position={[0, 0.085, 0]} castShadow material={materials.plant}>
        <sphereGeometry args={[0.045, 6, 5]} />
      </mesh>
    </group>
  );
}

export function DeskMug({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh material={materials.mug}>
        <cylinderGeometry args={[0.035, 0.038, 0.07, 10]} />
      </mesh>
      <mesh position={[0, 0.035, 0.03]} material={materials.terracotta}>
        <boxGeometry args={[0.05, 0.01, 0.02]} />
      </mesh>
    </group>
  );
}

export function DeskNotebook({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[0, 0.4, 0]}>
      <mesh material={materials.notebook}>
        <boxGeometry args={[0.14, 0.008, 0.1]} />
      </mesh>
      <mesh position={[0, 0.005, 0]} material={materials.sage}>
        <boxGeometry args={[0.1, 0.004, 0.08]} />
      </mesh>
    </group>
  );
}

export function PenCup({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh material={materials.potCeramic}>
        <cylinderGeometry args={[0.03, 0.035, 0.05, 8]} />
      </mesh>
      <mesh position={[0.01, 0.06, 0]} rotation={[0.1, 0, 0.2]} material={materials.metal}>
        <boxGeometry args={[0.004, 0.05, 0.004]} />
      </mesh>
      <mesh position={[-0.01, 0.055, 0.01]} rotation={[0, 0, -0.15]} material={materials.sage}>
        <boxGeometry args={[0.004, 0.045, 0.004]} />
      </mesh>
    </group>
  );
}

export function Terrarium({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh material={materials.woodLight}>
        <cylinderGeometry args={[0.1, 0.11, 0.05, 10]} />
      </mesh>
      <mesh position={[0, 0.11, 0]} material={materials.glass}>
        <sphereGeometry args={[0.095, 10, 8]} />
      </mesh>
      <mesh position={[0, 0.1, 0]} material={materials.plant}>
        <sphereGeometry args={[0.045, 6, 5]} />
      </mesh>
    </group>
  );
}

export function CeramicFloorPlant({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.24, 0]} castShadow material={materials.potCeramic}>
        <cylinderGeometry args={[0.26, 0.28, 0.48, 14]} />
      </mesh>
      <mesh position={[0, 0.65, 0]} castShadow material={materials.plantDark}>
        <boxGeometry args={[0.1, 0.45, 0.08]} />
      </mesh>
      <mesh position={[0.08, 0.95, 0.02]} castShadow material={materials.plant}>
        <boxGeometry args={[0.28, 0.35, 0.14]} />
      </mesh>
      <mesh position={[-0.06, 0.82, -0.04]} castShadow material={materials.plantDark}>
        <boxGeometry args={[0.18, 0.22, 0.1]} />
      </mesh>
    </group>
  );
}

export function WallTextureStripes({
  width,
  height,
  depth,
}: {
  width: number;
  height: number;
  depth: number;
}) {
  const count = Math.floor(width / 0.35);
  return (
    <group>
      {Array.from({ length: count }, (_, i) => (
        <mesh
          key={i}
          position={[-width / 2 + 0.2 + i * 0.35, height / 2, depth]}
          material={materials.wallStripe}
        >
          <boxGeometry args={[0.04, height * 0.9, 0.01]} />
        </mesh>
      ))}
    </group>
  );
}