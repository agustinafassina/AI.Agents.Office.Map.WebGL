import type { ChatMessage, ConversationState } from '@/types/chat';

const STORAGE_KEY = 'office-map-chat-conversations';
const MAX_MESSAGES_PER_AGENT = 150;

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== 'object') return false;
  const msg = value as ChatMessage;
  return (
    typeof msg.id === 'string' &&
    (msg.role === 'user' || msg.role === 'assistant' || msg.role === 'system') &&
    typeof msg.content === 'string' &&
    typeof msg.timestamp === 'number'
  );
}

function sanitizeMessages(messages: unknown): ChatMessage[] {
  if (!Array.isArray(messages)) return [];

  return messages
    .filter(isChatMessage)
    .filter((msg) => msg.content.length > 0)
    .map(({ streaming: _streaming, ...msg }) => msg)
    .slice(-MAX_MESSAGES_PER_AGENT);
}

export function readChatConversations(): Record<string, ConversationState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};

    const conversations: Record<string, ConversationState> = {};

    for (const [agentId, value] of Object.entries(parsed)) {
      if (!value || typeof value !== 'object') continue;

      const record = value as { agentId?: string; messages?: unknown };
      const messages = sanitizeMessages(record.messages);
      if (messages.length === 0) continue;

      conversations[agentId] = {
        agentId: typeof record.agentId === 'string' ? record.agentId : agentId,
        messages,
        isLoading: false,
        error: null,
      };
    }

    return conversations;
  } catch {
    return {};
  }
}

export function writeChatConversations(
  conversations: Record<string, ConversationState>,
): void {
  const payload: Record<string, { agentId: string; messages: ChatMessage[] }> = {};

  for (const [agentId, conv] of Object.entries(conversations)) {
    const messages = sanitizeMessages(conv.messages);
    if (messages.length === 0) continue;

    payload[agentId] = {
      agentId: conv.agentId,
      messages,
    };
  }

  try {
    if (Object.keys(payload).length === 0) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Quota exceeded or private mode — skip silently; chat still works in memory.
  }
}
