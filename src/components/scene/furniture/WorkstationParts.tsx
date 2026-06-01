import * as THREE from 'three';
import { materials } from '../materials';
import { DeskSucculent, DeskMug, DeskNotebook, PenCup } from './decor/SceneDecor';

export type ChairStyle = 'mesh' | 'tan' | 'cream' | 'white' | 'sage' | 'forest';
export type DeskPropType = 'succulent' | 'mug' | 'notebook' | 'pen' | 'none';

export function TFrameLegs({ points }: { points: [number, number][] }) {
  return (
    <>
      {points.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 0.04, 0]} castShadow material={materials.deskLeg}>
            <boxGeometry args={[0.24, 0.05, 0.05]} />
          </mesh>
          <mesh position={[0, 0.04, 0]} rotation={[0, Math.PI / 2, 0]} castShadow material={materials.deskLeg}>
            <boxGeometry args={[0.24, 0.05, 0.05]} />
          </mesh>
          <mesh position={[0, 0.24, 0]} castShadow material={materials.deskLeg}>
            <boxGeometry args={[0.038, 0.36, 0.038]} />
          </mesh>
          <mesh position={[0, 0.44, 0]} castShadow material={materials.metal}>
            <boxGeometry args={[0.05, 0.04, 0.05]} />
          </mesh>
        </group>
      ))}
    </>
  );
}

export const StandingLegs = TFrameLegs;

export function CurvedMonitorGroup({ dual = false, thin = true }: { dual?: boolean; thin?: boolean }) {
  const h = thin ? 0.26 : 0.34;
  const w = thin ? 0.46 : 0.5;
  const d = thin ? 0.018 : 0.045;
  return (
    <group position={[0, 0.64, -0.14]}>
      <MonitorScreen x={dual ? -0.26 : 0} w={w} h={h} d={d} />
      {dual && <MonitorScreen x={0.26} w={w} h={h} d={d} />}
      {!dual && <pointLight position={[0, 0, 0.08]} intensity={0.14} color="#a8c8e8" distance={1.2} />}
    </group>
  );
}

function MonitorScreen({ x, w, h, d }: { x: number; w: number; h: number; d: number }) {
  return (
    <group position={[x, 0, 0]}>
      <mesh castShadow material={materials.monitorBezel}>
        <boxGeometry args={[w, h + 0.06, d + 0.02]} />
      </mesh>
      <mesh position={[0, 0.015, d / 2 + 0.004]} material={materials.monitor}>
        <boxGeometry args={[w * 0.9, h, 0.008]} />
      </mesh>
      <mesh position={[0, -(h / 2 + 0.04), 0]} material={materials.metal}>
        <boxGeometry args={[0.06, 0.05, 0.04]} />
      </mesh>
    </group>
  );
}

export function KeyboardMouse({
  position = [0, 0.44, 0.1],
}: {
  position?: [number, number, number];
}) {
  const [x, y, z] = position;
  return (
    <group position={[x, y, z]}>
      <mesh material={materials.monitor}>
        <boxGeometry args={[0.24, 0.01, 0.09]} />
      </mesh>
      <mesh position={[0.16, 0.008, 0.05]} material={materials.metal}>
        <boxGeometry args={[0.038, 0.012, 0.055]} />
      </mesh>
    </group>
  );
}

export function DeskPropsSlot({
  type,
  offset,
}: {
  type: DeskPropType;
  offset: [number, number, number];
}) {
  const [x, y, z] = offset;
  if (type === 'succulent') return <DeskSucculent position={[x, y, z]} />;
  if (type === 'mug') return <DeskMug position={[x, y, z]} />;
  if (type === 'notebook') return <DeskNotebook position={[x, y, z]} />;
  if (type === 'pen') return <PenCup position={[x, y, z]} />;
  return null;
}

export function ErgonomicChairMesh({
  position,
  rotation,
  color,
  meshBack = false,
}: {
  position: [number, number, number];
  rotation: number;
  color: THREE.MeshStandardMaterial;
  meshBack?: boolean;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.26, 0]} castShadow material={color}>
        <boxGeometry args={[0.36, 0.05, 0.34]} />
      </mesh>
      <mesh position={[0, 0.44, -0.12]} castShadow material={color}>
        <boxGeometry args={[0.36, 0.32, 0.05]} />
      </mesh>
      {meshBack && (
        <mesh position={[0, 0.4, -0.14]} material={materials.metal}>
          <boxGeometry args={[0.32, 0.24, 0.015]} />
        </mesh>
      )}
      <mesh position={[0, 0.1, 0]} material={materials.metal}>
        <cylinderGeometry args={[0.026, 0.032, 0.065, 8]} />
      </mesh>
      {[[-0.1, -0.1], [0.1, -0.1], [-0.1, 0.1], [0.1, 0.1]].map(([cx, cz], i) => (
        <mesh key={i} position={[cx, 0.12, cz]} material={materials.metal}>
          <cylinderGeometry args={[0.017, 0.017, 0.2, 5]} />
        </mesh>
      ))}
    </group>
  );
}

export function VintageGlobe() {
  return (
    <group position={[0, 0.54, 0]}>
      <mesh castShadow material={materials.sageDark}>
        <sphereGeometry args={[0.12, 18, 16]} />
      </mesh>
      <mesh position={[0, 0.4, 0]} material={materials.woodDark}>
        <cylinderGeometry args={[0.025, 0.03, 0.08, 8]} />
      </mesh>
      <mesh position={[0, 0.46, 0]} rotation={[Math.PI / 2, 0, 0]} material={materials.woodLight}>
        <torusGeometry args={[0.13, 0.009, 8, 24]} />
      </mesh>
      <mesh position={[0, 0.58, 0.02]} material={materials.metal}>
        <boxGeometry args={[0.16, 0.025, 0.02]} />
      </mesh>
    </group>
  );
}
