import { env } from '@/config/env';
import type {
  ChatCompletionRequest,
  ChatCompletionResponse,
  LiteLLMModelsResponse,
} from '@/types/litellm';

export class LiteLLMClientError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'LiteLLMClientError';
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string>),
  };

  if (env.litellmApiKey) {
    headers.Authorization = `Bearer ${env.litellmApiKey}`;
  }

  const url = `${env.litellmBaseUrl.replace(/\/$/, '')}${path}`;
  const response = await fetch(url, { ...init, headers });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new LiteLLMClientError(
      body || `LiteLLM request failed (${response.status})`,
      response.status,
    );
  }

  return response.json() as Promise<T>;
}

export const litellmClient = {
  listModels: () => request<LiteLLMModelsResponse>('/v1/models'),

  chatCompletion: (payload: ChatCompletionRequest) =>
    request<ChatCompletionResponse>('/v1/chat/completions', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
