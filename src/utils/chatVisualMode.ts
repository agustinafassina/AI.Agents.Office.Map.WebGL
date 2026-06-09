import type { ConversationState } from '@/types/chat';

export type UserChatVisualMode = 'off' | 'active' | 'thinking' | 'streaming';

export function resolveUserChatVisualMode(
  agentId: string | null,
  conversation: ConversationState | undefined,
): { agentId: string | null; mode: UserChatVisualMode } {
  if (!agentId) {
    return { agentId: null, mode: 'off' };
  }

  if (!conversation?.isLoading) {
    return { agentId, mode: 'active' };
  }

  const lastAssistant = [...conversation.messages]
    .reverse()
    .find((message) => message.role === 'assistant');

  if (lastAssistant?.streaming && lastAssistant.content.length === 0) {
    return { agentId, mode: 'thinking' };
  }

  return { agentId, mode: 'streaming' };
}
