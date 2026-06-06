import { create } from 'zustand';
import { getAgentFocusView } from '@/config/agentFocusView';
import { resolveActiveOfficeZone } from '@/config/resolveActiveOfficeZone';
import type { OfficeZoneId } from '@/config/officeZones';
import { useAgentsStore } from '@/stores/agents.store';

const MIN_ZOOM = 0.55;
const MAX_ZOOM = 2.4;
const DEFAULT_ZOOM = 1;
const ZOOM_STEP = 0.12;
const PAN_LIMIT_X = 5.8;
const PAN_LIMIT_Z = 5.2;

export type ViewIntent = 'agent-focus' | null;

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
  focusedZoneId: OfficeZoneId | null;
  viewIntent: ViewIntent;
  selectAgent: (id: string) => void;
  focusOnAgent: (id: string) => void;
  clearSelection: () => void;
  addPan: (dx: number, dz: number) => void;
  setView: (pan: [number, number, number], zoom?: number, zoneId?: OfficeZoneId) => void;
  setZoomLevel: (level: number) => void;
  zoomAtWorldPoint: (delta: number, worldX: number, worldZ: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  resetView: () => void;
}

export const useSceneStore = create<SceneStore>((set, get) => ({
  selectedAgentId: null,
  panOffset: [0, 0, 0],
  zoomLevel: DEFAULT_ZOOM,
  focusedZoneId: null,
  viewIntent: null,

  selectAgent: (id) =>
    set({
      selectedAgentId: id,
    }),

  focusOnAgent: (id) => {
    const def = useAgentsStore.getState().definitions.find((agent) => agent.id === id);
    if (!def) return;

    const runtime = useAgentsStore.getState().getRuntime(id);
    const { pan, zoom } = getAgentFocusView(def, runtime?.position);
    const panOffset: [number, number, number] = [
      clampPan(pan[0], PAN_LIMIT_X),
      0,
      clampPan(pan[2], PAN_LIMIT_Z),
    ];
    const zoomLevel = clampZoom(zoom);

    set({
      selectedAgentId: id,
      panOffset,
      zoomLevel,
      focusedZoneId: def.homeZone,
      viewIntent: 'agent-focus',
    });
  },

  clearSelection: () =>
    set({
      selectedAgentId: null,
      viewIntent: null,
    }),

  addPan: (dx, dz) => {
    const [x, y, z] = get().panOffset;
    const panOffset: [number, number, number] = [
      clampPan(x + dx, PAN_LIMIT_X),
      y,
      clampPan(z + dz, PAN_LIMIT_Z),
    ];
    set({
      panOffset,
      focusedZoneId: resolveActiveOfficeZone(panOffset, get().zoomLevel),
      viewIntent: null,
    });
  },

  setView: (pan, zoom, zoneId) => {
    const panOffset: [number, number, number] = [
      clampPan(pan[0], PAN_LIMIT_X),
      pan[1],
      clampPan(pan[2], PAN_LIMIT_Z),
    ];
    const zoomLevel = zoom === undefined ? get().zoomLevel : clampZoom(zoom);
    set({
      panOffset,
      zoomLevel,
      focusedZoneId: zoneId ?? resolveActiveOfficeZone(panOffset, zoomLevel),
      viewIntent: null,
    });
  },

  setZoomLevel: (level) => {
    const zoomLevel = clampZoom(level);
    set({
      zoomLevel,
      focusedZoneId: resolveActiveOfficeZone(get().panOffset, zoomLevel),
      viewIntent: null,
    });
  },

  zoomAtWorldPoint: (delta, worldX, worldZ) => {
    const { panOffset, zoomLevel: oldZoom } = get();
    const zoomLevel = clampZoom(oldZoom + delta);
    if (zoomLevel === oldZoom) return;

    const ratio = zoomLevel / oldZoom;
    const [panX, panY, panZ] = panOffset;
    const nextPan: [number, number, number] = [
      clampPan(panX + (worldX - panX) * (1 - ratio), PAN_LIMIT_X),
      panY,
      clampPan(panZ + (worldZ - panZ) * (1 - ratio), PAN_LIMIT_Z),
    ];

    set({
      zoomLevel,
      panOffset: nextPan,
      focusedZoneId: resolveActiveOfficeZone(nextPan, zoomLevel),
      viewIntent: null,
    });
  },

  zoomIn: () =>
    set({
      zoomLevel: clampZoom(get().zoomLevel - ZOOM_STEP),
      focusedZoneId: resolveActiveOfficeZone(get().panOffset, clampZoom(get().zoomLevel - ZOOM_STEP)),
      viewIntent: null,
    }),

  zoomOut: () =>
    set({
      zoomLevel: clampZoom(get().zoomLevel + ZOOM_STEP),
      focusedZoneId: resolveActiveOfficeZone(get().panOffset, clampZoom(get().zoomLevel + ZOOM_STEP)),
      viewIntent: null,
    }),

  resetZoom: () =>
    set({
      zoomLevel: DEFAULT_ZOOM,
      focusedZoneId: resolveActiveOfficeZone(get().panOffset, DEFAULT_ZOOM),
      viewIntent: null,
    }),

  resetView: () =>
    set({
      zoomLevel: DEFAULT_ZOOM,
      panOffset: [0, 0, 0],
      focusedZoneId: 'all',
      viewIntent: null,
    }),
}));
