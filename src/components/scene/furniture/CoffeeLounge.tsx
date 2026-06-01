import type * as THREE from 'three';
import { materials } from '../materials';
import { Plant } from './Plants';
import { StringLights, Terrarium, DeskSucculent, ZoneMat } from './decor/SceneDecor';

const PLATFORM_Y = 0.14;

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
        <sphereGeometry args={[0.34, 12, 10]} />
      </mesh>
      <mesh position={[0, 0.08, 0.05]} castShadow material={mat}>
        <sphereGeometry args={[0.3, 10, 8]} />
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
    <group position={[0, 0, -4.05]}>
      <mesh position={[0, PLATFORM_Y / 2, 0.4]} castShadow receiveShadow material={materials.platformWood}>
        <boxGeometry args={[5.8, PLATFORM_Y, 3.4]} />
      </mesh>
      <mesh position={[0, PLATFORM_Y + 0.002, 0.4]} receiveShadow material={materials.woodLight}>
        <boxGeometry args={[5.6, 0.02, 3.2]} />
      </mesh>

      <ZoneMat position={[0, 0, 0.45]} size={[5.2, 3]} variant="sage" elevation={PLATFORM_Y + 0.015} />

      <group position={[0, PLATFORM_Y, 0]}>
        <group position={[0, 0, -0.62]}>
          <mesh position={[0, 0.98, 0]} material={materials.sageDark}>
            <boxGeometry args={[6, 2.1, 0.13]} />
          </mesh>
          {Array.from({ length: 28 }, (_, i) => {
            const col = i % 7;
            const row = Math.floor(i / 7);
            const x = -2.55 + col * 0.82 + (row % 2) * 0.12;
            const y = 0.26 + row * 0.5;
            const r = 0.07 + (i % 5) * 0.022;
            return (
              <mesh
                key={i}
                position={[x, y, 0.09]}
                castShadow
                material={i % 3 === 0 ? materials.plantDark : materials.plant}
              >
                <sphereGeometry args={[r, 7, 6]} />
              </mesh>
            );
          })}
          {[-2.2, -0.8, 0.6, 1.9].map((x, i) => (
            <mesh
              key={`vine-${i}`}
              position={[x, 0.12 + (i % 2) * 0.1, 0.1]}
              material={materials.plantDark}
            >
              <boxGeometry args={[0.035, 0.4, 0.025]} />
            </mesh>
          ))}
        </group>

        <Plant position={[-2.8, 0, -0.2]} variant="snake" />
        <Plant position={[2.5, 0, -0.15]} variant="snake" />

        <group position={[2.05, 0, 0.32]}>
          <mesh position={[0, 0.51, 0]} castShadow material={materials.woodDark}>
            <boxGeometry args={[2.45, 1.02, 0.6]} />
          </mesh>
          <mesh position={[0, 1.01, 0.08]} castShadow material={materials.woodLight}>
            <boxGeometry args={[2.35, 0.07, 0.54]} />
          </mesh>
          <mesh position={[0, 0.74, 0.24]} material={materials.underGlow}>
            <boxGeometry args={[2.2, 0.03, 0.1]} />
          </mesh>
          <pointLight position={[0, 0.76, 0.35]} intensity={0.35} color="#ffdba0" distance={3} decay={2} />
          <mesh position={[-0.52, 0.8, 0.24]} castShadow material={materials.espresso}>
            <boxGeometry args={[0.42, 0.45, 0.32]} />
          </mesh>
          <Grinder position={[-0.08, 0, 0.28]} />
          <Grinder position={[0.2, 0, 0.28]} />
          <mesh position={[0.58, 1.1, -0.1]} material={materials.woodLight}>
            <boxGeometry args={[1.1, 0.04, 0.24]} />
          </mesh>
          {[-0.32, 0, 0.32].map((x, i) => (
            <mesh key={i} position={[0.58 + x, 1.14, -0.05]} material={materials.mug}>
              <cylinderGeometry args={[0.036, 0.04, 0.075, 8]} />
            </mesh>
          ))}
          <group position={[0, 1.03, 0.2]}>
            <Terrarium position={[-0.4, 0, 0]} />
            <Terrarium position={[0.15, 0, 0.02]} />
            <DeskSucculent position={[0.55, 0, -0.02]} />
          </group>
        </group>

        <mesh position={[-0.1, 0.16, 0.5]} castShadow material={materials.woodLight}>
          <boxGeometry args={[1, 0.07, 0.58]} />
        </mesh>
        {[
          [-0.42, 0.34],
          [0.38, 0.34],
          [-0.42, 0.66],
          [0.38, 0.66],
        ].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.08, z]} material={materials.woodDark}>
            <boxGeometry args={[0.05, 0.14, 0.05]} />
          </mesh>
        ))}

        <BeanBag position={[-1.75, 0, 1.05]} color={materials.terracotta} />
        <BeanBag position={[-0.65, 0, 1.35]} color={materials.terracottaLight} />
        <BeanBag position={[0.85, 0, 1.15]} color={materials.olive} />
        <BeanBag position={[1.65, 0, 0.78]} color={materials.sage} />

        <StringLights start={[-2.65, 0, -0.36]} count={11} spacing={0.56} height={1.65} />
      </group>
    </group>
  );
}
