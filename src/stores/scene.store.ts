import { create } from 'zustand';

const MIN_ZOOM = 0.55;
const MAX_ZOOM = 2.4;
const DEFAULT_ZOOM = 1;
const ZOOM_STEP = 0.12;

function clampZoom(value: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
}

interface SceneStore {
  selectedAgentId: string | null;
  panOffset: [number, number, number];
  zoomLevel: number;
  selectAgent: (id: string) => void;
  clearSelection: () => void;
  addPan: (dx: number, dz: number) => void;
  setZoomLevel: (level: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
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
    set({ panOffset: [x + dx, y, z + dz] });
  },

  setZoomLevel: (level) => set({ zoomLevel: clampZoom(level) }),

  zoomIn: () =>
    set({ zoomLevel: clampZoom(get().zoomLevel - ZOOM_STEP) }),

  zoomOut: () =>
    set({ zoomLevel: clampZoom(get().zoomLevel + ZOOM_STEP) }),

  resetZoom: () => set({ zoomLevel: DEFAULT_ZOOM }),
}));
