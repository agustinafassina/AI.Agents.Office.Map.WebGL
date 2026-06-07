import { env } from '@/config/env';
import type {
  ChatCompletionRequest,
  ChatCompletionResponse,
  ChatCompletionStreamChunk,
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

function buildHeaders(init?: RequestInit): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string>),
  };

  if (env.litellmApiKey) {
    headers.Authorization = `Bearer ${env.litellmApiKey}`;
  }

  return headers;
}

function buildUrl(path: string): string {
  return `${env.litellmBaseUrl.replace(/\/$/, '')}${path}`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(buildUrl(path), {
    ...init,
    headers: buildHeaders(init),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new LiteLLMClientError(
      body || `LiteLLM request failed (${response.status})`,
      response.status,
    );
  }

  return response.json() as Promise<T>;
}

function parseStreamPayload(line: string): string | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith('data:')) return null;
  const payload = trimmed.slice(5).trim();
  if (!payload || payload === '[DONE]') return null;
  return payload;
}

export async function streamChatCompletion(
  payload: ChatCompletionRequest,
  onDelta: (chunk: string) => void,
  signal?: AbortSignal,
): Promise<{ model: string; content: string }> {
  const response = await fetch(buildUrl('/v1/chat/completions'), {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify({ ...payload, stream: true }),
    signal,
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new LiteLLMClientError(
      body || `LiteLLM stream failed (${response.status})`,
      response.status,
    );
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new LiteLLMClientError('Streaming not supported by this browser');
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let content = '';
  let model = payload.model;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith(':')) continue;

      if (trimmed === 'data: [DONE]') {
        return { model, content };
      }

      const payloadText = parseStreamPayload(trimmed);
      if (!payloadText) continue;

      try {
        const json = JSON.parse(payloadText) as ChatCompletionStreamChunk;
        if (json.model) model = json.model;
        const delta = json.choices?.[0]?.delta?.content;
        if (delta) {
          content += delta;
          onDelta(delta);
        }
      } catch {
        // ignore malformed SSE chunks
      }
    }
  }

  return { model, content };
}

export const litellmClient = {
  listModels: () => request<LiteLLMModelsResponse>('/v1/models'),

  chatCompletion: (payload: ChatCompletionRequest) =>
    request<ChatCompletionResponse>('/v1/chat/completions', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  streamChatCompletion,
};
