import { PRIVATE_DESK_CENTER, PRIVATE_DESK_MAX_Z, PRIVATE_DESK_MIN_Z, PRIVATE_DESK_POSITIONS, PRIVATE_DESK_SPACING_Z, PRIVATE_DESK_SPAN_Z, HUB_DESK_RADIUS } from '@/components/scene/furniture/deskConstants';
import { COFFEE_LOUNGE_POSITION } from '@/components/scene/furniture/coffeeLoungeConstants';
import { MEETING_ZONE_POSITION } from '@/components/scene/furniture/meetingConstants';

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
const [PRIVATE_X, , PRIVATE_CENTER_Z] = PRIVATE_DESK_CENTER;
const PRIVATE_HALF_SPAN_Z = PRIVATE_DESK_SPAN_Z / 2 + 0.55;
const [MEETING_X, , MEETING_Z] = MEETING_ZONE_POSITION;
const [, , LOUNGE_Z] = COFFEE_LOUNGE_POSITION;

export const OFFICE_OBSTACLES: OfficeObstacle[] = [
  { kind: 'circle', x: HUB_X, z: HUB_Z, radius: HUB_BLOCK_RADIUS },
  { kind: 'box', minX: -3.0, maxX: 3.0, minZ: -6.35, maxZ: -1.85 },
  { kind: 'box', minX: -3.0, maxX: 3.65, minZ: LOUNGE_Z - 1.35, maxZ: LOUNGE_Z + 2.15 },
  { kind: 'circle', x: MEETING_X, z: MEETING_Z, radius: 0.82 },
  { kind: 'circle', x: MEETING_X + 0.72, z: MEETING_Z + 0.88, radius: 0.32 },
  { kind: 'circle', x: MEETING_X + 0.48, z: MEETING_Z - 0.92, radius: 0.3 },
  { kind: 'circle', x: MEETING_X - 0.22, z: MEETING_Z + 0.72, radius: 0.28 },
  { kind: 'circle', x: MEETING_X + 0.95, z: MEETING_Z - 0.08, radius: 0.28 },
  { kind: 'box', minX: PRIVATE_X - 0.95, maxX: PRIVATE_X + 0.6, minZ: PRIVATE_CENTER_Z - PRIVATE_HALF_SPAN_Z, maxZ: PRIVATE_CENTER_Z + PRIVATE_HALF_SPAN_Z },
  ...PRIVATE_DESK_POSITIONS.map(([, , z]) => ({ kind: 'circle' as const, x: PRIVATE_X, z, radius: 0.85 })),
  { kind: 'circle', x: -5.85, z: 4.25, radius: 0.45 },
  { kind: 'circle', x: 6.55, z: 3.35, radius: 0.45 },
  { kind: 'circle', x: PRIVATE_X - 0.3, z: PRIVATE_DESK_MIN_Z - 0.58, radius: 0.32 },
  { kind: 'circle', x: PRIVATE_X - 0.3, z: PRIVATE_DESK_MAX_Z + 0.52, radius: 0.35 },
  { kind: 'circle', x: PRIVATE_X - 0.3, z: PRIVATE_DESK_MIN_Z + PRIVATE_DESK_SPACING_Z / 2, radius: 0.24 },
  { kind: 'circle', x: PRIVATE_X - 0.3, z: PRIVATE_DESK_MAX_Z - PRIVATE_DESK_SPACING_Z / 2, radius: 0.24 },
];

export function hubPerimeterPosition(angleRad: number, margin = 0.35): [number, number, number] {
  const dist = HUB_BLOCK_RADIUS + AGENT_COLLISION_RADIUS + margin;
  return [HUB_X + Math.cos(angleRad) * dist, 0, HUB_Z + Math.sin(angleRad) * dist];
}
