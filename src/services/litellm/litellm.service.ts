import { env, hasLiteLLMCredentials } from '@/config/env';
import { getMockAssistantReply, MOCK_MODELS } from '@/config/mock.models';
import type { ChatMessage } from '@/types/chat';
import type { ChatCompletionMessage, LiteLLMModel } from '@/types/litellm';
import { readLocale } from '@/utils/localeStorage';
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

export interface StreamMessageParams extends SendMessageParams {
  onDelta: (chunk: string) => void;
  signal?: AbortSignal;
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

async function streamMockReply(full: string, onDelta: (chunk: string) => void): Promise<void> {
  const tokens = full.match(/\S+\s*|\s+/g) ?? [full];
  for (const token of tokens) {
    if (token.length === 0) continue;
    onDelta(token);
    await delay(18 + Math.random() * 28);
  }
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

  async sendMessageStream(params: StreamMessageParams): Promise<SendMessageResult> {
    const { model, agentName, systemPrompt, history, userContent, onDelta, signal } = params;

    if (env.useMockLitellm || !hasLiteLLMCredentials()) {
      await delay(200 + Math.random() * 200);
      const content = getMockAssistantReply(agentName, userContent, readLocale());
      await streamMockReply(content, onDelta);
      return { content, model, mock: true };
    }

    try {
      const { model: resolvedModel, content } = await litellmClient.streamChatCompletion(
        {
          model,
          messages: toApiMessages(systemPrompt, history, userContent),
          temperature: 0.7,
        },
        onDelta,
        signal,
      );
      this.lastError = null;
      return { content, model: resolvedModel, mock: false };
    } catch (err) {
      const message =
        err instanceof LiteLLMClientError ? err.message : 'Chat completion failed';
      this.lastError = message;
      throw new Error(message);
    }
  }

  /** @deprecated Use sendMessageStream for UI streaming. */
  async sendMessage(params: SendMessageParams): Promise<SendMessageResult> {
    let content = '';
    const result = await this.sendMessageStream({
      ...params,
      onDelta: (chunk) => {
        content += chunk;
      },
    });
    return { ...result, content: result.content || content };
  }
}

export const liteLLMService = new LiteLLMService();
