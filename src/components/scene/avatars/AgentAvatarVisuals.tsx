import { Edges, RoundedBox } from '@react-three/drei';
import type { ReactNode } from 'react';
import type * as THREE from 'three';

export type RobotHeadVariant = 0 | 1 | 2 | 3;

/** @deprecated Use RobotHeadVariant */
export type HairVariant = RobotHeadVariant;

export const AVATAR_METAL = '#9aa3ac';
export const AVATAR_JOINT = '#5c656e';
export const AVATAR_FOOT = '#4a5258';
export const AVATAR_SOLE = '#353b42';

/** @deprecated Robot avatars no longer use skin tones */
export const AVATAR_SKIN = AVATAR_METAL;
/** @deprecated Robot avatars no longer use pants */
export const AVATAR_PANTS = AVATAR_JOINT;
/** @deprecated Robot avatars no longer use shoes */
export const AVATAR_SHOE = AVATAR_FOOT;

interface MaterialProps {
  chassisMat: THREE.MeshStandardMaterial;
  jointMat: THREE.MeshStandardMaterial;
  panelMat: THREE.MeshStandardMaterial;
  footMat: THREE.MeshStandardMaterial;
  soleMat: THREE.MeshStandardMaterial;
  eyeGlowMat: THREE.MeshStandardMaterial;
  eyeCoreMat: THREE.MeshStandardMaterial;
  outlineColor: string;
}

export function AgentTorso({
  chassisMat,
  jointMat,
  panelMat,
  outlineColor,
}: Pick<MaterialProps, 'chassisMat' | 'jointMat' | 'panelMat' | 'outlineColor'>) {
  return (
    <>
      <RoundedBox
        args={[0.22, 0.24, 0.14]}
        radius={0.022}
        smoothness={2}
        position={[0, 0.34, 0]}
        castShadow
        receiveShadow
        material={chassisMat}
      >
        <Edges color={outlineColor} threshold={14} />
      </RoundedBox>

      <mesh position={[0, 0.34, 0.072]} material={panelMat}>
        <boxGeometry args={[0.1, 0.08, 0.008]} />
      </mesh>
      <mesh position={[0, 0.3, 0.073]} material={panelMat}>
        <boxGeometry args={[0.06, 0.012, 0.006]} />
      </mesh>

      <mesh position={[0, 0.24, 0]} castShadow material={jointMat}>
        <boxGeometry args={[0.2, 0.05, 0.12]} />
      </mesh>
      <mesh position={[0, 0.215, 0.01]} material={panelMat}>
        <boxGeometry args={[0.16, 0.01, 0.085]} />
      </mesh>

      <mesh position={[-0.112, 0.415, 0]} castShadow material={jointMat}>
        <sphereGeometry args={[0.042, 8, 8]} />
      </mesh>
      <mesh position={[0.112, 0.415, 0]} castShadow material={jointMat}>
        <sphereGeometry args={[0.042, 8, 8]} />
      </mesh>

      <mesh position={[0, 0.455, 0]} castShadow material={jointMat}>
        <cylinderGeometry args={[0.038, 0.042, 0.06, 8]} />
      </mesh>
      <mesh position={[0, 0.485, 0]} material={panelMat}>
        <torusGeometry args={[0.04, 0.008, 6, 12]} />
      </mesh>
    </>
  );
}

export function AgentArmSegment({
  chassisMat,
  jointMat,
  panelMat,
  side,
  handAccessory,
}: Pick<MaterialProps, 'chassisMat' | 'jointMat' | 'panelMat'> & {
  side: -1 | 1;
  handAccessory?: ReactNode;
}) {
  return (
    <>
      <mesh position={[0, -0.055, 0]} castShadow material={chassisMat}>
        <boxGeometry args={[0.05, 0.12, 0.05]} />
      </mesh>
      <mesh position={[0, -0.105, 0]} castShadow material={jointMat}>
        <sphereGeometry args={[0.028, 8, 8]} />
      </mesh>
      <mesh position={[0, -0.125, side * 0.006]} castShadow material={chassisMat}>
        <boxGeometry args={[0.044, 0.06, 0.044]} />
      </mesh>
      <mesh position={[0, -0.148, 0.014]} castShadow material={panelMat}>
        <boxGeometry args={[0.038, 0.024, 0.032]} />
      </mesh>
      <group position={[0, -0.155, 0.018]}>
        {handAccessory}
      </group>
    </>
  );
}

export function AgentThigh({ jointMat }: Pick<MaterialProps, 'jointMat'>) {
  return (
    <>
      <mesh position={[0, -0.06, 0]} castShadow material={jointMat}>
        <cylinderGeometry args={[0.034, 0.038, 0.1, 8]} />
      </mesh>
      <mesh position={[0, -0.115, 0.01]} castShadow material={jointMat}>
        <sphereGeometry args={[0.032, 8, 8]} />
      </mesh>
    </>
  );
}

export function AgentShinFoot({
  jointMat,
  footMat,
  soleMat,
}: Pick<MaterialProps, 'jointMat' | 'footMat' | 'soleMat'>) {
  return (
    <>
      <mesh position={[0, -0.02, 0.018]} castShadow material={jointMat}>
        <cylinderGeometry args={[0.03, 0.034, 0.075, 8]} />
      </mesh>
      <RoundedBox
        args={[0.07, 0.04, 0.11]}
        radius={0.008}
        smoothness={2}
        position={[0, -0.085, 0.028]}
        castShadow
        material={footMat}
      />
      <mesh position={[0, -0.102, 0.04]} castShadow material={soleMat}>
        <boxGeometry args={[0.074, 0.012, 0.112]} />
      </mesh>
    </>
  );
}

interface DreadLockSpec {
  pos: [number, number, number];
  rot: [number, number, number];
  length: number;
  radius: number;
}

const DREAD_LAYOUTS: Record<RobotHeadVariant, DreadLockSpec[]> = {
  0: [
    { pos: [-0.07, 0.1, 0.02], rot: [0.22, 0.1, 0.18], length: 0.1, radius: 0.013 },
    { pos: [-0.03, 0.11, 0.04], rot: [0.28, 0, 0.06], length: 0.11, radius: 0.012 },
    { pos: [0.03, 0.11, 0.04], rot: [0.28, 0, -0.06], length: 0.11, radius: 0.012 },
    { pos: [0.07, 0.1, 0.02], rot: [0.22, -0.1, -0.18], length: 0.1, radius: 0.013 },
    { pos: [-0.09, 0.04, -0.02], rot: [0.12, 0.35, 0.42], length: 0.12, radius: 0.011 },
    { pos: [0.09, 0.04, -0.02], rot: [0.12, -0.35, -0.42], length: 0.12, radius: 0.011 },
    { pos: [-0.04, 0.06, -0.08], rot: [0.55, 0.15, 0.08], length: 0.14, radius: 0.012 },
    { pos: [0.04, 0.06, -0.08], rot: [0.55, -0.15, -0.08], length: 0.14, radius: 0.012 },
    { pos: [0, 0.08, -0.1], rot: [0.62, 0, 0], length: 0.15, radius: 0.013 },
  ],
  1: [
    { pos: [-0.08, 0.1, 0.03], rot: [0.18, 0.2, 0.24], length: 0.11, radius: 0.012 },
    { pos: [-0.05, 0.11, 0.05], rot: [0.3, 0.08, 0.1], length: 0.12, radius: 0.011 },
    { pos: [0, 0.115, 0.05], rot: [0.32, 0, 0], length: 0.13, radius: 0.012 },
    { pos: [0.05, 0.11, 0.05], rot: [0.3, -0.08, -0.1], length: 0.12, radius: 0.011 },
    { pos: [0.08, 0.1, 0.03], rot: [0.18, -0.2, -0.24], length: 0.11, radius: 0.012 },
    { pos: [-0.1, 0.02, -0.01], rot: [0.08, 0.42, 0.5], length: 0.13, radius: 0.011 },
    { pos: [0.1, 0.02, -0.01], rot: [0.08, -0.42, -0.5], length: 0.13, radius: 0.011 },
    { pos: [-0.06, 0.04, -0.09], rot: [0.48, 0.22, 0.12], length: 0.16, radius: 0.012 },
    { pos: [0.06, 0.04, -0.09], rot: [0.48, -0.22, -0.12], length: 0.16, radius: 0.012 },
    { pos: [0, 0.05, -0.11], rot: [0.68, 0, 0], length: 0.17, radius: 0.013 },
  ],
  2: [
    { pos: [-0.06, 0.1, 0.01], rot: [0.2, 0.12, 0.2], length: 0.1, radius: 0.012 },
    { pos: [0.06, 0.1, 0.01], rot: [0.2, -0.12, -0.2], length: 0.1, radius: 0.012 },
    { pos: [-0.03, 0.11, 0.03], rot: [0.26, 0.04, 0.08], length: 0.11, radius: 0.011 },
    { pos: [0.03, 0.11, 0.03], rot: [0.26, -0.04, -0.08], length: 0.11, radius: 0.011 },
    { pos: [-0.08, 0.03, -0.03], rot: [0.1, 0.38, 0.45], length: 0.14, radius: 0.011 },
    { pos: [0.08, 0.03, -0.03], rot: [0.1, -0.38, -0.45], length: 0.14, radius: 0.011 },
    { pos: [-0.05, 0.04, -0.1], rot: [0.72, 0.12, 0.06], length: 0.2, radius: 0.012 },
    { pos: [0.05, 0.04, -0.1], rot: [0.72, -0.12, -0.06], length: 0.2, radius: 0.012 },
    { pos: [0, 0.06, -0.12], rot: [0.82, 0, 0], length: 0.22, radius: 0.013 },
    { pos: [-0.02, 0.07, -0.11], rot: [0.78, 0.08, 0.04], length: 0.19, radius: 0.011 },
    { pos: [0.02, 0.07, -0.11], rot: [0.78, -0.08, -0.04], length: 0.19, radius: 0.011 },
  ],
  3: [
    { pos: [-0.09, 0.09, 0.02], rot: [0.16, 0.28, 0.35], length: 0.12, radius: 0.012 },
    { pos: [-0.06, 0.11, 0.04], rot: [0.24, 0.14, 0.18], length: 0.13, radius: 0.011 },
    { pos: [-0.02, 0.115, 0.05], rot: [0.3, 0.06, 0.08], length: 0.14, radius: 0.012 },
    { pos: [0.04, 0.1, 0.03], rot: [0.2, -0.1, -0.14], length: 0.1, radius: 0.011 },
    { pos: [0.08, 0.08, 0.01], rot: [0.14, -0.24, -0.3], length: 0.11, radius: 0.012 },
    { pos: [-0.11, 0.01, -0.02], rot: [0.06, 0.48, 0.55], length: 0.15, radius: 0.011 },
    { pos: [0.1, 0.02, -0.04], rot: [0.12, -0.32, -0.38], length: 0.13, radius: 0.011 },
    { pos: [-0.07, 0.03, -0.1], rot: [0.58, 0.28, 0.16], length: 0.18, radius: 0.012 },
    { pos: [0.07, 0.04, -0.09], rot: [0.52, -0.18, -0.22], length: 0.15, radius: 0.011 },
    { pos: [-0.03, 0.05, -0.11], rot: [0.75, 0.1, 0.05], length: 0.2, radius: 0.012 },
  ],
};

export function AgentDreadlocks({
  variant,
  dreadMat,
}: {
  variant: RobotHeadVariant;
  dreadMat: THREE.MeshStandardMaterial;
}) {
  const dreads = DREAD_LAYOUTS[variant];

  return (
    <>
      <mesh position={[0, 0.105, -0.01]} castShadow material={dreadMat}>
        <boxGeometry args={[0.2, 0.03, 0.16]} />
      </mesh>
      {dreads.map((dread, index) => (
        <mesh
          key={index}
          position={dread.pos}
          rotation={dread.rot}
          castShadow
          material={dreadMat}
        >
          <capsuleGeometry args={[dread.radius, dread.length, 4, 6]} />
        </mesh>
      ))}
    </>
  );
}

export function AgentHeadModules({
  variant,
  panelMat,
}: {
  variant: RobotHeadVariant;
  panelMat: THREE.MeshStandardMaterial;
  jointMat?: THREE.MeshStandardMaterial;
}) {
  if (variant === 2) {
    return (
      <mesh position={[0, 0.04, 0.115]} material={panelMat}>
        <boxGeometry args={[0.18, 0.028, 0.012]} />
      </mesh>
    );
  }

  if (variant === 3) {
    return (
      <mesh position={[0, 0.1, -0.02]} castShadow material={panelMat}>
        <cylinderGeometry args={[0.012, 0.012, 0.05, 6]} />
      </mesh>
    );
  }

  return null;
}

export function AgentRobotHead({
  chassisMat,
  jointMat,
  panelMat,
  dreadMat,
  eyeGlowMat,
  eyeCoreMat,
  outlineColor,
  variant,
}: Pick<
  MaterialProps,
  'chassisMat' | 'jointMat' | 'panelMat' | 'eyeGlowMat' | 'eyeCoreMat' | 'outlineColor'
> & {
  variant: RobotHeadVariant;
  dreadMat: THREE.MeshStandardMaterial;
}) {
  return (
    <>
      <RoundedBox
        args={[0.24, 0.22, 0.2]}
        radius={0.024}
        smoothness={2}
        castShadow
        material={chassisMat}
      >
        <Edges color={outlineColor} threshold={12} />
      </RoundedBox>

      <mesh position={[0, -0.02, 0.102]} material={jointMat}>
        <boxGeometry args={[0.16, 0.04, 0.012]} />
      </mesh>

      <mesh position={[-0.055, 0.02, 0.102]} material={eyeGlowMat}>
        <boxGeometry args={[0.038, 0.028, 0.012]} />
      </mesh>
      <mesh position={[0.055, 0.02, 0.102]} material={eyeGlowMat}>
        <boxGeometry args={[0.038, 0.028, 0.012]} />
      </mesh>
      <mesh position={[-0.055, 0.02, 0.108]} material={eyeCoreMat}>
        <boxGeometry args={[0.018, 0.018, 0.008]} />
      </mesh>
      <mesh position={[0.055, 0.02, 0.108]} material={eyeCoreMat}>
        <boxGeometry args={[0.018, 0.018, 0.008]} />
      </mesh>

      <mesh position={[0, -0.06, 0.104]} material={jointMat}>
        <boxGeometry args={[0.08, 0.016, 0.01]} />
      </mesh>

      <AgentDreadlocks variant={variant} dreadMat={dreadMat} />
      <AgentHeadModules variant={variant} panelMat={panelMat} jointMat={jointMat} />
    </>
  );
}

/** @deprecated Use AgentRobotHead */
export function AgentFace(props: Parameters<typeof AgentRobotHead>[0]) {
  return <AgentRobotHead {...props} />;
}

/** @deprecated Use AgentHeadModules */
export function AgentHair({
  variant,
  hairMat,
}: {
  variant: RobotHeadVariant;
  hairMat: THREE.MeshStandardMaterial;
}) {
  return <AgentHeadModules variant={variant} panelMat={hairMat} jointMat={hairMat} />;
}
