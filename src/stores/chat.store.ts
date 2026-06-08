import { create } from 'zustand';
import { loadExternalAgentsConfig } from '@/config/loadAgentsConfig';
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
  applyModelOverrides,
  writeAgentModelOverride,
} from '@/utils/agentModelOverrides';
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
  setActiveAgentModel: (modelId: string) => void;
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
  useAgentsStore.getState().setDefinitions(applyModelOverrides(agents));
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
      const [models, externalAgents] = await Promise.all([
        liteLLMService.fetchModels(),
        loadExternalAgentsConfig(),
      ]);
      const serviceMode = liteLLMService.mode;
      const agents = resolveAgentDefinitions(serviceMode, models, externalAgents);
      syncSceneAgents(agents);
      set({
        models,
        connectionStatus: 'connected',
        serviceMode,
      });
    } catch {
      const externalAgents = await loadExternalAgentsConfig();
      const agents = resolveAgentDefinitions('mock', [], externalAgents);
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

  setActiveAgentModel: (modelId) => {
    const agentId = get().activeAgentId;
    if (!agentId || !modelId) return;

    const { models } = get();
    if (!models.some((model) => model.id === modelId)) return;

    writeAgentModelOverride(agentId, modelId);
    useAgentsStore.getState().setAgentModelId(agentId, modelId);
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

    const assistantId = createId('msg');
    const assistantPlaceholder: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      streaming: true,
    };

    const history = [...conv.messages, userMessage];

    conversations[agentId] = {
      ...conv,
      messages: [...history, assistantPlaceholder],
      isLoading: true,
      error: null,
    };
    set({ conversations });

    const appendDelta = (chunk: string) => {
      const current = get().conversations[agentId];
      if (!current) return;

      const messages = current.messages.map((msg) =>
        msg.id === assistantId ? { ...msg, content: msg.content + chunk } : msg,
      );

      set({
        conversations: {
          ...get().conversations,
          [agentId]: { ...current, messages },
        },
      });
    };

    try {
      const result = await liteLLMService.sendMessageStream({
        model: agent.modelId,
        agentName: agent.name,
        systemPrompt: agent.systemPrompt,
        history: conv.messages,
        userContent: userMessage.content,
        onDelta: appendDelta,
      });

      const current = get().conversations[agentId];
      if (!current) return;

      const messages = current.messages.map((msg) =>
        msg.id === assistantId
          ? {
              ...msg,
              content: result.content || msg.content,
              streaming: false,
            }
          : msg,
      );

      conversations[agentId] = {
        ...current,
        messages,
        isLoading: false,
        error: null,
      };
      set({ conversations, serviceMode: liteLLMService.mode });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send message';
      const current = get().conversations[agentId];
      if (!current) return;

      const messages = current.messages
        .filter((msg) => msg.id !== assistantId || msg.content.length > 0)
        .map((msg) => (msg.id === assistantId ? { ...msg, streaming: false } : msg));

      conversations[agentId] = {
        ...current,
        messages,
        isLoading: false,
        error: message,
      };
      set({ conversations, connectionStatus: 'error' });
    }
  },
}));
