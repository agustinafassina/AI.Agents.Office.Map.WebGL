import { create } from 'zustand';
import { AGENT_DEFINITIONS } from '@/config/agents.config';
import { liteLLMService } from '@/services/litellm';
import type { ChatMessage, ConnectionStatus, ConversationState } from '@/types/chat';
import type { LiteLLMModel } from '@/types/litellm';
import { createId } from '@/utils/id';
import { useAgentsStore } from './agents.store';

interface ChatStore {
  isPanelOpen: boolean;
  activeAgentId: string | null;
  conversations: Record<string, ConversationState>;
  models: LiteLLMModel[];
  connectionStatus: ConnectionStatus;
  serviceMode: 'mock' | 'live' | 'error';
  bootstrap: () => Promise<void>;
  openChat: (agentId: string) => void;
  closeChat: () => void;
  sendMessage: (content: string) => Promise<void>;
  getActiveConversation: () => ConversationState | null;
  getActiveAgent: () => (typeof AGENT_DEFINITIONS)[number] | null;
}

function emptyConversation(agentId: string): ConversationState {
  return { agentId, messages: [], isLoading: false, error: null };
}

export const useChatStore = create<ChatStore>((set, get) => ({
  isPanelOpen: false,
  activeAgentId: null,
  conversations: {},
  models: [],
  connectionStatus: 'idle',
  serviceMode: 'mock',

  bootstrap: async () => {
    set({ connectionStatus: 'connecting' });
    try {
      const models = await liteLLMService.fetchModels();
      set({
        models,
        connectionStatus: 'connected',
        serviceMode: liteLLMService.mode,
      });
    } catch {
      set({
        connectionStatus: 'error',
        serviceMode: 'error',
      });
    }
  },

  openChat: (agentId) => {
    const conversations = { ...get().conversations };
    if (!conversations[agentId]) {
      conversations[agentId] = emptyConversation(agentId);
    }
    useAgentsStore.getState().beginChatSession(agentId);
    set({
      isPanelOpen: true,
      activeAgentId: agentId,
      conversations,
    });
  },

  closeChat: () => {
    const activeId = get().activeAgentId;
    if (activeId) {
      useAgentsStore.getState().endChatSession(activeId);
    }
    set({ isPanelOpen: false, activeAgentId: null });
  },

  getActiveAgent: () => {
    const id = get().activeAgentId;
    if (!id) return null;
    return AGENT_DEFINITIONS.find((a) => a.id === id) ?? null;
  },

  getActiveConversation: () => {
    const id = get().activeAgentId;
    if (!id) return null;
    return get().conversations[id] ?? null;
  },

  sendMessage: async (content) => {
    const agentId = get().activeAgentId;
    if (!agentId || !content.trim()) return;

    const agent = AGENT_DEFINITIONS.find((a) => a.id === agentId);
    if (!agent) return;

    const userMessage: ChatMessage = {
      id: createId('msg'),
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    };

    const conversations = { ...get().conversations };
    const conv = conversations[agentId] ?? emptyConversation(agentId);
    const history = [...conv.messages, userMessage];

    conversations[agentId] = {
      ...conv,
      messages: history,
      isLoading: true,
      error: null,
    };
    set({ conversations });

    try {
      const result = await liteLLMService.sendMessage({
        model: agent.modelId,
        agentName: agent.name,
        systemPrompt: agent.systemPrompt,
        history: conv.messages,
        userContent: userMessage.content,
      });

      const assistantMessage: ChatMessage = {
        id: createId('msg'),
        role: 'assistant',
        content: result.content,
        timestamp: Date.now(),
      };

      conversations[agentId] = {
        ...conversations[agentId],
        messages: [...history, assistantMessage],
        isLoading: false,
        error: null,
      };
      set({ conversations, serviceMode: liteLLMService.mode });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send message';
      conversations[agentId] = {
        ...conversations[agentId],
        isLoading: false,
        error: message,
      };
      set({ conversations, connectionStatus: 'error' });
    }
  },
}));
