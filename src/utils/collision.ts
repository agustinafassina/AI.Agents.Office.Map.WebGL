import {
  AGENT_COLLISION_RADIUS,
  OFFICE_OBSTACLES,
  type OfficeObstacle,
} from '@/config/officeObstacles';

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