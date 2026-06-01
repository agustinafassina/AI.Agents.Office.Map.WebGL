import { create } from 'zustand';
import { AGENT_DEFINITIONS, OFFICE_WAYPOINTS, SCENE_CONFIG } from '@/config/agents.config';
import type { AgentDefinition, AgentRuntimeState, AgentStatus } from '@/types/agent';
import {
  distance2D,
  lerpPosition,
  pickNextWaypointIndex,
  randomIdleDuration,
  rotationTowards,
} from '@/utils/movement';

interface AgentsStore {
  definitions: AgentDefinition[];
  runtime: Record<string, AgentRuntimeState>;
  idleTimers: Record<string, number>;
  initialize: () => void;
  tick: (delta: number) => void;
  setAgentStatus: (id: string, status: AgentStatus) => void;
  getRuntime: (id: string) => AgentRuntimeState | undefined;
}

function createInitialRuntime(def: AgentDefinition, index: number): AgentRuntimeState {
  return {
    id: def.id,
    status: 'idle',
    position: [...def.spawnPosition],
    targetPosition: null,
    waypointIndex: index % OFFICE_WAYPOINTS.length,
    rotation: 0,
  };
}

export const useAgentsStore = create<AgentsStore>((set, get) => ({
  definitions: AGENT_DEFINITIONS,
  runtime: {},
  idleTimers: {},

  initialize: () => {
    const runtime: Record<string, AgentRuntimeState> = {};
    const idleTimers: Record<string, number> = {};
    AGENT_DEFINITIONS.forEach((def, i) => {
      runtime[def.id] = createInitialRuntime(def, i);
      idleTimers[def.id] = randomIdleDuration(
        SCENE_CONFIG.idlePauseMin,
        SCENE_CONFIG.idlePauseMax,
      );
    });
    set({ runtime, idleTimers });
  },

  setAgentStatus: (id, status) => {
    const current = get().runtime[id];
    if (!current) return;
    set({
      runtime: {
        ...get().runtime,
        [id]: { ...current, status },
      },
    });
  },

  getRuntime: (id) => get().runtime[id],

  tick: (delta) => {
    const { runtime, idleTimers } = get();
    const nextRuntime = { ...runtime };
    const nextTimers = { ...idleTimers };

    for (const def of AGENT_DEFINITIONS) {
      const state = nextRuntime[def.id];
      if (!state) continue;

      if (state.status === 'chatting') continue;

      if (state.status === 'idle') {
        nextTimers[def.id] = (nextTimers[def.id] ?? 0) - delta;
        if (nextTimers[def.id] <= 0) {
          const wpIndex = pickNextWaypointIndex(state.waypointIndex, OFFICE_WAYPOINTS);
          const target = OFFICE_WAYPOINTS[wpIndex].position;
          nextRuntime[def.id] = {
            ...state,
            status: 'walking',
            targetPosition: [...target],
            waypointIndex: wpIndex,
          };
        }
        continue;
      }

      if (state.status === 'walking' && state.targetPosition) {
        const dist = distance2D(state.position, state.targetPosition);
        const step = SCENE_CONFIG.walkSpeed * delta;
        if (dist <= step) {
          nextRuntime[def.id] = {
            ...state,
            status: 'idle',
            position: [...state.targetPosition],
            targetPosition: null,
            rotation: rotationTowards(state.position, state.targetPosition),
          };
          nextTimers[def.id] = randomIdleDuration(
            SCENE_CONFIG.idlePauseMin,
            SCENE_CONFIG.idlePauseMax,
          );
        } else {
          const t = step / dist;
          const newPos = lerpPosition(state.position, state.targetPosition, t);
          nextRuntime[def.id] = {
            ...state,
            position: newPos,
            rotation: rotationTowards(state.position, state.targetPosition),
          };
        }
      }
    }

    set({ runtime: nextRuntime, idleTimers: nextTimers });
  },
}));
