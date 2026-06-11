import { create } from 'zustand';
import type { UserChatVisualMode } from '@/utils/chatVisualMode';

export interface PeerConversation {
  id: string;
  agentA: string;
  agentB: string;
  endsAt: number;
  lastMessage: string;
  lastSpeakerId: string | null;
  generatingAgentId: string | null;
  streaming: boolean;
}

interface ConversationVisualsStore {
  peerConversations: PeerConversation[];
  userChatAgentId: string | null;
  userChatMode: UserChatVisualMode;
  setUserChatContext: (agentId: string | null, mode: UserChatVisualMode) => void;
  startPeerConversation: (agentA: string, agentB: string, durationSec: number) => string;
  setPeerSpeech: (
    peerConvId: string,
    speakerId: string,
    text: string,
    streaming: boolean,
  ) => void;
  setPeerGenerating: (peerConvId: string, agentId: string | null) => void;
  extendPeerConversation: (peerConvId: string, extraSec: number) => void;
  finalizePeerConversation: (peerConvId: string, tailSec: number) => void;
  pruneExpired: (nowSec: number) => void;
  getPeerPartner: (agentId: string) => string | null;
  getPeerConversationForAgent: (agentId: string) => PeerConversation | null;
  isAgentInPeerChat: (agentId: string) => boolean;
  isAgentBusyForSocial: (agentId: string) => boolean;
}

let conversationSeq = 0;

export const useConversationVisualsStore = create<ConversationVisualsStore>((set, get) => ({
  peerConversations: [],
  userChatAgentId: null,
  userChatMode: 'off',

  setUserChatContext: (agentId, mode) => {
    const current = get();
    if (current.userChatAgentId === agentId && current.userChatMode === mode) return;
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
    if (busy.has(agentA) || busy.has(agentB)) return '';

    const id = `peer-${conversationSeq++}`;
    set({
      peerConversations: [
        ...peerConversations,
        {
          id,
          agentA,
          agentB,
          endsAt: now + durationSec,
          lastMessage: '',
          lastSpeakerId: null,
          generatingAgentId: null,
          streaming: false,
        },
      ],
    });
    return id;
  },

  setPeerSpeech: (peerConvId, speakerId, text, streaming) => {
    const chat = get().peerConversations.find((entry) => entry.id === peerConvId);
    if (
      chat &&
      chat.lastMessage === text &&
      chat.lastSpeakerId === speakerId &&
      chat.streaming === streaming
    ) {
      return;
    }

    set({
      peerConversations: get().peerConversations.map((entry) =>
        entry.id === peerConvId
          ? {
              ...entry,
              lastMessage: text,
              lastSpeakerId: speakerId,
              streaming,
            }
          : entry,
      ),
    });
  },

  setPeerGenerating: (peerConvId, agentId) => {
    set({
      peerConversations: get().peerConversations.map((chat) =>
        chat.id === peerConvId
          ? {
              ...chat,
              generatingAgentId: agentId,
              streaming: false,
            }
          : chat,
      ),
    });
  },

  extendPeerConversation: (peerConvId, extraSec) => {
    const now = performance.now() / 1000;
    const targetEndsAt = now + extraSec;
    const chat = get().peerConversations.find((entry) => entry.id === peerConvId);
    if (!chat || chat.endsAt >= targetEndsAt - 0.5) return;

    set({
      peerConversations: get().peerConversations.map((entry) =>
        entry.id === peerConvId
          ? { ...entry, endsAt: Math.max(entry.endsAt, targetEndsAt) }
          : entry,
      ),
    });
  },

  finalizePeerConversation: (peerConvId, tailSec) => {
    const now = performance.now() / 1000;
    set({
      peerConversations: get().peerConversations.map((chat) =>
        chat.id === peerConvId ? { ...chat, endsAt: now + tailSec, streaming: false } : chat,
      ),
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

  getPeerConversationForAgent: (agentId) => {
    for (const chat of get().peerConversations) {
      if (chat.agentA === agentId || chat.agentB === agentId) return chat;
    }
    return null;
  },

  isAgentInPeerChat: (agentId) => get().getPeerPartner(agentId) !== null,

  isAgentBusyForSocial: (agentId) => {
    if (get().userChatAgentId === agentId) return true;
    return get().isAgentInPeerChat(agentId);
  },
}));
