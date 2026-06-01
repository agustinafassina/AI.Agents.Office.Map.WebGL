import * as THREE from 'three';
import { materials } from '../materials';
import { DeskSucculent, DeskMug, DeskNotebook, PenCup } from './decor/SceneDecor';

export type ChairStyle = 'mesh' | 'tan' | 'cream' | 'white' | 'sage';
export type DeskPropType = 'succulent' | 'mug' | 'notebook' | 'pen' | 'none';

export function StandingLegs({ points }: { points: [number, number][] }) {
  return (
    <>
      {points.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 0.2, 0]} castShadow material={materials.deskLeg}>
            <boxGeometry args={[0.038, 0.4, 0.038]} />
          </mesh>
          <mesh position={[0, 0.035, 0]} castShadow material={materials.deskLeg}>
            <boxGeometry args={[0.2, 0.035, 0.035]} />
          </mesh>
          <mesh position={[0, 0.035, 0]} rotation={[0, Math.PI / 2, 0]} castShadow material={materials.deskLeg}>
            <boxGeometry args={[0.2, 0.035, 0.035]} />
          </mesh>
        </group>
      ))}
    </>
  );
}

export function CurvedMonitorGroup() {
  return (
    <group position={[0, 0.66, -0.15]}>
      <mesh castShadow material={materials.monitorBezel}>
        <boxGeometry args={[0.58, 0.36, 0.048]} />
      </mesh>
      <mesh position={[0, 0.02, 0.026]} material={materials.monitor}>
        <boxGeometry args={[0.5, 0.28, 0.012]} />
      </mesh>
      <mesh position={[0, -0.07, 0.028]} material={materials.monitor}>
        <boxGeometry args={[0.52, 0.07, 0.01]} />
      </mesh>
      <pointLight position={[0, 0, 0.1]} intensity={0.18} color="#a8c8e8" distance={1.4} />
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
      {[[-0.1, -0.1], [0.1, -0.1], [-0.1, 0.1], [0.1, 0.1]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.12, z]} material={materials.metal}>
          <cylinderGeometry args={[0.017, 0.017, 0.2, 5]} />
        </mesh>
      ))}
    </group>
  );
}

export function VintageGlobe() {
  return (
    <group position={[0, 0.52, 0]}>
      <mesh castShadow material={materials.sageDark}>
        <sphereGeometry args={[0.11, 16, 14]} />
      </mesh>
      <mesh position={[0, 0.38, 0]} material={materials.woodDark}>
        <cylinderGeometry args={[0.02, 0.025, 0.07, 8]} />
      </mesh>
      <mesh position={[0, 0.44, 0]} rotation={[Math.PI / 2, 0, 0]} material={materials.woodLight}>
        <torusGeometry args={[0.12, 0.008, 6, 20]} />
      </mesh>
      <mesh position={[0, 0.56, 0]} material={materials.metal}>
        <boxGeometry args={[0.14, 0.02, 0.02]} />
      </mesh>
    </group>
  );
}