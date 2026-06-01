import { materials } from '../materials';

interface PlantProps {
  position: [number, number, number];
  variant?: 'small' | 'medium' | 'tall' | 'fiddle';
}

export function Plant({ position, variant = 'medium' }: PlantProps) {
  if (variant === 'fiddle' || variant === 'tall') {
    return (
      <group position={position}>
        <mesh position={[0, 0.22, 0]} castShadow material={materials.plantPot}>
          <cylinderGeometry args={[0.22, 0.24, 0.44, 12]} />
        </mesh>
        <mesh position={[0, 0.55, 0]} castShadow material={materials.plantDark}>
          <boxGeometry args={[0.08, 0.35, 0.06]} />
        </mesh>
        <mesh position={[0, 0.95, 0]} castShadow material={materials.plant}>
          <boxGeometry args={[0.14, 0.55, 0.1]} />
        </mesh>
        <mesh position={[0.1, 1.15, 0.04]} castShadow material={materials.plantDark}>
          <boxGeometry args={[0.22, 0.28, 0.08]} />
        </mesh>
      </group>
    );
  }

  const scale = variant === 'small' ? 0.8 : 1;
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.11, 0]} castShadow material={materials.plantPot}>
        <cylinderGeometry args={[0.11, 0.13, 0.22, 10]} />
      </mesh>
      <mesh position={[0, 0.3, 0]} castShadow material={materials.plant}>
        <sphereGeometry args={[0.15, 8, 7]} />
      </mesh>
      <mesh position={[0.09, 0.34, 0.05]} castShadow material={materials.plantDark}>
        <sphereGeometry args={[0.09, 6, 5]} />
      </mesh>
    </group>
  );
}
