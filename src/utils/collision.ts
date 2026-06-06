import {
  AGENT_COLLISION_RADIUS,
  clampToWalkBounds,
  isFurnitureOccupiedPosition,
  OFFICE_OBSTACLES,
  type OfficeObstacle,
} from '@/config/officeObstacles';

export const AGENT_BODY_RADIUS = AGENT_COLLISION_RADIUS;
export const AGENT_PERSONAL_SPACE = AGENT_BODY_RADIUS * 2 + 0.1;

export type AgentCircle = {
  id: string;
  position: [number, number, number];
};

export type WalkCollisionOptions = {
  allowFurniture?: boolean;
};

function distance2D(
  a: [number, number, number],
  b: [number, number, number],
): number {
  const dx = a[0] - b[0];
  const dz = a[2] - b[2];
  return Math.sqrt(dx * dx + dz * dz);
}

function hashAngle(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return ((h % 360) * Math.PI) / 180;
}

function circleBlocked(
  x: number,
  z: number,
  obs: Extract<OfficeObstacle, { kind: 'circle' }>,
  r: number,
): boolean {
  const dx = x - obs.x;
  const dz = z - obs.z;
  const limit = obs.radius + r;
  return dx * dx + dz * dz < limit * limit;
}

function boxBlocked(
  x: number,
  z: number,
  obs: Extract<OfficeObstacle, { kind: 'box' }>,
  r: number,
): boolean {
  return (
    x >= obs.minX - r &&
    x <= obs.maxX + r &&
    z >= obs.minZ - r &&
    z <= obs.maxZ + r
  );
}

export function isPositionBlocked(
  x: number,
  z: number,
  radius = AGENT_COLLISION_RADIUS,
  obstacles = OFFICE_OBSTACLES,
  options: WalkCollisionOptions = {},
): boolean {
  const [cx, cz] = clampToWalkBounds(x, z);
  if (cx !== x || cz !== z) return true;

  if (options.allowFurniture) return false;

  return obstacles.some((obs) =>
    obs.kind === 'circle' ? circleBlocked(cx, cz, obs, radius) : boxBlocked(cx, cz, obs, radius),
  );
}

export function isWalkablePosition(
  position: [number, number, number],
  options: WalkCollisionOptions = {},
): boolean {
  return !isPositionBlocked(position[0], position[2], AGENT_COLLISION_RADIUS, OFFICE_OBSTACLES, options);
}

const SLIDE_DIRS: [number, number][] = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [0.707, 0.707],
  [-0.707, 0.707],
  [0.707, -0.707],
  [-0.707, -0.707],
];

function canMoveTo(
  x: number,
  z: number,
  options: WalkCollisionOptions,
): boolean {
  return !isPositionBlocked(x, z, AGENT_COLLISION_RADIUS, OFFICE_OBSTACLES, options);
}

function withBounds(position: [number, number, number]): [number, number, number] {
  const [x, z] = clampToWalkBounds(position[0], position[2]);
  return [x, position[1], z];
}

function arcCandidates(
  from: [number, number, number],
  to: [number, number, number],
): [number, number, number][] {
  const dx = to[0] - from[0];
  const dz = to[2] - from[2];
  const stepLen = Math.sqrt(dx * dx + dz * dz) || 0.0001;
  const heading = Math.atan2(dx, dz);
  const candidates: [number, number, number][] = [];

  for (const t of [0.35, 0.55, 0.75, 1]) {
    for (const sign of [-1, 1]) {
      for (const spread of [0.42, 0.78, 1.12]) {
        const angle = heading + sign * spread;
        candidates.push([
          from[0] + Math.sin(angle) * stepLen * t,
          from[1],
          from[2] + Math.cos(angle) * stepLen * t,
        ]);
      }
    }
  }

  return candidates;
}

export function moveWithCollision(
  from: [number, number, number],
  to: [number, number, number],
  options: WalkCollisionOptions = {},
): [number, number, number] {
  const target = withBounds(to);

  if (canMoveTo(target[0], target[2], options)) return target;

  const tryX = withBounds([target[0], from[1], from[2]]);
  if (canMoveTo(tryX[0], tryX[2], options)) return tryX;

  const tryZ = withBounds([from[0], from[1], target[2]]);
  if (canMoveTo(tryZ[0], tryZ[2], options)) return tryZ;

  const dx = target[0] - from[0];
  const dz = target[2] - from[2];
  const stepLen = Math.sqrt(dx * dx + dz * dz) || 0.0001;

  let best: [number, number, number] | null = null;
  let bestDist = -1;

  const tryCandidate = (candidate: [number, number, number]) => {
    const bounded = withBounds(candidate);
    if (!canMoveTo(bounded[0], bounded[2], options)) return;
    const progress = distance2D(from, bounded);
    if (progress > bestDist) {
      bestDist = progress;
      best = bounded;
    }
  };

  for (const [sx, sz] of SLIDE_DIRS) {
    tryCandidate([from[0] + sx * stepLen, from[1], from[2] + sz * stepLen]);
  }

  for (const candidate of arcCandidates(from, target)) {
    tryCandidate(candidate);
  }

  if (best) return best;

  return withBounds(from);
}

export function resolvePenetration(
  position: [number, number, number],
  skipFurniture = false,
): [number, number, number] {
  let [x, y, z] = withBounds(position);
  if (skipFurniture) return [x, y, z];

  const r = AGENT_COLLISION_RADIUS;

  for (let pass = 0; pass < 8; pass++) {
    let moved = false;
    for (const obs of OFFICE_OBSTACLES) {
      if (obs.kind === 'circle') {
        const dx = x - obs.x;
        const dz = z - obs.z;
        const dist = Math.sqrt(dx * dx + dz * dz) || 0.0001;
        const minDist = obs.radius + r + 0.03;
        if (dist < minDist) {
          const push = (minDist - dist) / dist;
          x += dx * push;
          z += dz * push;
          moved = true;
        }
      } else {
        const cx = (obs.minX + obs.maxX) / 2;
        const cz = (obs.minZ + obs.maxZ) / 2;
        const halfW = (obs.maxX - obs.minX) / 2 + r + 0.03;
        const halfD = (obs.maxZ - obs.minZ) / 2 + r + 0.03;
        const dx = x - cx;
        const dz = z - cz;
        if (Math.abs(dx) < halfW && Math.abs(dz) < halfD) {
          const overlapX = halfW - Math.abs(dx);
          const overlapZ = halfD - Math.abs(dz);
          if (overlapX < overlapZ) {
            x += dx > 0 ? overlapX : -overlapX;
          } else {
            z += dz > 0 ? overlapZ : -overlapZ;
          }
          moved = true;
        }
      }
    }

    [x, z] = clampToWalkBounds(x, z);
    if (!moved) break;
  }

  return [x, y, z];
}

export function findNearestWalkablePosition(
  position: [number, number, number],
  maxRadius = 1.35,
): [number, number, number] {
  const resolved = resolvePenetration(position);
  if (isWalkablePosition(resolved)) return resolved;

  for (let ring = 0.18; ring <= maxRadius; ring += 0.16) {
    const steps = Math.max(8, Math.ceil(ring * 10));
    for (let i = 0; i < steps; i++) {
      const angle = (i / steps) * Math.PI * 2;
      const candidate: [number, number, number] = [
        position[0] + Math.cos(angle) * ring,
        position[1],
        position[2] + Math.sin(angle) * ring,
      ];
      const bounded = resolvePenetration(candidate);
      if (isWalkablePosition(bounded)) return bounded;
    }
  }

  return resolved;
}

export function findChatApproachPosition(
  anchorPosition: [number, number, number],
  arrivalRadius = 0.28,
): [number, number, number] {
  const [ax, y, az] = anchorPosition;

  if (isWalkablePosition(anchorPosition)) {
    return anchorPosition;
  }

  for (let ring = 0.08; ring <= arrivalRadius; ring += 0.05) {
    const steps = Math.max(8, Math.ceil(ring * 14));
    for (let i = 0; i < steps; i++) {
      const angle = (i / steps) * Math.PI * 2;
      const candidate: [number, number, number] = [
        ax + Math.cos(angle) * ring,
        y,
        az + Math.sin(angle) * ring,
      ];
      if (!isWalkablePosition(candidate)) continue;
      const dx = candidate[0] - ax;
      const dz = candidate[2] - az;
      if (dx * dx + dz * dz <= arrivalRadius * arrivalRadius) {
        return candidate;
      }
    }
  }

  return findNearestWalkablePosition(anchorPosition);
}

export function findStandPositionNearSeat(
  seat: [number, number, number],
  preferredOffsets: [number, number][] = [],
): [number, number, number] {
  const [ax, y, az] = seat;

  for (const [ox, oz] of preferredOffsets) {
    const candidate = findNearestWalkablePosition([ax + ox, y, az + oz], 0.55);
    const dx = candidate[0] - ax;
    const dz = candidate[2] - az;
    if (dx * dx + dz * dz >= 0.28 * 0.28 && isWalkablePosition(candidate)) {
      return candidate;
    }
  }

  for (let ring = 0.52; ring <= 1.05; ring += 0.1) {
    const steps = Math.max(10, Math.ceil(ring * 12));
    for (let i = 0; i < steps; i++) {
      const angle = (i / steps) * Math.PI * 2;
      const candidate: [number, number, number] = [
        ax + Math.cos(angle) * ring,
        y,
        az + Math.sin(angle) * ring,
      ];
      if (isWalkablePosition(candidate)) {
        return candidate;
      }
    }
  }

  return findNearestWalkablePosition(seat, 2);
}

export function ejectFromFurniture(
  position: [number, number, number],
): [number, number, number] {
  if (!isFurnitureOccupiedPosition(position[0], position[2], AGENT_COLLISION_RADIUS * 0.35)) {
    return withBounds(position);
  }
  return findNearestWalkablePosition(position, 2);
}

export function sanitizeWalkPosition(
  position: [number, number, number],
  options: WalkCollisionOptions = {},
): [number, number, number] {
  if (options.allowFurniture) {
    return withBounds(position);
  }
  return findNearestWalkablePosition(position);
}

export function separateFromAgents(
  position: [number, number, number],
  selfId: string,
  others: AgentCircle[],
  skipFurniture = false,
): [number, number, number] {
  let [x, y, z] = position;
  const minDist = AGENT_PERSONAL_SPACE;

  for (const other of others) {
    if (other.id === selfId) continue;

    let dx = x - other.position[0];
    let dz = z - other.position[2];
    let distSq = dx * dx + dz * dz;

    if (distSq >= minDist * minDist) continue;

    if (distSq < 1e-8) {
      const angle = hashAngle(`${selfId}:${other.id}`);
      dx = Math.cos(angle) * 0.001;
      dz = Math.sin(angle) * 0.001;
      distSq = dx * dx + dz * dz;
    }

    const dist = Math.sqrt(distSq);
    const push = (minDist - dist) / dist;
    x += dx * push;
    z += dz * push;
  }

  return resolvePenetration([x, y, z], skipFurniture);
}

export function moveWithAgentAwareness(
  from: [number, number, number],
  to: [number, number, number],
  selfId: string,
  others: AgentCircle[],
  options: WalkCollisionOptions = {},
): [number, number, number] {
  const obstacleSafe = moveWithCollision(from, to, options);
  let result = separateFromAgents(obstacleSafe, selfId, others, options.allowFurniture);

  const progress = distance2D(from, result);
  const ideal = distance2D(from, to);

  if (ideal > 0.05 && progress < ideal * 0.18) {
    const dx = to[0] - from[0];
    const dz = to[2] - from[2];
    const len = Math.sqrt(dx * dx + dz * dz) || 1;
    const perpX = -dz / len;
    const perpZ = dx / len;

    for (const sign of [-1, 1]) {
      for (const scale of [0.28, 0.42, 0.56]) {
        const sidestep: [number, number, number] = [
          from[0] + dx * 0.45 + perpX * sign * scale,
          from[1],
          from[2] + dz * 0.45 + perpZ * sign * scale,
        ];
        const candidate = separateFromAgents(
          moveWithCollision(from, sidestep, options),
          selfId,
          others,
          options.allowFurniture,
        );
        if (distance2D(from, candidate) > progress + 0.01) {
          result = candidate;
          break;
        }
      }
    }
  }

  return result;
}

export function sanitizeAgentPosition(
  position: [number, number, number],
  selfId: string,
  others: AgentCircle[],
  options: WalkCollisionOptions = {},
): [number, number, number] {
  const base = options.allowFurniture ? withBounds(position) : sanitizeWalkPosition(position);
  return separateFromAgents(base, selfId, others, options.allowFurniture);
}

function shouldSkipFurniture<T extends { status: string }>(state: T): boolean {
  return state.status === 'chatting' || state.status === 'coffee' || state.status === 'coffee-queue';
}

export function resolveAllAgentOverlaps<
  T extends { id: string; position: [number, number, number]; status: string },
>(states: Record<string, T>, iterations = 3): Record<string, T> {
  const next: Record<string, T> = { ...states };
  const ids = Object.keys(next);

  for (let pass = 0; pass < iterations; pass++) {
    for (const id of ids) {
      const state = next[id];
      if (!state) continue;

      const others = ids
        .filter((otherId) => otherId !== id)
        .map((otherId) => ({
          id: otherId,
          position: next[otherId].position,
        }));

      next[id] = {
        ...state,
        position: shouldSkipFurniture(state)
          ? separateFromAgents(state.position, id, others, true)
          : ejectFromFurniture(separateFromAgents(state.position, id, others, false)),
      };
    }
  }

  return next;
}

export { isFurnitureOccupiedPosition };
