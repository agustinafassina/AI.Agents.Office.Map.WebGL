import { create } from 'zustand';
import type { UserChatVisualMode } from '@/utils/chatVisualMode';

export interface PeerConversation {
  id: string;
  agentA: string;
  agentB: string;
  endsAt: number;
}

interface ConversationVisualsStore {
  peerConversations: PeerConversation[];
  userChatAgentId: string | null;
  userChatMode: UserChatVisualMode;
  setUserChatContext: (agentId: string | null, mode: UserChatVisualMode) => void;
  startPeerConversation: (agentA: string, agentB: string, durationSec: number) => void;
  pruneExpired: (nowSec: number) => void;
  getPeerPartner: (agentId: string) => string | null;
  isAgentInPeerChat: (agentId: string) => boolean;
  isAgentBusyForSocial: (agentId: string) => boolean;
}

let conversationSeq = 0;

export const useConversationVisualsStore = create<ConversationVisualsStore>((set, get) => ({
  peerConversations: [],
  userChatAgentId: null,
  userChatMode: 'off',

  setUserChatContext: (agentId, mode) => {
    set({ userChatAgentId: agentId, userChatMode: mode });
  },

  startPeerConversation: (agentA, agentB, durationSec) => {
    const now = performance.now() / 1000;
    const { peerConversations } = get();
    const busy = new Set<string>();
    for (const chat of peerConversations) {
      busy.add(chat.agentA);
      busy.add(chat.agentB);
    }
    if (busy.has(agentA) || busy.has(agentB)) return;

    const id = `peer-${conversationSeq++}`;
    set({
      peerConversations: [
        ...peerConversations,
        { id, agentA, agentB, endsAt: now + durationSec },
      ],
    });
  },

  pruneExpired: (nowSec) => {
    const next = get().peerConversations.filter((chat) => chat.endsAt > nowSec);
    if (next.length !== get().peerConversations.length) {
      set({ peerConversations: next });
    }
  },

  getPeerPartner: (agentId) => {
    for (const chat of get().peerConversations) {
      if (chat.agentA === agentId) return chat.agentB;
      if (chat.agentB === agentId) return chat.agentA;
    }
    return null;
  },

  isAgentInPeerChat: (agentId) => get().getPeerPartner(agentId) !== null,

  isAgentBusyForSocial: (agentId) => {
    if (get().userChatAgentId === agentId) return true;
    return get().isAgentInPeerChat(agentId);
  },
}));
