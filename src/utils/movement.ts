import type { Waypoint } from '@/types/scene';

export function distance2D(
  a: [number, number, number],
  b: [number, number, number],
): number {
  const dx = a[0] - b[0];
  const dz = a[2] - b[2];
  return Math.sqrt(dx * dx + dz * dz);
}

export function smoothStep(t: number): number {
  const x = Math.max(0, Math.min(1, t));
  return x * x * (3 - 2 * x);
}

export function lerpPosition(
  from: [number, number, number],
  to: [number, number, number],
  t: number,
): [number, number, number] {
  return [
    from[0] + (to[0] - from[0]) * t,
    from[1] + (to[1] - from[1]) * t,
    from[2] + (to[2] - from[2]) * t,
  ];
}

export function rotationTowards(
  from: [number, number, number],
  to: [number, number, number],
): number {
  return Math.atan2(to[0] - from[0], to[2] - from[2]);
}

export function pickNextWaypointIndex(
  currentIndex: number,
  waypoints: Waypoint[],
): number {
  if (waypoints.length <= 1) return 0;
  let next = currentIndex;
  while (next === currentIndex) {
    next = Math.floor(Math.random() * waypoints.length);
  }
  return next;
}

export function randomIdleDuration(min: number, max: number): number {
  return min + Math.random() * (max - min);
}