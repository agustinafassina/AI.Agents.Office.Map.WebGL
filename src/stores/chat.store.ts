import { create } from 'zustand';
import { resolveAgentDefinitions } from '@/config/resolveAgents';
import { liteLLMService } from '@/services/litellm';
import type { AgentDefinition } from '@/types/agent';
import type { ChatMessage, ConnectionStatus, ConversationState } from '@/types/chat';
import type { LiteLLMModel } from '@/types/litellm';
import {
  isAgentModelAvailableOnApi,
  resolveAgentModelLabel,
} from '@/utils/agentModel';
import {
  AGENT_COMMAND_ACK,
  parseAgentChatCommand,
} from '@/utils/chatAgentCommands';
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
  getActiveAgent: () => AgentDefinition | null;
  getAvailableAgents: () => AgentDefinition[];
  resolveModelLabel: (configuredModelId: string) => string;
  isModelAvailableOnApi: (configuredModelId: string) => boolean;
}

function emptyConversation(agentId: string): ConversationState {
  return { agentId, messages: [], isLoading: false, error: null };
}

function syncSceneAgents(agents: AgentDefinition[]) {
  useAgentsStore.getState().setDefinitions(agents);
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
      const serviceMode = liteLLMService.mode;
      const agents = resolveAgentDefinitions(serviceMode, models);
      syncSceneAgents(agents);
      set({
        models,
        connectionStatus: 'connected',
        serviceMode,
      });
    } catch {
      const agents = resolveAgentDefinitions('mock', []);
      syncSceneAgents(agents);
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

  getAvailableAgents: () => useAgentsStore.getState().definitions,

  getActiveAgent: () => {
    const id = get().activeAgentId;
    if (!id) return null;
    return useAgentsStore.getState().definitions.find((agent) => agent.id === id) ?? null;
  },

  getActiveConversation: () => {
    const id = get().activeAgentId;
    if (!id) return null;
    return get().conversations[id] ?? null;
  },

  resolveModelLabel: (configuredModelId) => {
    const { models, serviceMode } = get();
    return resolveAgentModelLabel(configuredModelId, models, serviceMode);
  },

  isModelAvailableOnApi: (configuredModelId) => {
    const { models, serviceMode } = get();
    return isAgentModelAvailableOnApi(configuredModelId, models, serviceMode);
  },

  sendMessage: async (content) => {
    const agentId = get().activeAgentId;
    if (!agentId || !content.trim()) return;

    const agent = get().getActiveAgent();
    if (!agent) return;

    const trimmed = content.trim();
    const command = parseAgentChatCommand(trimmed);

    const userMessage: ChatMessage = {
      id: createId('msg'),
      role: 'user',
      content: trimmed,
      timestamp: Date.now(),
    };

    const conversations = { ...get().conversations };
    const conv = conversations[agentId] ?? emptyConversation(agentId);

    if (command) {
      const dispatched = useAgentsStore.getState().dispatchAgentCommand(agentId, command);
      const assistantMessage: ChatMessage = {
        id: createId('msg'),
        role: 'assistant',
        content: dispatched
          ? AGENT_COMMAND_ACK[command]
          : 'No pude moverme ahora; probá de nuevo en un momento.',
        timestamp: Date.now(),
      };
      conversations[agentId] = {
        ...conv,
        messages: [...conv.messages, userMessage, assistantMessage],
        isLoading: false,
        error: null,
      };
      set({ conversations });
      return;
    }

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
