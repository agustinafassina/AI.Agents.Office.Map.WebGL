import { materials } from '../materials';
import { CeramicFloorPlant } from './decor/SceneDecor';

function Stool({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  const legAngles = [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3];
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.24, 0]} castShadow material={materials.woodLight}>
        <cylinderGeometry args={[0.14, 0.15, 0.05, 12]} />
      </mesh>
      {legAngles.map((a, i) => (
        <mesh
          key={i}
          position={[Math.sin(a) * 0.08, 0.11, Math.cos(a) * 0.08]}
          castShadow
          material={materials.wood}
        >
          <cylinderGeometry args={[0.018, 0.02, 0.22, 5]} />
        </mesh>
      ))}
    </group>
  );
}

export function MeetingZone() {
  const stoolAngles = [0.5, Math.PI * 0.5, Math.PI, Math.PI * 1.5];
  return (
    <group position={[-4.4, 0, 0.1]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow material={materials.rug}>
        <planeGeometry args={[2.6, 2.4]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]} receiveShadow material={materials.rugWeave}>
        <planeGeometry args={[2.3, 2.1]} />
      </mesh>

      <mesh position={[0, 0.43, 0]} castShadow material={materials.woodTable}>
        <cylinderGeometry args={[0.74, 0.76, 0.085, 22]} />
      </mesh>
      <mesh position={[0, 0.21, 0]} material={materials.woodDark}>
        <cylinderGeometry args={[0.065, 0.075, 0.34, 10]} />
      </mesh>

      {stoolAngles.map((a, i) => (
        <Stool
          key={i}
          position={[Math.sin(a) * 1.05, 0, Math.cos(a) * 1.05]}
          rotation={a + Math.PI}
        />
      ))}

      <group position={[-1.36, 0, 0.05]} rotation={[0, Math.PI / 2, 0]}>
        <mesh position={[0, 1.1, 0]} material={materials.metal}>
          <boxGeometry args={[1.6, 0.05, 0.07]} />
        </mesh>
        <mesh position={[0, 1.1, 0.045]} material={materials.whiteboard}>
          <boxGeometry args={[1.45, 0.9, 0.02]} />
        </mesh>
        <mesh position={[-0.4, 1.22, 0.055]} material={materials.sage}>
          <boxGeometry args={[0.3, 0.035, 0.008]} />
        </mesh>
        <mesh position={[0.1, 1.08, 0.055]} material={materials.terracotta}>
          <boxGeometry args={[0.22, 0.16, 0.008]} />
        </mesh>
        <mesh position={[0.35, 1.28, 0.055]} material={materials.monitor}>
          <boxGeometry args={[0.14, 0.1, 0.008]} />
        </mesh>
        <mesh position={[-0.15, 0.95, 0.055]} material={materials.metal}>
          <boxGeometry args={[0.55, 0.025, 0.008]} />
        </mesh>
        <mesh position={[0.25, 1.0, 0.055]} material={materials.sageDark}>
          <boxGeometry args={[0.08, 0.08, 0.008]} />
        </mesh>
      </group>

      <group position={[-1.3, 0, -0.95]} rotation={[0, Math.PI / 2, 0]}>
        <mesh position={[0, 1.4, 0]} material={materials.espresso}>
          <cylinderGeometry args={[0.14, 0.14, 0.03, 20]} />
        </mesh>
        <mesh position={[0, 1.4, 0.018]} material={materials.wall}>
          <cylinderGeometry args={[0.11, 0.11, 0.01, 20]} />
        </mesh>
        <mesh position={[0.04, 1.4, 0.022]} rotation={[0, 0, Math.PI / 4]} material={materials.metal}>
          <boxGeometry args={[0.006, 0.055, 0.006]} />
        </mesh>
      </group>

      <CeramicFloorPlant position={[-0.95, 0, 1.2]} />
    </group>
  );
}
