import { create } from 'zustand';

const MIN_ZOOM = 0.55;
const MAX_ZOOM = 2.4;
const DEFAULT_ZOOM = 1;
const ZOOM_STEP = 0.12;
const PAN_LIMIT_X = 5.8;
const PAN_LIMIT_Z = 5.2;

function clampZoom(value: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
}

function clampPan(value: number, limit: number): number {
  return Math.min(limit, Math.max(-limit, value));
}

interface SceneStore {
  selectedAgentId: string | null;
  panOffset: [number, number, number];
  zoomLevel: number;
  selectAgent: (id: string) => void;
  clearSelection: () => void;
  addPan: (dx: number, dz: number) => void;
  setView: (pan: [number, number, number], zoom?: number) => void;
  setZoomLevel: (level: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  resetView: () => void;
}

export const useSceneStore = create<SceneStore>((set, get) => ({
  selectedAgentId: null,
  panOffset: [0, 0, 0],
  zoomLevel: DEFAULT_ZOOM,

  selectAgent: (id) =>
    set({
      selectedAgentId: id,
    }),

  clearSelection: () =>
    set({
      selectedAgentId: null,
    }),

  addPan: (dx, dz) => {
    const [x, y, z] = get().panOffset;
    set({
      panOffset: [
        clampPan(x + dx, PAN_LIMIT_X),
        y,
        clampPan(z + dz, PAN_LIMIT_Z),
      ],
    });
  },

  setView: (pan, zoom) =>
    set({
      panOffset: [
        clampPan(pan[0], PAN_LIMIT_X),
        pan[1],
        clampPan(pan[2], PAN_LIMIT_Z),
      ],
      zoomLevel: zoom === undefined ? get().zoomLevel : clampZoom(zoom),
    }),

  setZoomLevel: (level) => set({ zoomLevel: clampZoom(level) }),

  zoomIn: () =>
    set({ zoomLevel: clampZoom(get().zoomLevel - ZOOM_STEP) }),

  zoomOut: () =>
    set({ zoomLevel: clampZoom(get().zoomLevel + ZOOM_STEP) }),

  resetZoom: () => set({ zoomLevel: DEFAULT_ZOOM }),

  resetView: () => set({ zoomLevel: DEFAULT_ZOOM, panOffset: [0, 0, 0] }),
}));