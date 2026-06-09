import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { distance2D } from '@/utils/movement';
import { useAgentsStore } from '@/stores/agents.store';
import { useConversationVisualsStore } from '@/stores/conversationVisuals.store';
import { useChatStore } from '@/stores/chat.store';
import { resolveUserChatVisualMode } from '@/utils/chatVisualMode';

const SPAWN_INTERVAL = 14;
const MAX_PEER_CHATS = 2;
const MAX_PAIR_DISTANCE = 3.4;
const SOCIAL_COOLDOWN_SEC = 22;

const socialCooldownUntil = new Map<string, number>();

function pickSocialPair(): [string, string] | null {
  const { definitions, runtime } = useAgentsStore.getState();
  const visuals = useConversationVisualsStore.getState();
  const now = performance.now() / 1000;

  if (visuals.peerConversations.length >= MAX_PEER_CHATS) return null;

  const eligible = definitions.filter((def) => {
    const state = runtime[def.id];
    if (!state || state.status !== 'idle') return false;
    if (visuals.isAgentBusyForSocial(def.id)) return false;
    const cooldown = socialCooldownUntil.get(def.id) ?? 0;
    return cooldown <= now;
  });

  if (eligible.length < 2) return null;

  for (let attempt = 0; attempt < 12; attempt++) {
    const a = eligible[Math.floor(Math.random() * eligible.length)];
    const sameZone = eligible.filter(
      (other) =>
        other.id !== a.id &&
        other.homeZone === a.homeZone &&
        distance2D(runtime[a.id].position, runtime[other.id].position) <= MAX_PAIR_DISTANCE,
    );
    if (sameZone.length === 0) continue;
    const b = sameZone[Math.floor(Math.random() * sameZone.length)];
    return [a.id, b.id];
  }

  return null;
}

export function useAmbientAgentConversations() {
  const spawnTimer = useRef(0);

  useFrame((_, delta) => {
    const now = performance.now() / 1000;
    const visuals = useConversationVisualsStore.getState();
    visuals.pruneExpired(now);

    const activeId = useChatStore.getState().activeAgentId;
    const conv = activeId ? useChatStore.getState().conversations[activeId] : undefined;
    const { agentId, mode } = resolveUserChatVisualMode(activeId, conv);
    visuals.setUserChatContext(agentId, mode);

    spawnTimer.current += delta;
    if (spawnTimer.current < SPAWN_INTERVAL) return;
    spawnTimer.current = 0;

    if (Math.random() > 0.42) return;

    const pair = pickSocialPair();
    if (!pair) return;

    const [agentA, agentB] = pair;
    const duration = 5.5 + Math.random() * 4;
    visuals.startPeerConversation(agentA, agentB, duration);

    const endsAt = now + duration + SOCIAL_COOLDOWN_SEC;
    socialCooldownUntil.set(agentA, endsAt);
    socialCooldownUntil.set(agentB, endsAt);
  });
}
