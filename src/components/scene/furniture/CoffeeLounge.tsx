import type * as THREE from 'three';
import { materials } from '../materials';
import { Plant } from './Plants';
import {
  CoffeeCanister,
  CoffeeGrinder,
  EspressoMachine,
  MilkPitcher,
} from './CoffeeBar';
import {
  BAR_STATION_LOCAL_Z,
  COFFEE_LOUNGE_POSITION,
  LIVING_WALL_LOCAL_Z,
} from './coffeeLoungeConstants';
import { BeanBag, StringLights, Terrarium, DeskSucculent, ZoneMat } from './decor/SceneDecor';

const PLATFORM_Y = 0.14;
const LOUNGE_TABLE: [number, number, number] = [-0.88, 0, 0.78];
const BAR_COUNTER_TOP_Y = 1.045;

function puffRotationToward(table: [number, number, number], pos: [number, number, number]) {
  return Math.atan2(table[0] - pos[0], table[2] - pos[2]);
}

const LOUNGE_PUFFS: {
  position: [number, number, number];
  color: THREE.MeshStandardMaterial;
  scale?: number;
}[] = [
  { position: [-1.58, 0, 1.02], color: materials.beanBagTerracotta },
  { position: [-1.12, 0, 1.48], color: materials.beanBagTerracottaLight, scale: 0.96 },
  { position: [-0.48, 0, 1.52], color: materials.beanBagSage },
  { position: [0.02, 0, 1.05], color: materials.beanBagSage, scale: 0.94 },
];

function CoffeeTable() {
  return (
    <group position={LOUNGE_TABLE}>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, PLATFORM_Y + 0.012, 0]}
        receiveShadow
        material={materials.rugWeave}
      >
        <circleGeometry args={[1.05, 32]} />
      </mesh>
      <mesh position={[0, 0.16, 0]} castShadow material={materials.woodLight}>
        <boxGeometry args={[1.05, 0.08, 0.62]} />
      </mesh>
      {[
        [-0.38, 0.22],
        [0.38, 0.22],
        [-0.38, -0.22],
        [0.38, -0.22],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.08, z]} castShadow material={materials.woodDark}>
          <boxGeometry args={[0.055, 0.14, 0.055]} />
        </mesh>
      ))}
      <mesh position={[0.22, 0.205, 0.08]} material={materials.mug}>
        <cylinderGeometry args={[0.032, 0.036, 0.06, 8]} />
      </mesh>
      <mesh position={[-0.2, 0.202, -0.06]} material={materials.mug}>
        <cylinderGeometry args={[0.028, 0.032, 0.055, 8]} />
      </mesh>
      <mesh position={[0.02, 0.205, -0.14]} rotation={[0, 0.35, 0]} material={materials.notebook}>
        <boxGeometry args={[0.16, 0.008, 0.11]} />
      </mesh>
      <DeskSucculent position={[-0.18, 0.2, 0.1]} />
    </group>
  );
}

function CoffeeBarStation() {
  return (
    <group position={[0, 0, BAR_STATION_LOCAL_Z]}>
      <mesh position={[0, 0.51, -0.04]} castShadow material={materials.wallMarble}>
        <boxGeometry args={[2.55, 0.72, 0.04]} />
      </mesh>
      <mesh position={[0, 0.51, 0]} castShadow material={materials.woodDark}>
        <boxGeometry args={[2.45, 1.02, 0.6]} />
      </mesh>
      <mesh position={[0, 1.01, 0.08]} castShadow material={materials.woodLight}>
        <boxGeometry args={[2.35, 0.07, 0.54]} />
      </mesh>
      <mesh position={[0, 0.74, 0.24]} material={materials.underGlow}>
        <boxGeometry args={[2.2, 0.03, 0.1]} />
      </mesh>
      <pointLight position={[0, 0.76, 0.35]} intensity={0.42} color="#ffdba0" distance={3.2} decay={2} />

      <group position={[0, BAR_COUNTER_TOP_Y, 0]}>
        <EspressoMachine position={[-0.08, 0, 0.24]} scale={1.18} />
        <CoffeeGrinder position={[-0.72, 0.15, 0.28]} />
        <CoffeeCanister position={[0.52, 0.055, 0.3]} />
        <MilkPitcher position={[0.72, 0.04, 0.28]} />
      </group>

      <mesh position={[-0.08, 0.88, -0.06]} castShadow material={materials.woodLight}>
        <boxGeometry args={[0.72, 0.38, 0.02]} />
      </mesh>
      <mesh position={[-0.08, 0.88, -0.045]} material={materials.sage}>
        <boxGeometry args={[0.62, 0.28, 0.006]} />
      </mesh>
      <mesh position={[-0.08, 0.92, -0.038]} material={materials.espresso}>
        <boxGeometry args={[0.08, 0.08, 0.004]} />
      </mesh>
      <mesh position={[-0.08, 0.84, -0.038]} material={materials.terracotta}>
        <boxGeometry args={[0.22, 0.04, 0.004]} />
      </mesh>

      <mesh position={[0.58, 1.1, -0.1]} castShadow material={materials.woodLight}>
        <boxGeometry args={[1.15, 0.04, 0.26]} />
      </mesh>
      <mesh position={[0.58, 1.07, -0.08]} castShadow material={materials.woodDark}>
        <boxGeometry args={[1.05, 0.025, 0.04]} />
      </mesh>
      {[-0.34, -0.12, 0.1, 0.32].map((x, i) => (
        <mesh key={i} position={[0.58 + x, 1.14, -0.05]} material={materials.mug}>
          <cylinderGeometry args={[0.036, 0.04, 0.075, 8]} />
        </mesh>
      ))}

      <group position={[0, 1.03, 0.2]}>
        <Terrarium position={[-0.4, 0, 0]} />
        <Terrarium position={[0.15, 0, 0.02]} />
        <DeskSucculent position={[0.55, 0, -0.02]} />
      </group>

      <mesh position={[-0.95, 0.62, 0.22]} rotation={[0.08, 0.25, 0]} material={materials.notebook}>
        <boxGeometry args={[0.18, 0.22, 0.008]} />
      </mesh>
    </group>
  );
}

export function CoffeeLounge() {
  return (
    <group position={COFFEE_LOUNGE_POSITION}>
      <mesh position={[0, PLATFORM_Y / 2, 0.4]} castShadow receiveShadow material={materials.platformWood}>
        <boxGeometry args={[5.8, PLATFORM_Y, 3.4]} />
      </mesh>
      <mesh position={[0, PLATFORM_Y + 0.002, 0.4]} receiveShadow material={materials.woodLight}>
        <boxGeometry args={[5.6, 0.02, 3.2]} />
      </mesh>

      <ZoneMat position={[0, 0, 0.45]} size={[5.2, 3]} variant="sage" elevation={PLATFORM_Y + 0.015} />

      <group position={[0, PLATFORM_Y, 0]}>
        <group position={[0, 0, LIVING_WALL_LOCAL_Z]}>
          <mesh position={[0, 0.98, 0]} material={materials.sageDark}>
            <boxGeometry args={[6, 2.1, 0.13]} />
          </mesh>
          <mesh position={[0, 0.48, 0.07]} material={materials.sage}>
            <boxGeometry args={[5.8, 0.04, 0.02]} />
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

        <Plant position={[-2.5, 0, 0.55]} variant="snake" />
        <Plant position={[2.5, 0, 0.55]} variant="snake" />

        <CoffeeBarStation />
        <CoffeeTable />

        {LOUNGE_PUFFS.map(({ position, color, scale }, i) => (
          <BeanBag
            key={i}
            position={position}
            color={color}
            scale={scale}
            rotation={puffRotationToward(LOUNGE_TABLE, position)}
          />
        ))}

        <StringLights start={[-2.2, 0, -0.82]} count={11} spacing={0.45} height={1.58} depth={-0.34} />
      </group>
    </group>
  );
}
