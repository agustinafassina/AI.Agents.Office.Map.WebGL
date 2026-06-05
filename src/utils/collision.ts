import {
  AGENT_COLLISION_RADIUS,
  OFFICE_OBSTACLES,
  type OfficeObstacle,
} from '@/config/officeObstacles';

export const AGENT_BODY_RADIUS = AGENT_COLLISION_RADIUS;
export const AGENT_PERSONAL_SPACE = AGENT_BODY_RADIUS * 2 + 0.1;

export type AgentCircle = {
  id: string;
  position: [number, number, number];
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

function circleBlocked(x: number, z: number, obs: Extract<OfficeObstacle, { kind: 'circle' }>, r: number): boolean {
  const dx = x - obs.x;
  const dz = z - obs.z;
  const limit = obs.radius + r;
  return dx * dx + dz * dz < limit * limit;
}

function boxBlocked(x: number, z: number, obs: Extract<OfficeObstacle, { kind: 'box' }>, r: number): boolean {
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
): boolean {
  return obstacles.some((obs) =>
    obs.kind === 'circle' ? circleBlocked(x, z, obs, radius) : boxBlocked(x, z, obs, radius),
  );
}

export function isWalkablePosition(position: [number, number, number]): boolean {
  return !isPositionBlocked(position[0], position[2]);
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

export function moveWithCollision(
  from: [number, number, number],
  to: [number, number, number],
): [number, number, number] {
  if (!isPositionBlocked(to[0], to[2])) return to;

  const tryX: [number, number, number] = [to[0], from[1], from[2]];
  if (!isPositionBlocked(tryX[0], tryX[2])) return tryX;

  const tryZ: [number, number, number] = [from[0], from[1], to[2]];
  if (!isPositionBlocked(tryZ[0], tryZ[2])) return tryZ;

  const dx = to[0] - from[0];
  const dz = to[2] - from[2];
  const stepLen = Math.sqrt(dx * dx + dz * dz) || 0.0001;

  for (const [sx, sz] of SLIDE_DIRS) {
    const slide: [number, number, number] = [
      from[0] + sx * stepLen,
      from[1],
      from[2] + sz * stepLen,
    ];
    if (!isPositionBlocked(slide[0], slide[2])) return slide;
  }

  return from;
}

export function resolvePenetration(
  position: [number, number, number],
): [number, number, number] {
  let [x, y, z] = position;
  const r = AGENT_COLLISION_RADIUS;

  for (let pass = 0; pass < 6; pass++) {
    let moved = false;
    for (const obs of OFFICE_OBSTACLES) {
      if (obs.kind === 'circle') {
        const dx = x - obs.x;
        const dz = z - obs.z;
        const dist = Math.sqrt(dx * dx + dz * dz) || 0.0001;
        const minDist = obs.radius + r + 0.02;
        if (dist < minDist) {
          const push = (minDist - dist) / dist;
          x += dx * push;
          z += dz * push;
          moved = true;
        }
      } else {
        const cx = (obs.minX + obs.maxX) / 2;
        const cz = (obs.minZ + obs.maxZ) / 2;
        const halfW = (obs.maxX - obs.minX) / 2 + r + 0.02;
        const halfD = (obs.maxZ - obs.minZ) / 2 + r + 0.02;
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
    if (!moved) break;
  }

  return [x, y, z];
}

export function sanitizeWalkPosition(
  position: [number, number, number],
): [number, number, number] {
  const resolved = resolvePenetration(position);
  if (isWalkablePosition(resolved)) return resolved;
  return resolved;
}

export function separateFromAgents(
  position: [number, number, number],
  selfId: string,
  others: AgentCircle[],
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

  return resolvePenetration([x, y, z]);
}

export function moveWithAgentAwareness(
  from: [number, number, number],
  to: [number, number, number],
  selfId: string,
  others: AgentCircle[],
): [number, number, number] {
  const obstacleSafe = moveWithCollision(from, to);
  let result = separateFromAgents(obstacleSafe, selfId, others);

  const progress = distance2D(from, result);
  const ideal = distance2D(from, to);

  if (ideal > 0.05 && progress < ideal * 0.2) {
    const dx = to[0] - from[0];
    const dz = to[2] - from[2];
    const len = Math.sqrt(dx * dx + dz * dz) || 1;
    const perpX = -dz / len;
    const perpZ = dx / len;

    for (const sign of [-1, 1]) {
      const sidestep: [number, number, number] = [
        from[0] + dx * 0.4 + perpX * sign * 0.32,
        from[1],
        from[2] + dz * 0.4 + perpZ * sign * 0.32,
      ];
      const candidate = separateFromAgents(moveWithCollision(from, sidestep), selfId, others);
      if (distance2D(from, candidate) > progress + 0.012) {
        result = candidate;
        break;
      }
    }
  }

  return result;
}

export function sanitizeAgentPosition(
  position: [number, number, number],
  selfId: string,
  others: AgentCircle[],
): [number, number, number] {
  return separateFromAgents(sanitizeWalkPosition(position), selfId, others);
}

export function resolveAllAgentOverlaps<T extends { id: string; position: [number, number, number] }>(
  states: Record<string, T>,
  iterations = 3,
): Record<string, T> {
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
        position: separateFromAgents(state.position, id, others),
      };
    }
  }

  return next;
}