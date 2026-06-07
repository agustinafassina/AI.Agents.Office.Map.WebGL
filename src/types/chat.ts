export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: number;
  streaming?: boolean;
}

export interface ConversationState {
  agentId: string;
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error';
