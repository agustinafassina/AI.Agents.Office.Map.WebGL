import type { LiteLLMModel } from '@/types/litellm';

export const MOCK_MODELS: LiteLLMModel[] = [
  { id: 'gpt-4o', object: 'model', owned_by: 'openai' },
  { id: 'gpt-4o-mini', object: 'model', owned_by: 'openai' },
  { id: 'claude-3-5-sonnet', object: 'model', owned_by: 'anthropic' },
  { id: 'gemini-2.0-flash', object: 'model', owned_by: 'google' },
];

const MOCK_REPLIES: Record<string, string[]> = {
  default: [
    "I'm here in the office map — ask me anything and I'll help.",
    'Good question. Let me think through that with you.',
    "From my desk in the diorama, I'd suggest breaking this into smaller steps.",
  ],
};

export function getMockAssistantReply(agentName: string, userMessage: string): string {
  const pool = MOCK_REPLIES[agentName.toLowerCase()] ?? MOCK_REPLIES.default;
  const snippet =
    userMessage.length > 60 ? `${userMessage.slice(0, 60)}…` : userMessage;
  const base = pool[Math.floor(Math.random() * pool.length)];
  return `${base}\n\nYou asked about **"${snippet}"**. Here's a quick take:\n\n- Break it into smaller steps\n- Test one change at a time\n- Check the \`CHECKLIST.md\` for next ideas\n\n*(Mock mode — enable live LiteLLM in \`.env\`)*`;
}
