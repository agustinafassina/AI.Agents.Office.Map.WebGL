import { materials } from '../materials';
import { CeramicFloorPlant, DeskNotebook, WallNotes } from './decor/SceneDecor';

function Stool({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  const legAngles = [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3];
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.24, 0]} castShadow material={materials.woodLight}>
        <cylinderGeometry args={[0.14, 0.15, 0.04, 12]} />
      </mesh>
      <mesh position={[0, 0.265, 0]} castShadow material={materials.stoolGray}>
        <cylinderGeometry args={[0.13, 0.135, 0.025, 12]} />
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
  const stoolAngles = [0.35, (Math.PI * 2) / 3, (Math.PI * 4) / 3 + 0.2];
  return (
    <group position={[-4.35, 0, 0.08]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow material={materials.rug}>
        <planeGeometry args={[2.45, 2.15]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]} receiveShadow material={materials.rugWeave}>
        <planeGeometry args={[2.15, 1.9]} />
      </mesh>

      <mesh position={[0, 0.435, 0]} castShadow material={materials.woodTable}>
        <cylinderGeometry args={[0.75, 0.77, 0.09, 22]} />
      </mesh>
      <mesh position={[0, 0.21, 0]} material={materials.woodDark}>
        <cylinderGeometry args={[0.065, 0.075, 0.34, 10]} />
      </mesh>

      <DeskNotebook position={[0.12, 0.44, 0.08]} />

      {stoolAngles.map((a, i) => (
        <Stool
          key={i}
          position={[Math.sin(a) * 1.05, 0, Math.cos(a) * 1.05]}
          rotation={a + Math.PI}
        />
      ))}

      <group position={[-1.34, 0, 0.05]} rotation={[0, Math.PI / 2, 0]}>
        <mesh position={[0, 1.12, 0]} material={materials.metal}>
          <boxGeometry args={[1.65, 0.05, 0.07]} />
        </mesh>
        <mesh position={[0, 1.12, 0.045]} material={materials.whiteboard}>
          <boxGeometry args={[1.5, 0.92, 0.02]} />
        </mesh>
        <mesh position={[-0.42, 1.22, 0.055]} material={materials.sage}>
          <boxGeometry args={[0.36, 0.05, 0.008]} />
        </mesh>
        <mesh position={[0.05, 1.08, 0.055]} material={materials.terracotta}>
          <boxGeometry args={[0.28, 0.2, 0.008]} />
        </mesh>
        <mesh position={[0.35, 1.28, 0.055]} material={materials.monitor}>
          <boxGeometry args={[0.18, 0.14, 0.008]} />
        </mesh>
        <mesh position={[-0.15, 0.86, 0.055]} material={materials.sageDark}>
          <boxGeometry args={[0.5, 0.04, 0.008]} />
        </mesh>
        <mesh position={[0.22, 0.92, 0.055]} material={materials.terracottaLight}>
          <boxGeometry args={[0.12, 0.12, 0.008]} />
        </mesh>
        <mesh position={[-0.05, 1.02, 0.056]} material={materials.metal}>
          <boxGeometry args={[0.08, 0.08, 0.008]} />
        </mesh>
      </group>

      <WallNotes position={[-1.05, 0.95, 0.12]} rotation={[0, Math.PI / 2, 0]} />

      <group position={[-1.28, 0, -0.92]} rotation={[0, Math.PI / 2, 0]}>
        <mesh position={[0, 1.42, 0]} material={materials.espresso}>
          <cylinderGeometry args={[0.145, 0.145, 0.03, 20]} />
        </mesh>
        <mesh position={[0, 1.42, 0.018]} material={materials.wall}>
          <cylinderGeometry args={[0.115, 0.115, 0.01, 20]} />
        </mesh>
        <mesh position={[0.04, 1.42, 0.022]} rotation={[0, 0, Math.PI / 4]} material={materials.metal}>
          <boxGeometry args={[0.006, 0.058, 0.006]} />
        </mesh>
      </group>

      <CeramicFloorPlant position={[-0.75, 0, 1.2]} />
    </group>
  );
}
