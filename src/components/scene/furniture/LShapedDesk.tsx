import { Edges } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';
import { materials } from '../materials';
import {
  CurvedMonitorGroup,
  DeskPropsSlot,
  ErgonomicChairMesh,
  StandingLegs,
  type ChairStyle,
  type DeskPropType,
} from './WorkstationParts';

export function LShapedDesk({
  position,
  rotation = 0,
  chairStyle = 'sage',
  deskProp = 'succulent',
  corner = 'inner',
}: {
  position: [number, number, number];
  rotation?: number;
  chairStyle?: ChairStyle;
  deskProp?: DeskPropType;
  corner?: 'inner' | 'outer';
}) {
  const seatMat = useMemo(() => {
    const mats: Record<ChairStyle, THREE.MeshStandardMaterial> = {
      mesh: materials.chairMesh,
      tan: materials.chairTan,
      cream: materials.chairCream,
      white: materials.chairWhite,
      sage: materials.sage,
    };
    return mats[chairStyle].clone();
  }, [chairStyle]);

  const flip = corner === 'inner' ? 1 : -1;

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.41, 0.12 * flip]} castShadow receiveShadow material={materials.deskTop}>
        <boxGeometry args={[0.88, 0.05, 0.52]} />
        <Edges color="#6a7580" threshold={12} />
      </mesh>
      <mesh position={[0.28 * flip, 0.41, -0.18 * flip]} castShadow receiveShadow material={materials.deskTop}>
        <boxGeometry args={[0.42, 0.05, 0.48]} />
        <Edges color="#6a7580" threshold={12} />
      </mesh>

      <StandingLegs
        points={[
          [-0.32, -0.05],
          [0.32, -0.05],
          [-0.32, 0.28],
          [0.45 * flip, -0.38 * flip],
          [0.12 * flip, -0.38 * flip],
        ]}
      />

      <group position={[0, 0, 0.05 * flip]}>
        <CurvedMonitorGroup />
      </group>

      <mesh position={[0, 0.44, 0.08]} material={materials.metal}>
        <boxGeometry args={[0.26, 0.015, 0.08]} />
      </mesh>
      <mesh position={[0.18, 0.44, 0.11]} material={materials.metal}>
        <sphereGeometry args={[0.02, 6, 5]} />
      </mesh>

      <DeskPropsSlot type={deskProp} offset={[0.32 * flip, 0.41, 0.2 * flip]} />

      <ErgonomicChairMesh
        position={[0, 0, 0.42 * flip]}
        rotation={Math.PI}
        color={seatMat}
        meshBack={chairStyle === 'mesh' || chairStyle === 'tan'}
      />
    </group>
  );
}
