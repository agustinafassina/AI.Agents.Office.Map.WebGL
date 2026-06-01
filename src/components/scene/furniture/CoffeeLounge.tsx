import type * as THREE from 'three';
import { materials } from '../materials';
import { StringLights, Terrarium, DeskSucculent } from './decor/SceneDecor';

function BeanBag({
  position,
  color,
}: {
  position: [number, number, number];
  color: THREE.MeshStandardMaterial;
}) {
  const mat = color.clone();
  return (
    <group position={position}>
      <mesh position={[0, 0.19, 0]} castShadow material={mat}>
        <sphereGeometry args={[0.33, 12, 10]} />
      </mesh>
      <mesh position={[0, 0.08, 0.05]} castShadow material={mat}>
        <sphereGeometry args={[0.29, 10, 8]} />
      </mesh>
    </group>
  );
}

function Grinder({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow material={materials.espresso}>
        <boxGeometry args={[0.14, 0.28, 0.14]} />
      </mesh>
      <mesh position={[0, 0.18, 0]} castShadow material={materials.metal}>
        <cylinderGeometry args={[0.07, 0.08, 0.1, 10]} />
      </mesh>
    </group>
  );
}

export function CoffeeLounge() {
  return (
    <group position={[0, 0, -4.1]}>
      <group position={[0, 0, -0.62]}>
        <mesh position={[0, 0.98, 0]} material={materials.sageDark}>
          <boxGeometry args={[5.9, 2.05, 0.13]} />
        </mesh>
        {Array.from({ length: 22 }, (_, i) => {
          const col = i % 7;
          const row = Math.floor(i / 7);
          const x = -2.5 + col * 0.82 + (row % 2) * 0.15;
          const y = 0.28 + row * 0.48;
          const r = 0.08 + (i % 4) * 0.025;
          return (
            <mesh
              key={i}
              position={[x, y, 0.09]}
              castShadow
              material={i % 2 === 0 ? materials.plant : materials.plantDark}
            >
              <sphereGeometry args={[r, 7, 6]} />
            </mesh>
          );
        })}
        {[-1.8, -0.6, 0.5, 1.6].map((x, i) => (
          <mesh key={`vine-${i}`} position={[x, 0.15, 0.1]} material={materials.plantDark}>
            <boxGeometry args={[0.04, 0.35 + (i % 2) * 0.15, 0.03]} />
          </mesh>
        ))}
      </group>

      <group position={[2.05, 0, 0.32]}>
        <mesh position={[0, 0.51, 0]} castShadow material={materials.woodDark}>
          <boxGeometry args={[2.4, 1.02, 0.6]} />
        </mesh>
        <mesh position={[0, 1, 0.08]} castShadow material={materials.woodLight}>
          <boxGeometry args={[2.3, 0.07, 0.54]} />
        </mesh>
        <mesh position={[0, 0.74, 0.24]} material={materials.underGlow}>
          <boxGeometry args={[2.15, 0.028, 0.1]} />
        </mesh>
        <mesh position={[-0.5, 0.8, 0.24]} castShadow material={materials.espresso}>
          <boxGeometry args={[0.4, 0.44, 0.32]} />
        </mesh>
        <Grinder position={[-0.05, 0, 0.28]} />
        <Grinder position={[0.22, 0, 0.28]} />
        <mesh position={[0.55, 1.08, -0.1]} material={materials.woodLight}>
          <boxGeometry args={[1.05, 0.04, 0.24]} />
        </mesh>
        {[-0.3, 0, 0.3].map((x, i) => (
          <group key={i} position={[0.55 + x, 1.12, -0.06]}>
            <mesh material={materials.mug}>
              <cylinderGeometry args={[0.035, 0.04, 0.07, 8]} />
            </mesh>
          </group>
        ))}
        {[-0.15, 0.15].map((x, i) => (
          <mesh key={`jar-${i}`} position={[0.7 + x, 1.12, -0.02]} material={materials.deskLeg}>
            <cylinderGeometry args={[0.035, 0.038, 0.09, 8]} />
          </mesh>
        ))}
        <group position={[0, 1.02, 0.2]}>
          <Terrarium position={[-0.35, 0, 0]} />
          <Terrarium position={[0.45, 0, 0.02]} />
          <DeskSucculent position={[0.85, 0, -0.02]} />
        </group>
      </group>

      <mesh position={[-0.15, 0.16, 0.52]} castShadow material={materials.woodLight}>
        <boxGeometry args={[0.95, 0.07, 0.55]} />
      </mesh>
      <mesh position={[-0.48, 0.08, 0.38]} material={materials.woodDark}>
        <boxGeometry args={[0.05, 0.14, 0.05]} />
      </mesh>
      <mesh position={[0.18, 0.08, 0.38]} material={materials.woodDark}>
        <boxGeometry args={[0.05, 0.14, 0.05]} />
      </mesh>
      <mesh position={[-0.48, 0.08, 0.66]} material={materials.woodDark}>
        <boxGeometry args={[0.05, 0.14, 0.05]} />
      </mesh>
      <mesh position={[0.18, 0.08, 0.66]} material={materials.woodDark}>
        <boxGeometry args={[0.05, 0.14, 0.05]} />
      </mesh>

      <BeanBag position={[-1.8, 0, 1.1]} color={materials.terracotta} />
      <BeanBag position={[-0.7, 0, 1.4]} color={materials.terracottaLight} />
      <BeanBag position={[0.9, 0, 1.2]} color={materials.olive} />
      <BeanBag position={[1.7, 0, 0.82]} color={materials.olive} />

      <StringLights start={[-2.6, 0, -0.38]} count={10} spacing={0.58} height={1.62} />
    </group>
  );
}
