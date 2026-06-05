import { Edges } from '@react-three/drei';
import {
  PRIVATE_DESK_CENTER,
  PRIVATE_DESK_POSITIONS,
  PRIVATE_DESK_SPACING_Z,
  PRIVATE_DESK_X,
} from './deskConstants';
import { Plant } from './Plants';
import {
  CeramicFloorPlant,
  DeskCactus,
  StringLights,
  Terrarium,
  ZoneMat,
} from './decor/SceneDecor';
import { Workstation, type ChairStyle, type DeskPropType } from './Workstation';
import { materials, OUTLINE_COLOR } from '../materials';

const DESK_ROTATION = -Math.PI / 2;

const DESK_VARIANTS: { chairStyle: ChairStyle; props: DeskPropType }[] = [
  { chairStyle: 'forest', props: 'succulent' },
  { chairStyle: 'terracotta', props: 'mug' },
];

function DeskShelf({ side = 1 }: { side?: 1 | -1 }) {
  const x = 0.58 * side;
  const rotY = side > 0 ? -Math.PI / 2 : Math.PI / 2;

  return (
    <group position={[x, 0, 0]} rotation={[0, rotY, 0]}>
      {[0.88, 1.28, 1.68].map((y, i) => (
        <group key={i} position={[0, y, 0]}>
          <mesh castShadow material={materials.woodLight}>
            <boxGeometry args={[0.72, 0.04, 0.22]} />
          </mesh>
          <Edges color={OUTLINE_COLOR} threshold={15} />
        </group>
      ))}
      <Terrarium position={[0, 1.72, 0.08]} />
      <DeskCactus position={[0, 1.32, -0.1]} />
    </group>
  );
}

function PrivateDeskUnit({
  position,
  variantIndex,
}: {
  position: [number, number, number];
  variantIndex: number;
}) {
  const { chairStyle, props } = DESK_VARIANTS[variantIndex % DESK_VARIANTS.length];

  return (
    <group position={position}>
      <Workstation position={[0, 0, 0]} rotation={DESK_ROTATION} chairStyle={chairStyle} props={props} />
      {variantIndex === 0 && <DeskShelf side={1} />}
    </group>
  );
}

export function PrivateDesk() {
  const [, , centerZ] = PRIVATE_DESK_CENTER;

  return (
    <group>
      <ZoneMat
        position={[PRIVATE_DESK_X - 0.52, 0, centerZ]}
        size={[2.05, PRIVATE_DESK_SPACING_Z + 1.35]}
        variant="transition"
      />

      {PRIVATE_DESK_POSITIONS.map((position, i) => (
        <PrivateDeskUnit key={i} position={position} variantIndex={i} />
      ))}

      {/* Floor plants along the aisle */}
      <Plant position={[PRIVATE_DESK_X - 1.05, 0, centerZ + 0.15]} variant="tall" />
      <Plant position={[PRIVATE_DESK_X - 1.08, 0, centerZ - 0.55]} variant="fiddle" />
      <Plant position={[PRIVATE_DESK_X - 0.82, 0, centerZ + PRIVATE_DESK_SPACING_Z * 0.52]} variant="snake" />
      <Plant position={[PRIVATE_DESK_X - 0.78, 0, centerZ - PRIVATE_DESK_SPACING_Z * 0.52]} variant="medium" />
      <CeramicFloorPlant position={[PRIVATE_DESK_X - 0.95, 0, centerZ]} variant="compact" />

      {/* Corner accent between both desks */}
      <Plant position={[PRIVATE_DESK_X - 0.62, 0, centerZ]} variant="small" />

      <StringLights
        start={[PRIVATE_DESK_X + 0.42, 0, centerZ - PRIVATE_DESK_SPACING_Z * 0.55]}
        count={8}
        spacing={0.24}
        height={1.52}
        depth={0.08}
      />
    </group>
  );
}
