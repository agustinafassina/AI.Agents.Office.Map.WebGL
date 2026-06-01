import { HUB_DESK_RADIUS } from '@/components/scene/furniture/deskConstants';

export const AGENT_COLLISION_RADIUS = 0.22;

export type CircleObstacle = {
  kind: 'circle';
  x: number;
  z: number;
  radius: number;
};

export type BoxObstacle = {
  kind: 'box';
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
};

export type OfficeObstacle = CircleObstacle | BoxObstacle;

const HUB_X = 0.5;
const HUB_Z = 1.05;
const HUB_BLOCK_RADIUS = HUB_DESK_RADIUS + 0.38;

export const OFFICE_OBSTACLES: OfficeObstacle[] = [
  { kind: 'circle', x: HUB_X, z: HUB_Z, radius: HUB_BLOCK_RADIUS },
  { kind: 'box', minX: -3.0, maxX: 3.0, minZ: -5.45, maxZ: -1.85 },
  { kind: 'box', minX: 0.55, maxX: 3.55, minZ: -4.0, maxZ: -2.55 },
  { kind: 'circle', x: -4.35, z: 0.08, radius: 1.05 },
  { kind: 'box', minX: 4.35, maxX: 5.95, minZ: 1.15, maxZ: 2.65 },
  { kind: 'circle', x: -5.85, z: 4.25, radius: 0.45 },
  { kind: 'circle', x: 6.55, z: 3.35, radius: 0.45 },
  { kind: 'circle', x: 5.75, z: 1.4, radius: 0.35 },
];

export function hubPerimeterPosition(angleRad: number, margin = 0.35): [number, number, number] {
  const dist = HUB_BLOCK_RADIUS + AGENT_COLLISION_RADIUS + margin;
  return [HUB_X + Math.cos(angleRad) * dist, 0, HUB_Z + Math.sin(angleRad) * dist];
}
