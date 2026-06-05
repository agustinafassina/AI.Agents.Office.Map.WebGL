import { COFFEE_LOUNGE_CENTER_Z, COFFEE_LOUNGE_POSITION, CAFE_HIGH_TABLE_LOCAL, CAFE_PRIMARY_STOOL_LOCAL } from '@/components/scene/furniture/coffeeLoungeConstants';
import {
  PRIVATE_DESK_CENTER,
  PRIVATE_DESK_POSITIONS,
  PRIVATE_DESK_X,
} from '@/components/scene/furniture/deskConstants';
import {
  MEETING_PRIMARY_PUFF,
  MEETING_PRIMARY_PUFF_SCALE,
  MEETING_ZONE_POSITION,
} from '@/components/scene/furniture/meetingConstants';
import { hubPerimeterPosition } from '@/config/officeObstacles';
import type { AgentDefinition, AgentHomeZone } from '@/types/agent';
import type { ChatAnchor, Waypoint } from '@/types/scene';

const LIVING_PUFF_SEAT: [number, number, number] = [
  MEETING_ZONE_POSITION[0] + MEETING_PRIMARY_PUFF[0],
  0,
  MEETING_ZONE_POSITION[2] + MEETING_PRIMARY_PUFF[2],
];

const CAFE_STOOL_SEAT: [number, number, number] = [
  COFFEE_LOUNGE_POSITION[0] + CAFE_PRIMARY_STOOL_LOCAL[0],
  0,
  COFFEE_LOUNGE_POSITION[2] + CAFE_PRIMARY_STOOL_LOCAL[2],
];

export const ZONE_WAYPOINTS: Waypoint[] = [
  { id: 'wp-center-north', zone: 'center-desk', position: hubPerimeterPosition(-Math.PI / 2) },
  { id: 'wp-center-east', zone: 'center-desk', position: hubPerimeterPosition(0) },
  { id: 'wp-center-west', zone: 'center-desk', position: hubPerimeterPosition(Math.PI) },
  { id: 'wp-center-south', zone: 'center-desk', position: hubPerimeterPosition(Math.PI / 2) },
  { id: 'wp-living-puff', zone: 'living', position: LIVING_PUFF_SEAT },
  { id: 'wp-living-table', zone: 'living', position: [MEETING_ZONE_POSITION[0], 0, MEETING_ZONE_POSITION[2]] },
  { id: 'wp-living-rug', zone: 'living', position: [MEETING_ZONE_POSITION[0] + 0.55, 0, MEETING_ZONE_POSITION[2] - 0.35] },
  { id: 'wp-living-board', zone: 'living', position: [MEETING_ZONE_POSITION[0] - 1.15, 0, MEETING_ZONE_POSITION[2] + 0.35] },
  { id: 'wp-cafeteria-table', zone: 'cafeteria', position: [-0.55, 0, COFFEE_LOUNGE_CENTER_Z + 0.95] },
  { id: 'wp-cafeteria-bar', zone: 'cafeteria', position: [0.35, 0, COFFEE_LOUNGE_CENTER_Z + 0.15] },
  { id: 'wp-cafeteria-high-table', zone: 'cafeteria', position: CAFE_STOOL_SEAT },
  { id: 'wp-wall-desks-path', zone: 'wall-desks', position: [4.2, 0, PRIVATE_DESK_CENTER[2]] },
  { id: 'wp-wall-desks-a', zone: 'wall-desks', position: [PRIVATE_DESK_X - 0.55, 0, PRIVATE_DESK_POSITIONS[0][2]] },
  { id: 'wp-wall-desks-b', zone: 'wall-desks', position: [PRIVATE_DESK_X - 0.55, 0, PRIVATE_DESK_POSITIONS[1][2]] },
  { id: 'wp-wall-desks-c', zone: 'wall-desks', position: [PRIVATE_DESK_X - 0.55, 0, PRIVATE_DESK_POSITIONS[2][2]] },
];

const ZONE_CHAT_ANCHORS: Record<AgentHomeZone, ChatAnchor> = {
  living: {
    position: LIVING_PUFF_SEAT,
    rotation: Math.atan2(
      MEETING_ZONE_POSITION[0] - LIVING_PUFF_SEAT[0],
      MEETING_ZONE_POSITION[2] - LIVING_PUFF_SEAT[2],
    ),
    posture: 'sit',
  },
  'center-desk': {
    position: hubPerimeterPosition(Math.PI / 2 + 0.15),
    rotation: Math.PI,
    posture: 'stand',
  },
  cafeteria: {
    position: CAFE_STOOL_SEAT,
    rotation: Math.atan2(
      CAFE_HIGH_TABLE_LOCAL[0] - CAFE_PRIMARY_STOOL_LOCAL[0],
      CAFE_HIGH_TABLE_LOCAL[2] - CAFE_PRIMARY_STOOL_LOCAL[2],
    ),
    posture: 'sit',
  },
  'wall-desks': {
    position: [PRIVATE_DESK_X - 0.82, 0, PRIVATE_DESK_CENTER[2]],
    rotation: Math.PI * 0.92,
    posture: 'sit',
  },
};

function wallDeskChatAnchor(slot: 0 | 1 | 2): ChatAnchor {
  const deskZ = PRIVATE_DESK_POSITIONS[slot][2];
  return {
    position: [PRIVATE_DESK_X - 0.82, 0, deskZ],
    rotation: Math.PI * 0.92,
    posture: 'sit',
  };
}

const CHAT_ARRIVAL_RADIUS = 0.28;

const COFFEE_BAR_FRONT_Z = COFFEE_LOUNGE_CENTER_Z + 0.22;

const COFFEE_BAR_SLOTS: [number, number, number][] = [
  [0.05, 0, COFFEE_BAR_FRONT_Z],
  [0.45, 0, COFFEE_BAR_FRONT_Z + 0.04],
  [-0.35, 0, COFFEE_BAR_FRONT_Z + 0.03],
  [0.85, 0, COFFEE_BAR_FRONT_Z + 0.02],
  [-0.75, 0, COFFEE_BAR_FRONT_Z + 0.05],
  [0.25, 0, COFFEE_BAR_FRONT_Z + 0.08],
];

const COFFEE_BAR_COUNTER: [number, number, number] = [0.1, 0, COFFEE_LOUNGE_CENTER_Z + 0.12];

export function getZoneWaypoints(zone: AgentHomeZone): Waypoint[] {
  return ZONE_WAYPOINTS.filter((wp) => wp.zone === zone);
}

export function getAgentChatAnchor(def: AgentDefinition): ChatAnchor {
  if (def.homeZone === 'wall-desks' && def.wallDeskSlot !== undefined) {
    return wallDeskChatAnchor(def.wallDeskSlot);
  }
  return ZONE_CHAT_ANCHORS[def.homeZone];
}

export function getAgentSpawnAnchor(def: AgentDefinition): ChatAnchor {
  return getAgentChatAnchor(def);
}

export function getAgentPuffScale(def: AgentDefinition): number {
  if (def.homeZone === 'living') return MEETING_PRIMARY_PUFF_SCALE;
  return 1;
}

export function nearestZoneWaypointIndex(
  zone: AgentHomeZone,
  position: [number, number, number],
): number {
  const list = getZoneWaypoints(zone);
  if (list.length === 0) return 0;

  let best = 0;
  let bestDist = Infinity;
  list.forEach((wp, index) => {
    const dx = wp.position[0] - position[0];
    const dz = wp.position[2] - position[2];
    const dist = dx * dx + dz * dz;
    if (dist < bestDist) {
      bestDist = dist;
      best = index;
    }
  });
  return best;
}

export function isNearChatAnchor(
  position: [number, number, number],
  anchor: ChatAnchor,
): boolean {
  const dx = position[0] - anchor.position[0];
  const dz = position[2] - anchor.position[2];
  return Math.sqrt(dx * dx + dz * dz) <= CHAT_ARRIVAL_RADIUS;
}

function coffeeSlotIndex(agentId: string): number {
  let h = 0;
  for (let i = 0; i < agentId.length; i++) h = (h * 31 + agentId.charCodeAt(i)) >>> 0;
  return h % COFFEE_BAR_SLOTS.length;
}

export function getCoffeeBarAnchor(def: AgentDefinition): ChatAnchor {
  const slot = COFFEE_BAR_SLOTS[coffeeSlotIndex(def.id)];
  return {
    position: slot,
    rotation: Math.atan2(
      COFFEE_BAR_COUNTER[0] - slot[0],
      COFFEE_BAR_COUNTER[2] - slot[2],
    ),
    posture: 'stand',
  };
}

export { CHAT_ARRIVAL_RADIUS };
