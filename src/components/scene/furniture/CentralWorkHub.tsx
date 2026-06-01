import { LShapedDesk } from './LShapedDesk';
import { VintageGlobe } from './WorkstationParts';

export function CentralWorkHub() {
  const r = 0.95;
  return (
    <group position={[0.5, 0, 1.1]}>
      <LShapedDesk
        position={[0, 0, -r]}
        rotation={0}
        chairStyle="mesh"
        deskProp="mug"
        corner="inner"
      />
      <LShapedDesk
        position={[0, 0, r]}
        rotation={Math.PI}
        chairStyle="tan"
        deskProp="pen"
        corner="inner"
      />
      <LShapedDesk
        position={[-r, 0, 0]}
        rotation={Math.PI / 2}
        chairStyle="white"
        deskProp="notebook"
        corner="inner"
      />
      <LShapedDesk
        position={[r, 0, 0]}
        rotation={-Math.PI / 2}
        chairStyle="cream"
        deskProp="succulent"
        corner="inner"
      />
      <VintageGlobe />
    </group>
  );
}