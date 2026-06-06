import { env, hasLiteLLMCredentials } from '@/config/env';
import { getMockAssistantReply, MOCK_MODELS } from '@/config/mock.models';
import type { ChatMessage } from '@/types/chat';
import type { ChatCompletionMessage, LiteLLMModel } from '@/types/litellm';
import { litellmClient, LiteLLMClientError } from './litellm.client';

export type LiteLLMServiceStatus = 'mock' | 'live' | 'error';

export interface SendMessageParams {
  model: string;
  agentName: string;
  systemPrompt?: string;
  history: ChatMessage[];
  userContent: string;
}

export interface SendMessageResult {
  content: string;
  model: string;
  mock: boolean;
}

function toApiMessages(
  systemPrompt: string | undefined,
  history: ChatMessage[],
  userContent: string,
): ChatCompletionMessage[] {
  const messages: ChatCompletionMessage[] = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  for (const msg of history) {
    if (msg.role === 'user' || msg.role === 'assistant') {
      messages.push({ role: msg.role, content: msg.content });
    }
  }
  messages.push({ role: 'user', content: userContent });
  return messages;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class LiteLLMService {
  private cachedModels: LiteLLMModel[] | null = null;
  lastError: string | null = null;

  get mode(): LiteLLMServiceStatus {
    if (env.useMockLitellm || !hasLiteLLMCredentials()) return 'mock';
    if (this.lastError) return 'error';
    return 'live';
  }

  async fetchModels(): Promise<LiteLLMModel[]> {
    if (env.useMockLitellm || !hasLiteLLMCredentials()) {
      this.cachedModels = MOCK_MODELS;
      return MOCK_MODELS;
    }

    try {
      const res = await litellmClient.listModels();
      this.cachedModels = res.data;
      this.lastError = null;
      return res.data;
    } catch (err) {
      const message =
        err instanceof LiteLLMClientError
          ? err.message
          : 'Failed to fetch models from LiteLLM';
      this.lastError = message;
      this.cachedModels = env.useMockLitellm || !hasLiteLLMCredentials() ? MOCK_MODELS : [];
      return this.cachedModels;
    }
  }

  getCachedModels(): LiteLLMModel[] {
    if (this.cachedModels) return this.cachedModels;
    return env.useMockLitellm || !hasLiteLLMCredentials() ? MOCK_MODELS : [];
  }

  async sendMessage(params: SendMessageParams): Promise<SendMessageResult> {
    const { model, agentName, systemPrompt, history, userContent } = params;

    if (env.useMockLitellm || !hasLiteLLMCredentials()) {
      await delay(600 + Math.random() * 400);
      return {
        content: getMockAssistantReply(agentName, userContent),
        model,
        mock: true,
      };
    }

    try {
      const response = await litellmClient.chatCompletion({
        model,
        messages: toApiMessages(systemPrompt, history, userContent),
        temperature: 0.7,
      });
      const choice = response.choices[0]?.message?.content ?? '';
      this.lastError = null;
      return { content: choice, model: response.model, mock: false };
    } catch (err) {
      const message =
        err instanceof LiteLLMClientError
          ? err.message
          : 'Chat completion failed';
      this.lastError = message;
      throw new Error(message);
    }
  }
}

export const liteLLMService = new LiteLLMService();
