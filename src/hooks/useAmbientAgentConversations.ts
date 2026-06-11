import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { env } from '@/config/env';
import { agentOrchestrator } from '@/services/agentOrchestrator.service';
import { distance2D } from '@/utils/movement';
import { useAgentsStore } from '@/stores/agents.store';
import { useConversationVisualsStore } from '@/stores/conversationVisuals.store';
import { useChatStore } from '@/stores/chat.store';
import { resolveUserChatVisualMode } from '@/utils/chatVisualMode';
import { isDemoRecordingMode } from '@/utils/demoMode';

const MAX_PEER_CHATS = 2;
const SOCIAL_COOLDOWN_SEC = 22;

function getPeerSpawnConfig() {
  if (isDemoRecordingMode()) {
    return { interval: 5, spawnChance: 1, maxDistance: 6 };
  }
  return { interval: 8, spawnChance: 0.85, maxDistance: 5.5 };
}

const socialCooldownUntil = new Map<string, number>();

function pickSocialPair(maxDistance: number): [string, string] | null {
  const { definitions, runtime } = useAgentsStore.getState();
  const visuals = useConversationVisualsStore.getState();
  const now = performance.now() / 1000;

  if (visuals.peerConversations.length >= MAX_PEER_CHATS) return null;

  const eligible = definitions.filter((def) => {
    const state = runtime[def.id];
    if (!state || (state.status !== 'idle' && state.status !== 'walking')) return false;
    if (visuals.isAgentBusyForSocial(def.id)) return false;
    const cooldown = socialCooldownUntil.get(def.id) ?? 0;
    return cooldown <= now;
  });

  if (eligible.length < 2) return null;

  let bestPair: [string, string] | null = null;
  let bestDistance = maxDistance + 1;

  for (let i = 0; i < eligible.length; i++) {
    for (let j = i + 1; j < eligible.length; j++) {
      const idA = eligible[i].id;
      const idB = eligible[j].id;
      const dist = distance2D(runtime[idA].position, runtime[idB].position);
      if (dist <= maxDistance && dist < bestDistance) {
        bestDistance = dist;
        bestPair = [idA, idB];
      }
    }
  }

  return bestPair;
}

const PRUNE_INTERVAL_SEC = 0.5;

export function useAmbientAgentConversations() {
  const spawnTimer = useRef(0);
  const pruneTimer = useRef(0);
  const lastChatContext = useRef<{
    agentId: string | null;
    mode: ReturnType<typeof resolveUserChatVisualMode>['mode'];
  }>({ agentId: null, mode: 'off' });

  useFrame((_, delta) => {
    const now = performance.now() / 1000;
    const visuals = useConversationVisualsStore.getState();

    pruneTimer.current += delta;
    if (pruneTimer.current >= PRUNE_INTERVAL_SEC) {
      pruneTimer.current = 0;
      visuals.pruneExpired(now);
    }

    const activeId = useChatStore.getState().activeAgentId;
    const conv = activeId ? useChatStore.getState().conversations[activeId] : undefined;
    const { agentId, mode } = resolveUserChatVisualMode(activeId, conv);
    if (
      lastChatContext.current.agentId !== agentId ||
      lastChatContext.current.mode !== mode
    ) {
      lastChatContext.current = { agentId, mode };
      visuals.setUserChatContext(agentId, mode);
    }

    const spawnConfig = getPeerSpawnConfig();

    spawnTimer.current += delta;
    if (spawnTimer.current < spawnConfig.interval) return;
    spawnTimer.current = 0;

    if (Math.random() > spawnConfig.spawnChance) return;

    const pair = pickSocialPair(spawnConfig.maxDistance);
    if (!pair) return;

    const [agentA, agentB] = pair;
    const duration = 5.5 + Math.random() * 4;
    const peerConvId = visuals.startPeerConversation(agentA, agentB, duration);
    if (!peerConvId) return;

    if (env.enableAgentPeerChat) {
      agentOrchestrator.enqueuePeerChat(peerConvId, agentA, agentB);
    }

    const endsAt = now + duration + SOCIAL_COOLDOWN_SEC;
    socialCooldownUntil.set(agentA, endsAt);
    socialCooldownUntil.set(agentB, endsAt);
  });
}
