import { create } from 'zustand';
import {
  getAgentChatAnchor,
  getAgentSpawnAnchor,
  getZoneWaypoints,
  isNearChatAnchor,
  nearestZoneWaypointIndex,
} from '@/config/agentZones.config';
import {
  COFFEE_BAR_MAX_SERVING,
  getCoffeeBarQueueAnchor,
  isAtCoffeeBarQueueSlot,
} from '@/config/coffeeBarQueue';
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
  findChatApproachPosition,
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
let coffeeQueueTicketSeq = 1;

function clearCoffeeQueue(state: AgentRuntimeState): AgentRuntimeState {
  return {
    ...state,
    pendingCoffee: false,
    coffeeTimer: 0,
    coffeeQueueTicket: 0,
  };
}

function anchorPosition(anchor: ChatAnchor): [number, number, number] {
  if (anchor.posture === 'sit') {
    return sanitizeWalkPosition([...anchor.position], { allowFurniture: true });
  }
  return sanitizeWalkPosition([...anchor.position]);
}

function chatWalkTarget(anchor: ChatAnchor): [number, number, number] {
  if (anchor.posture === 'sit') {
    return findChatApproachPosition([...anchor.position]);
  }
  return sanitizeWalkPosition([...anchor.position]);
}

function applyChatAnchor(state: AgentRuntimeState, anchor: ChatAnchor): AgentRuntimeState {
  return {
    ...clearCoffeeQueue(state),
    status: 'chatting',
    position: anchorPosition(anchor),
    targetPosition: null,
    rotation: anchor.rotation,
    posture: anchor.posture,
  };
}

function dispatchToChatAnchor(state: AgentRuntimeState, anchor: ChatAnchor): AgentRuntimeState {
  if (isNearChatAnchor(state.position, anchor)) {
    return applyChatAnchor(state, anchor);
  }

  return {
    ...clearCoffeeQueue(state),
    status: 'walking',
    targetPosition: chatWalkTarget(anchor),
    pendingChat: true,
    posture: anchor.posture,
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
    coffeeQueueTicket: 0,
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

function isInCoffeeFlow(state: AgentRuntimeState): boolean {
  return (
    state.coffeeQueueTicket > 0 ||
    state.pendingCoffee ||
    state.status === 'coffee' ||
    state.status === 'coffee-queue'
  );
}

function getCoffeeQueueOrder(runtime: Record<string, AgentRuntimeState>): string[] {
  return AGENT_DEFINITIONS.map((def) => def.id)
    .filter((id) => isInCoffeeFlow(runtime[id]))
    .sort((a, b) => runtime[a].coffeeQueueTicket - runtime[b].coffeeQueueTicket);
}

function canBeginServing(
  queue: string[],
  agentId: string,
  runtime: Record<string, AgentRuntimeState>,
): boolean {
  const index = queue.indexOf(agentId);
  if (index < 0 || index >= COFFEE_BAR_MAX_SERVING) return false;

  for (let i = 0; i < index; i++) {
    const ahead = runtime[queue[i]];
    if (ahead.status === 'coffee') continue;
    if (!isAtCoffeeBarQueueSlot(ahead.position, i)) return false;
  }
  return true;
}

function applyCoffeeQueueSync(
  runtime: Record<string, AgentRuntimeState>,
): Record<string, AgentRuntimeState> {
  const next = { ...runtime };
  const queue = getCoffeeQueueOrder(next);

  for (let i = 0; i < queue.length; i++) {
    const id = queue[i];
    const state = next[id];
    if (!state || state.status === 'chatting') continue;

    const anchor = getCoffeeBarQueueAnchor(i);
    const target = sanitizeWalkPosition([...anchor.position], { allowFurniture: true });
    const atSlot = isAtCoffeeBarQueueSlot(state.position, i);
    const servingSlot = i < COFFEE_BAR_MAX_SERVING;

    if (state.status === 'coffee') {
      next[id] = {
        ...state,
        rotation: anchor.rotation,
        posture: 'stand',
        targetPosition: null,
        pendingCoffee: false,
      };
      continue;
    }

    if (servingSlot && canBeginServing(queue, id, next)) {
      if (atSlot) {
        next[id] = {
          ...state,
          status: 'coffee',
          position: target,
          targetPosition: null,
          pendingCoffee: false,
          rotation: anchor.rotation,
          posture: 'stand',
          coffeeTimer:
            state.coffeeTimer > 0
              ? state.coffeeTimer
              : randomIdleDuration(
                  SCENE_CONFIG.coffeeDurationMin,
                  SCENE_CONFIG.coffeeDurationMax,
                ),
        };
      } else {
        next[id] = {
          ...state,
          status: 'walking',
          pendingCoffee: true,
          targetPosition: target,
          posture: 'stand',
        };
      }
      continue;
    }

    if (atSlot) {
      next[id] = {
        ...state,
        status: 'coffee-queue',
        position: sanitizeWalkPosition([...state.position]),
        targetPosition: null,
        pendingCoffee: true,
        rotation: anchor.rotation,
        posture: 'stand',
      };
    } else {
      next[id] = {
        ...state,
        status: 'walking',
        pendingCoffee: true,
        targetPosition: target,
        posture: 'stand',
      };
    }
  }

  return next;
}

export const useAgentsStore = create<AgentsStore>((set, get) => ({
  definitions: AGENT_DEFINITIONS,
  runtime: {},
  idleTimers: {},

  initialize: () => {
    const runtime: Record<string, AgentRuntimeState> = {};
    const idleTimers: Record<string, number> = {};
    stuckSecondsByAgent.clear();
    coffeeQueueTicketSeq = 1;
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
          ...clearCoffeeQueue(state),
          status: 'idle',
          targetPosition: null,
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
          coffeeQueueTicket: status === 'chatting' ? 0 : current.coffeeQueueTicket,
          posture: status === 'chatting' ? current.posture : 'stand',
        },
      },
    });
  },

  getRuntime: (id) => get().runtime[id],

  tick: (delta) => {
    const { runtime, idleTimers } = get();
    let nextRuntime = { ...runtime };
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
            ...clearCoffeeQueue(state),
            status: 'walking',
            targetPosition: target,
            waypointIndex: wpIndex,
          };
        } else {
          nextRuntime[def.id] = { ...state, coffeeTimer };
        }
        continue;
      }

      if (state.status === 'coffee-queue') {
        continue;
      }

      if (state.status === 'idle') {
        nextTimers[def.id] = (nextTimers[def.id] ?? 0) - delta;
        if (nextTimers[def.id] <= 0 && zoneWaypoints.length > 0) {
          const wantsCoffee = Math.random() < SCENE_CONFIG.coffeeBreakChance;

          if (wantsCoffee) {
            stuckSecondsByAgent.set(def.id, 0);
            nextRuntime[def.id] = {
              ...state,
              coffeeQueueTicket: coffeeQueueTicketSeq++,
              pendingCoffee: true,
              status: 'walking',
              targetPosition: null,
              posture: 'stand',
            };
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

          if (state.pendingCoffee || state.coffeeQueueTicket > 0) {
            nextRuntime[def.id] = {
              ...state,
              position: sanitizeAgentPosition(
                [...state.targetPosition],
                def.id,
                otherAgents(nextRuntime, def.id),
                { allowFurniture: true },
              ),
              rotation: rotationTowards(state.position, state.targetPosition),
              targetPosition: null,
            };
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

            if (
              stuck >= STUCK_THRESHOLD &&
              zoneWaypoints.length > 0 &&
              !state.pendingCoffee &&
              state.coffeeQueueTicket === 0
            ) {
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

    nextRuntime = applyCoffeeQueueSync(nextRuntime);
    set({ runtime: resolveAllAgentOverlaps(nextRuntime), idleTimers: nextTimers });
  },
}));
