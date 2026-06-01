import { Plant } from './Plants';
import { StringLights, Terrarium } from './decor/SceneDecor';
import { Workstation } from './Workstation';
import { materials } from '../materials';

export function PrivateDesk() {
  return (
    <group position={[5.1, 0, 1.85]}>
      <Workstation position={[0, 0, 0]} rotation={-Math.PI / 2} chairStyle="sage" props="mug" />

      <group position={[-0.55, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        {[0.88, 1.28, 1.68].map((y, i) => (
          <mesh key={i} position={[0, y, 0]} castShadow material={materials.woodLight}>
            <boxGeometry args={[0.04, 0.7, 0.22]} />
          </mesh>
        ))}
        <Terrarium position={[0, 1.72, 0.08]} />
        <Plant position={[0, 1.32, -0.15]} variant="small" />
      </group>

      <Plant position={[0.65, 0, -0.45]} variant="tall" />

      <StringLights start={[-0.5, 0, 0.5]} count={5} spacing={0.4} height={1.5} depth={0.25} />
    </group>
  );
}