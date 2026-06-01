import { LShapedDesk } from './LShapedDesk';
import { DESK_SCALE, HUB_DESK_RADIUS } from './deskConstants';
import { VintageGlobe } from './WorkstationParts';

export function CentralWorkHub() {
  const r = HUB_DESK_RADIUS;
  return (
    <group position={[0.5, 0, 1.05]}>
      <LShapedDesk
        position={[0, 0, -r]}
        rotation={0}
        chairStyle="mesh"
        deskProp="mug"
        dualMonitor
        corner="inner"
      />
      <LShapedDesk
        position={[0, 0, r]}
        rotation={Math.PI}
        chairStyle="tan"
        deskProp="succulent"
        corner="inner"
      />
      <LShapedDesk
        position={[-r, 0, 0]}
        rotation={Math.PI / 2}
        chairStyle="white"
        deskProp="notebook"
        dualMonitor
        corner="inner"
      />
      <LShapedDesk
        position={[r, 0, 0]}
        rotation={-Math.PI / 2}
        chairStyle="cream"
        deskProp="pen"
        corner="inner"
      />
      <group scale={[DESK_SCALE, DESK_SCALE, DESK_SCALE]}>
        <VintageGlobe />
      </group>
    </group>
  );
}
