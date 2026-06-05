import { create } from 'zustand';
import {
  getAgentChatAnchor,
  getAgentSpawnAnchor,
  getCoffeeBarAnchor,
  getZoneWaypoints,
  isNearChatAnchor,
  nearestZoneWaypointIndex,
} from '@/config/agentZones.config';
import { AGENT_DEFINITIONS, SCENE_CONFIG } from '@/config/agents.config';
import type { AgentDefinition, AgentRuntimeState, AgentStatus } from '@/types/agent';
import type { ChatAnchor } from '@/types/scene';
import {
  distance2D,
  lerpPosition,
  pickNextWaypointIndex,
  randomIdleDuration,
  rotationTowards,
} from '@/utils/movement';
import {
  moveWithAgentAwareness,
  resolveAllAgentOverlaps,
  sanitizeAgentPosition,
  sanitizeWalkPosition,
  type AgentCircle,
} from '@/utils/collision';

interface AgentsStore {
  definitions: AgentDefinition[];
  runtime: Record<string, AgentRuntimeState>;
  idleTimers: Record<string, number>;
  initialize: () => void;
  tick: (delta: number) => void;
  beginChatSession: (id: string) => void;
  endChatSession: (id: string) => void;
  setAgentStatus: (id: string, status: AgentStatus) => void;
  getRuntime: (id: string) => AgentRuntimeState | undefined;
}

const stuckSecondsByAgent = new Map<string, number>();
const STUCK_THRESHOLD = 0.55;
const MOVE_EPSILON = 0.004;

function applyChatAnchor(state: AgentRuntimeState, anchor: ChatAnchor): AgentRuntimeState {
  return {
    ...state,
    status: 'chatting',
    position: sanitizeWalkPosition([...anchor.position]),
    targetPosition: null,
    pendingChat: false,
    pendingCoffee: false,
    coffeeTimer: 0,
    rotation: anchor.rotation,
    posture: anchor.posture,
  };
}

function dispatchToChatAnchor(state: AgentRuntimeState, anchor: ChatAnchor): AgentRuntimeState {
  if (isNearChatAnchor(state.position, anchor)) {
    return applyChatAnchor(state, anchor);
  }

  return {
    ...state,
    status: 'walking',
    targetPosition: sanitizeWalkPosition([...anchor.position]),
    pendingChat: true,
    pendingCoffee: false,
    coffeeTimer: 0,
    posture: anchor.posture,
  };
}

function dispatchToCoffeeBar(state: AgentRuntimeState, anchor: ChatAnchor): AgentRuntimeState {
  if (isNearChatAnchor(state.position, anchor)) {
    return {
      ...state,
      status: 'coffee',
      position: sanitizeWalkPosition([...anchor.position]),
      targetPosition: null,
      pendingCoffee: false,
      rotation: anchor.rotation,
      posture: 'stand',
      coffeeTimer: randomIdleDuration(
        SCENE_CONFIG.coffeeDurationMin,
        SCENE_CONFIG.coffeeDurationMax,
      ),
    };
  }

  return {
    ...state,
    status: 'walking',
    targetPosition: sanitizeWalkPosition([...anchor.position]),
    pendingCoffee: true,
    pendingChat: false,
    coffeeTimer: 0,
    posture: 'stand',
  };
}

function createInitialRuntime(def: AgentDefinition): AgentRuntimeState {
  const anchor = getAgentSpawnAnchor(def);
  const spawn = sanitizeWalkPosition([...anchor.position]);
  return {
    id: def.id,
    status: 'idle',
    position: spawn,
    targetPosition: null,
    waypointIndex: nearestZoneWaypointIndex(def.homeZone, spawn),
    rotation: anchor.rotation,
    pendingChat: false,
    pendingCoffee: false,
    coffeeTimer: 0,
    posture: anchor.posture,
  };
}

function zoneWaypointsFor(def: AgentDefinition) {
  return getZoneWaypoints(def.homeZone);
}

function otherAgents(
  runtime: Record<string, AgentRuntimeState>,
  selfId: string,
): AgentCircle[] {
  return Object.entries(runtime)
    .filter(([id]) => id !== selfId)
    .map(([, state]) => ({ id: state.id, position: state.position }));
}

export const useAgentsStore = create<AgentsStore>((set, get) => ({
  definitions: AGENT_DEFINITIONS,
  runtime: {},
  idleTimers: {},

  initialize: () => {
    const runtime: Record<string, AgentRuntimeState> = {};
    const idleTimers: Record<string, number> = {};
    stuckSecondsByAgent.clear();
    AGENT_DEFINITIONS.forEach((def) => {
      runtime[def.id] = createInitialRuntime(def);
      idleTimers[def.id] = randomIdleDuration(
        SCENE_CONFIG.idlePauseMin,
        SCENE_CONFIG.idlePauseMax,
      );
      stuckSecondsByAgent.set(def.id, 0);
    });
    set({ runtime: resolveAllAgentOverlaps(runtime), idleTimers });
  },

  beginChatSession: (id) => {
    const def = AGENT_DEFINITIONS.find((agent) => agent.id === id);
    const state = get().runtime[id];
    if (!def || !state) return;

    stuckSecondsByAgent.set(id, 0);
    const anchor = getAgentChatAnchor(def);

    set({
      runtime: {
        ...get().runtime,
        [id]: dispatchToChatAnchor(state, anchor),
      },
    });
  },

  endChatSession: (id) => {
    const state = get().runtime[id];
    if (!state) return;

    set({
      runtime: {
        ...get().runtime,
        [id]: {
          ...state,
          status: 'idle',
          targetPosition: null,
          pendingChat: false,
          pendingCoffee: false,
          coffeeTimer: 0,
          posture: 'stand',
        },
      },
      idleTimers: {
        ...get().idleTimers,
        [id]: randomIdleDuration(SCENE_CONFIG.idlePauseMin, SCENE_CONFIG.idlePauseMax),
      },
    });
  },

  setAgentStatus: (id, status) => {
    const current = get().runtime[id];
    if (!current) return;
    set({
      runtime: {
        ...get().runtime,
        [id]: {
          ...current,
          status,
          pendingChat: status === 'chatting' ? false : current.pendingChat,
          pendingCoffee: status === 'chatting' ? false : current.pendingCoffee,
          coffeeTimer: status === 'chatting' ? 0 : current.coffeeTimer,
          posture: status === 'chatting' ? current.posture : 'stand',
        },
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

      const zoneWaypoints = zoneWaypointsFor(def);
      const chatAnchor = getAgentChatAnchor(def);

      if (state.status === 'chatting') continue;

      if (state.status === 'coffee') {
        const coffeeTimer = Math.max(0, state.coffeeTimer - delta);
        if (coffeeTimer <= 0 && zoneWaypoints.length > 0) {
          const wpIndex = nearestZoneWaypointIndex(def.homeZone, state.position);
          const target = sanitizeWalkPosition([...zoneWaypoints[wpIndex].position] as [
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
            pendingCoffee: false,
            coffeeTimer: 0,
          };
        } else {
          nextRuntime[def.id] = { ...state, coffeeTimer };
        }
        continue;
      }

      if (state.status === 'idle') {
        nextTimers[def.id] = (nextTimers[def.id] ?? 0) - delta;
        if (nextTimers[def.id] <= 0 && zoneWaypoints.length > 0) {
          const wantsCoffee = Math.random() < SCENE_CONFIG.coffeeBreakChance;

          if (wantsCoffee) {
            stuckSecondsByAgent.set(def.id, 0);
            nextRuntime[def.id] = dispatchToCoffeeBar(state, getCoffeeBarAnchor(def));
            continue;
          }

          const wpIndex = pickNextWaypointIndex(state.waypointIndex, zoneWaypoints);
          const target = sanitizeWalkPosition([...zoneWaypoints[wpIndex].position] as [
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
            pendingChat: false,
            pendingCoffee: false,
          };
        }
        continue;
      }

      if (state.status === 'walking' && state.targetPosition) {
        const dist = distance2D(state.position, state.targetPosition);
        const step = SCENE_CONFIG.walkSpeed * delta;

        if (dist <= step) {
          stuckSecondsByAgent.set(def.id, 0);

          if (state.pendingChat) {
            nextRuntime[def.id] = applyChatAnchor(
              {
                ...state,
                position: sanitizeAgentPosition(
                  [...state.targetPosition],
                  def.id,
                  otherAgents(nextRuntime, def.id),
                ),
              },
              chatAnchor,
            );
            continue;
          }

          if (state.pendingCoffee) {
            nextRuntime[def.id] = dispatchToCoffeeBar(
              {
                ...state,
                position: sanitizeAgentPosition(
                  [...state.targetPosition],
                  def.id,
                  otherAgents(nextRuntime, def.id),
                ),
              },
              getCoffeeBarAnchor(def),
            );
            continue;
          }

          nextRuntime[def.id] = {
            ...state,
            status: 'idle',
            position: sanitizeAgentPosition(
              [...state.targetPosition],
              def.id,
              otherAgents(nextRuntime, def.id),
            ),
            targetPosition: null,
            rotation: rotationTowards(state.position, state.targetPosition),
            pendingChat: false,
            pendingCoffee: false,
          };
          nextTimers[def.id] = randomIdleDuration(
            SCENE_CONFIG.idlePauseMin,
            SCENE_CONFIG.idlePauseMax,
          );
        } else {
          const t = step / dist;
          const desired = lerpPosition(state.position, state.targetPosition, t);
          const newPos = moveWithAgentAwareness(
            state.position,
            desired,
            def.id,
            otherAgents(nextRuntime, def.id),
          );
          const moved = distance2D(state.position, newPos);

          if (moved < MOVE_EPSILON) {
            const stuck = (stuckSecondsByAgent.get(def.id) ?? 0) + delta;
            stuckSecondsByAgent.set(def.id, stuck);

            if (stuck >= STUCK_THRESHOLD && zoneWaypoints.length > 0) {
              const wpIndex = pickNextWaypointIndex(state.waypointIndex, zoneWaypoints);
              const escape = sanitizeWalkPosition([...zoneWaypoints[wpIndex].position] as [
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

    set({ runtime: resolveAllAgentOverlaps(nextRuntime), idleTimers: nextTimers });
  },
}));
