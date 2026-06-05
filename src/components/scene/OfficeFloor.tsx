import { useMemo } from 'react';
import { OFFICE_PALETTE } from '@/config/agents.config';
import { getOfficeTextures } from '@/utils/textures/proceduralTextures';
import { materials } from './materials';
import { ZoneMat, WallTextureStripes } from './furniture/decor/SceneDecor';

const TILE = 1;
const COLS = 14;
const ROWS = 12;
const ORIGIN_X = -7;
const ORIGIN_Z = -6;

function CheckerTiles() {
  const tileMaterials = useMemo(() => {
    getOfficeTextures();
    return {
      sage: materials.tileSage.clone(),
      gray: materials.tileGray.clone(),
    };
  }, []);

  const tiles = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const isSage = (row + col) % 2 === 0;
      const cx = ORIGIN_X + col * TILE + TILE / 2;
      const cz = ORIGIN_Z + row * TILE + TILE / 2;
      tiles.push(
        <mesh
          key={`${row}-${col}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[cx, 0.003, cz]}
          receiveShadow
          material={isSage ? tileMaterials.sage : tileMaterials.gray}
        >
          <planeGeometry args={[TILE * 0.9, TILE * 0.9]} />
        </mesh>,
      );
    }
  }
  return <group>{tiles}</group>;
}

function TexturedWall({
  position,
  size,
  rotation = [0, 0, 0] as [number, number, number],
}: {
  position: [number, number, number];
  size: [number, number, number];
  rotation?: [number, number, number];
}) {
  const [w, h, d] = size;
  const wallMat = useMemo(() => materials.wall.clone(), []);

  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, h / 2, 0]} material={wallMat} castShadow receiveShadow>
        <boxGeometry args={size} />
      </mesh>
      <mesh position={[0, h / 2, d / 2 + 0.008]} material={materials.wallMarble}>
        <boxGeometry args={[w * 0.98, h * 0.94, 0.015]} />
      </mesh>
      <mesh position={[0, h + 0.02, 0]} material={materials.wallAccent}>
        <boxGeometry args={[w * 1.02, 0.04, d * 1.05]} />
      </mesh>
      <WallTextureStripes width={w} height={h} depth={d / 2 + 0.012} />
    </group>
  );
}

export function OfficeFloor() {
  const wallH = 0.55;
  const bg = OFFICE_PALETTE.sceneBackground;

  return (
    <group>
      <mesh position={[0.5, -0.35, 0]} material={materials.sageDark}>
        <boxGeometry args={[16.2, 0.1, 14.2]} />
      </mesh>

      <mesh position={[0.5, -0.16, 0]} receiveShadow material={materials.woodDark}>
        <boxGeometry args={[14.8, 0.22, 12.8]} />
      </mesh>

      <CheckerTiles />

      <ZoneMat position={[-0.4, 0, -1.2]} size={[1.6, 2.4]} variant="transition" />

      <TexturedWall position={[0.5, 0, -6.35]} size={[14.5, wallH, 0.18]} />
      <TexturedWall position={[-6.85, 0, 0]} size={[12.5, wallH, 0.18]} rotation={[0, Math.PI / 2, 0]} />
      <TexturedWall position={[7.15, 0, 1.5]} size={[7, wallH, 0.18]} rotation={[0, Math.PI / 2, 0]} />

      {[[-6.4, 4.6]].map(([x, z], i) => (
        <mesh key={i} position={[x, wallH / 2, z]} material={materials.wallAccent}>
          <boxGeometry args={[0.22, wallH, 0.22]} />
        </mesh>
      ))}

      <mesh position={[0.5, -0.08, 0]}>
        <boxGeometry args={[14.6, 0.02, 12.6]} />
        <meshBasicMaterial color={bg} transparent opacity={0.25} />
      </mesh>
    </group>
  );
}
