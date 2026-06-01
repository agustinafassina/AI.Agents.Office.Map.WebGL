export interface Waypoint {
  id: string;
  position: [number, number, number];
}

export interface OfficeBounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface CameraFocusTarget {
  position: [number, number, number];
  agentId: string;
}
