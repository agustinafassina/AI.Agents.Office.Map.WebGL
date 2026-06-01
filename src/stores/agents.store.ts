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
import { moveWithCollision, sanitizeWalkPosition } from '@/utils/collision';

interface AgentsStore {
  definitions: AgentDefinition[];
  runtime: Record<string, AgentRuntimeState>;
  idleTimers: Record<string, number>;
  initialize: () => void;
  tick: (delta: number) => void;
  setAgentStatus: (id: string, status: AgentStatus) => void;
  getRuntime: (id: string) => AgentRuntimeState | undefined;
}

const stuckSecondsByAgent = new Map<string, number>();
const STUCK_THRESHOLD = 0.55;
const MOVE_EPSILON = 0.004;

function createInitialRuntime(def: AgentDefinition, index: number): AgentRuntimeState {
  const spawn = sanitizeWalkPosition([...def.spawnPosition]);
  return {
    id: def.id,
    status: 'idle',
    position: spawn,
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
    stuckSecondsByAgent.clear();
    AGENT_DEFINITIONS.forEach((def, i) => {
      runtime[def.id] = createInitialRuntime(def, i);
      idleTimers[def.id] = randomIdleDuration(
        SCENE_CONFIG.idlePauseMin,
        SCENE_CONFIG.idlePauseMax,
      );
      stuckSecondsByAgent.set(def.id, 0);
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
          const target = sanitizeWalkPosition([...OFFICE_WAYPOINTS[wpIndex].position] as [
            number,
            number,
            number,
          ]);
          stuckSecondsByAgent.set(def.id, 0);
          nextRuntime[def.id] = {
            ...state,
            status: 'walking',
            targetPosition: target,
            waypointIndex: wpIndex,
          };
        }
        continue;
      }

      if (state.status === 'walking' && state.targetPosition) {
        const dist = distance2D(state.position, state.targetPosition);
        const step = SCENE_CONFIG.walkSpeed * delta;

        if (dist <= step) {
          stuckSecondsByAgent.set(def.id, 0);
          nextRuntime[def.id] = {
            ...state,
            status: 'idle',
            position: sanitizeWalkPosition([...state.targetPosition]),
            targetPosition: null,
            rotation: rotationTowards(state.position, state.targetPosition),
          };
          nextTimers[def.id] = randomIdleDuration(
            SCENE_CONFIG.idlePauseMin,
            SCENE_CONFIG.idlePauseMax,
          );
        } else {
          const t = step / dist;
          const desired = lerpPosition(state.position, state.targetPosition, t);
          const newPos = sanitizeWalkPosition(moveWithCollision(state.position, desired));
          const moved = distance2D(state.position, newPos);

          if (moved < MOVE_EPSILON) {
            const stuck = (stuckSecondsByAgent.get(def.id) ?? 0) + delta;
            stuckSecondsByAgent.set(def.id, stuck);

            if (stuck >= STUCK_THRESHOLD) {
              const wpIndex = pickNextWaypointIndex(state.waypointIndex, OFFICE_WAYPOINTS);
              const escape = sanitizeWalkPosition([...OFFICE_WAYPOINTS[wpIndex].position] as [
                number,
                number,
                number,
              ]);
              stuckSecondsByAgent.set(def.id, 0);
              nextRuntime[def.id] = {
                ...state,
                status: 'walking',
                targetPosition: escape,
                waypointIndex: wpIndex,
                rotation: state.rotation,
              };
              continue;
            }
          } else {
            stuckSecondsByAgent.set(def.id, 0);
          }

          nextRuntime[def.id] = {
            ...state,
            position: newPos,
            rotation: rotationTowards(state.position, newPos),
          };
        }
      }
    }

    set({ runtime: nextRuntime, idleTimers: nextTimers });
  },
}));