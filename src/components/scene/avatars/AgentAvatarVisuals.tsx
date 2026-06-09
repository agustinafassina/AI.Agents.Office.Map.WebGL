import { Edges, RoundedBox } from '@react-three/drei';
import type { ReactNode } from 'react';
import type * as THREE from 'three';

export type HairVariant = 0 | 1 | 2 | 3;

export const AVATAR_SKIN = '#e8ceb8';
export const AVATAR_PANTS = '#5c4a3a';
export const AVATAR_SHOE = '#3a3228';
export const AVATAR_SOLE = '#2a241c';

interface MaterialProps {
  shirtMat: THREE.MeshStandardMaterial;
  pantsMat: THREE.MeshStandardMaterial;
  shoeMat: THREE.MeshStandardMaterial;
  soleMat: THREE.MeshStandardMaterial;
  skinMat: THREE.MeshStandardMaterial;
  hairMat: THREE.MeshStandardMaterial;
  accentMat: THREE.MeshStandardMaterial;
  eyeWhiteMat: THREE.MeshStandardMaterial;
  eyeMat: THREE.MeshStandardMaterial;
  cheekMat: THREE.MeshStandardMaterial;
  noseMat: THREE.MeshStandardMaterial;
  outlineColor: string;
}

export function AgentTorso({
  shirtMat,
  pantsMat,
  accentMat,
  outlineColor,
}: Pick<MaterialProps, 'shirtMat' | 'pantsMat' | 'accentMat' | 'outlineColor'>) {
  return (
    <>
      <RoundedBox
        args={[0.21, 0.23, 0.13]}
        radius={0.028}
        smoothness={3}
        position={[0, 0.34, 0]}
        castShadow
        receiveShadow
        material={shirtMat}
      >
        <Edges color={outlineColor} threshold={14} />
      </RoundedBox>

      <mesh position={[0, 0.24, 0]} castShadow material={pantsMat}>
        <boxGeometry args={[0.19, 0.055, 0.115]} />
      </mesh>
      <mesh position={[0, 0.215, 0.01]} material={accentMat}>
        <boxGeometry args={[0.17, 0.012, 0.09]} />
      </mesh>

      <mesh position={[-0.105, 0.415, 0.01]} castShadow material={shirtMat}>
        <sphereGeometry args={[0.048, 8, 8]} />
      </mesh>
      <mesh position={[0.105, 0.415, 0.01]} castShadow material={shirtMat}>
        <sphereGeometry args={[0.048, 8, 8]} />
      </mesh>

      <mesh position={[0, 0.455, 0.05]} castShadow material={accentMat}>
        <torusGeometry args={[0.055, 0.01, 8, 16]} />
      </mesh>
      <mesh position={[-0.018, 0.36, 0.066]} material={accentMat}>
        <boxGeometry args={[0.012, 0.14, 0.008]} />
      </mesh>
      <RoundedBox
        args={[0.042, 0.048, 0.01]}
        radius={0.006}
        smoothness={2}
        position={[0, 0.295, 0.072]}
        material={accentMat}
      />
    </>
  );
}

export function AgentArmSegment({
  shirtMat,
  skinMat,
  accentMat,
  side,
  handAccessory,
}: Pick<MaterialProps, 'shirtMat' | 'skinMat' | 'accentMat'> & {
  side: -1 | 1;
  handAccessory?: ReactNode;
}) {
  return (
    <>
      <mesh position={[0, -0.055, 0]} castShadow material={shirtMat}>
        <capsuleGeometry args={[0.034, 0.11, 5, 8]} />
      </mesh>
      <mesh position={[0, -0.105, side * 0.008]} castShadow material={accentMat}>
        <boxGeometry args={[0.038, 0.018, 0.024]} />
      </mesh>
      <group position={[0, -0.125, 0.012]}>
        <mesh castShadow material={skinMat}>
          <sphereGeometry args={[0.032, 8, 7]} />
        </mesh>
        {handAccessory}
      </group>
    </>
  );
}

export function AgentThigh({ pantsMat }: Pick<MaterialProps, 'pantsMat'>) {
  return (
    <>
      <mesh position={[0, -0.06, 0]} castShadow material={pantsMat}>
        <capsuleGeometry args={[0.036, 0.1, 5, 8]} />
      </mesh>
      <mesh position={[0, -0.115, 0.01]} castShadow material={pantsMat}>
        <boxGeometry args={[0.034, 0.02, 0.034]} />
      </mesh>
    </>
  );
}

export function AgentShinFoot({
  pantsMat,
  shoeMat,
  soleMat,
}: Pick<MaterialProps, 'pantsMat' | 'shoeMat' | 'soleMat'>) {
  return (
    <>
      <mesh position={[0, -0.02, 0.018]} castShadow material={pantsMat}>
        <capsuleGeometry args={[0.032, 0.075, 5, 8]} />
      </mesh>
      <RoundedBox
        args={[0.064, 0.042, 0.105]}
        radius={0.012}
        smoothness={2}
        position={[0, -0.085, 0.028]}
        castShadow
        material={shoeMat}
      />
      <mesh position={[0, -0.102, 0.038]} castShadow material={soleMat}>
        <boxGeometry args={[0.068, 0.014, 0.11]} />
      </mesh>
    </>
  );
}

export function AgentHair({
  variant,
  hairMat,
}: {
  variant: HairVariant;
  hairMat: THREE.MeshStandardMaterial;
}) {
  if (variant === 0) {
    return (
      <mesh position={[0, 0.055, -0.025]} castShadow material={hairMat}>
        <sphereGeometry args={[0.132, 12, 9, 0, Math.PI * 2, 0, Math.PI * 0.52]} />
      </mesh>
    );
  }

  if (variant === 1) {
    return (
      <>
        <mesh position={[0, 0.05, -0.035]} castShadow material={hairMat}>
          <boxGeometry args={[0.25, 0.09, 0.19]} />
        </mesh>
        <mesh position={[0, 0.1, 0.04]} castShadow material={hairMat}>
          <boxGeometry args={[0.14, 0.04, 0.05]} />
        </mesh>
      </>
    );
  }

  if (variant === 2) {
    return (
      <>
        <mesh position={[0, 0.045, -0.04]} castShadow material={hairMat}>
          <boxGeometry args={[0.23, 0.075, 0.17]} />
        </mesh>
        <mesh position={[0.08, 0.02, 0.05]} rotation={[0, 0, -0.42]} castShadow material={hairMat}>
          <boxGeometry args={[0.09, 0.05, 0.065]} />
        </mesh>
      </>
    );
  }

  return (
    <>
      <mesh position={[0, 0.05, -0.03]} castShadow material={hairMat}>
        <sphereGeometry args={[0.128, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.48]} />
      </mesh>
      <mesh position={[0, 0.02, -0.12]} rotation={[-0.35, 0, 0]} castShadow material={hairMat}>
        <capsuleGeometry args={[0.028, 0.11, 4, 6]} />
      </mesh>
    </>
  );
}

export function AgentFace({
  skinMat,
  hairMat,
  eyeWhiteMat,
  eyeMat,
  cheekMat,
  noseMat,
  outlineColor,
  variant,
}: Pick<
  MaterialProps,
  'skinMat' | 'hairMat' | 'eyeWhiteMat' | 'eyeMat' | 'cheekMat' | 'noseMat' | 'outlineColor'
> & { variant: HairVariant }) {
  return (
    <>
      <mesh castShadow material={skinMat}>
        <sphereGeometry args={[0.128, 14, 12]} />
        <Edges color={outlineColor} threshold={12} />
      </mesh>

      <AgentHair variant={variant} hairMat={hairMat} />

      <mesh position={[-0.045, 0.018, 0.108]} material={eyeWhiteMat}>
        <sphereGeometry args={[0.018, 8, 8]} />
      </mesh>
      <mesh position={[0.045, 0.018, 0.108]} material={eyeWhiteMat}>
        <sphereGeometry args={[0.018, 8, 8]} />
      </mesh>
      <mesh position={[-0.045, 0.016, 0.118]} material={eyeMat}>
        <sphereGeometry args={[0.01, 6, 6]} />
      </mesh>
      <mesh position={[0.045, 0.016, 0.118]} material={eyeMat}>
        <sphereGeometry args={[0.01, 6, 6]} />
      </mesh>
      <mesh position={[-0.041, 0.022, 0.121]} material={eyeWhiteMat}>
        <sphereGeometry args={[0.004, 4, 4]} />
      </mesh>
      <mesh position={[0.049, 0.022, 0.121]} material={eyeWhiteMat}>
        <sphereGeometry args={[0.004, 4, 4]} />
      </mesh>

      <mesh position={[-0.05, 0.038, 0.102]} rotation={[0, 0, 0.12]} material={hairMat}>
        <boxGeometry args={[0.034, 0.008, 0.012]} />
      </mesh>
      <mesh position={[0.05, 0.038, 0.102]} rotation={[0, 0, -0.12]} material={hairMat}>
        <boxGeometry args={[0.034, 0.008, 0.012]} />
      </mesh>

      <mesh position={[0, -0.028, 0.112]} material={noseMat}>
        <sphereGeometry args={[0.011, 6, 6]} />
      </mesh>
      <mesh position={[-0.072, -0.008, 0.095]} material={cheekMat}>
        <sphereGeometry args={[0.015, 6, 6]} />
      </mesh>
      <mesh position={[0.072, -0.008, 0.095]} material={cheekMat}>
        <sphereGeometry args={[0.015, 6, 6]} />
      </mesh>

      <mesh position={[0, -0.048, 0.114]} rotation={[0.15, 0, 0]} material={noseMat}>
        <torusGeometry args={[0.022, 0.006, 6, 12, Math.PI]} />
      </mesh>
    </>
  );
}
