import { Edges } from '@react-three/drei';
import { Plant } from './Plants';
import { StringLights, Terrarium, DeskCactus } from './decor/SceneDecor';
import { Workstation } from './Workstation';
import { materials } from '../materials';

export function PrivateDesk() {
  return (
    <group position={[5.1, 0, 1.85]}>
      <Workstation position={[0, 0, 0]} rotation={-Math.PI / 2} chairStyle="forest" props="succulent" />

      <group position={[-0.55, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        {[0.88, 1.28, 1.68].map((y, i) => (
          <group key={i} position={[0, y, 0]}>
            <mesh castShadow material={materials.woodLight}>
              <boxGeometry args={[0.72, 0.04, 0.22]} />
            </mesh>
            <Edges color="#6a7580" threshold={15} />
          </group>
        ))}
        <Terrarium position={[0, 1.72, 0.08]} />
        <DeskCactus position={[0, 1.32, -0.1]} />
      </group>

      <Plant position={[0.65, 0, -0.45]} variant="tall" />
      <Plant position={[0.35, 0, 0.55]} variant="snake" />

      <StringLights start={[-0.5, 0, 0.5]} count={6} spacing={0.38} height={1.52} depth={0.22} />
    </group>
  );
}
