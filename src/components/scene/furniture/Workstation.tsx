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

export type { ChairStyle, DeskPropType };

interface WorkstationProps {
  position: [number, number, number];
  rotation?: number;
  chairStyle?: ChairStyle;
  props?: DeskPropType;
}

export function Workstation({
  position,
  rotation = 0,
  chairStyle = 'sage',
  props: deskProp = 'succulent',
}: WorkstationProps) {
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

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.41, 0]} castShadow receiveShadow material={materials.deskTop}>
        <boxGeometry args={[1.05, 0.05, 0.6]} />
        <Edges color="#6a7580" threshold={12} />
      </mesh>

      <StandingLegs
        points={[
          [-0.4, -0.2],
          [0.4, -0.2],
          [-0.4, 0.2],
          [0.4, 0.2],
        ]}
      />

      <CurvedMonitorGroup />
      <mesh position={[0, 0.54, -0.14]} material={materials.deskLeg}>
        <cylinderGeometry args={[0.016, 0.016, 0.08, 6]} />
      </mesh>

      <mesh position={[0, 0.44, 0.05]} material={materials.metal}>
        <boxGeometry args={[0.26, 0.015, 0.08]} />
      </mesh>
      <mesh position={[0.18, 0.44, 0.09]} material={materials.metal}>
        <sphereGeometry args={[0.02, 6, 5]} />
      </mesh>

      <DeskPropsSlot type={deskProp} offset={[0.34, 0.41, 0.12]} />

      <ErgonomicChairMesh
        position={[0, 0, 0.38]}
        rotation={Math.PI}
        color={seatMat}
        meshBack={chairStyle === 'mesh'}
      />
    </group>
  );
}

export { ErgonomicChairMesh } from './WorkstationParts';