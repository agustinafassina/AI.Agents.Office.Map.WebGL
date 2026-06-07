export interface LiteLLMModel {
  id: string;
  object?: string;
  owned_by?: string;
}

export interface LiteLLMModelsResponse {
  object: string;
  data: LiteLLMModel[];
}

export interface ChatCompletionMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatCompletionMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface ChatCompletionStreamDelta {
  role?: string;
  content?: string;
}

export interface ChatCompletionStreamChoice {
  index: number;
  delta: ChatCompletionStreamDelta;
  finish_reason: string | null;
}

export interface ChatCompletionStreamChunk {
  id?: string;
  model?: string;
  choices: ChatCompletionStreamChoice[];
}

export interface ChatCompletionChoice {
  index: number;
  message: ChatCompletionMessage;
  finish_reason: string;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: ChatCompletionChoice[];
}
