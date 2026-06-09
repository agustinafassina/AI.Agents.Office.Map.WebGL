import type { AppLocale } from '@/i18n/types';
import type { LiteLLMModel } from '@/types/litellm';

export const MOCK_MODELS: LiteLLMModel[] = [
  { id: 'gpt-4o', object: 'model', owned_by: 'openai' },
  { id: 'gpt-4o-mini', object: 'model', owned_by: 'openai' },
  { id: 'claude-3-5-sonnet', object: 'model', owned_by: 'anthropic' },
  { id: 'gemini-2.0-flash', object: 'model', owned_by: 'google' },
];

const MOCK_REPLIES_EN: Record<string, string[]> = {
  default: [
    "I'm here in the office map — ask me anything and I'll help.",
    'Good question. Let me think through that with you.',
    "From my desk in the diorama, I'd suggest breaking this into smaller steps.",
  ],
};

const MOCK_REPLIES_ES: Record<string, string[]> = {
  default: [
    'Estoy acá en el mapa de la oficina — preguntame lo que quieras.',
    'Buena pregunta. Pensemos esto juntos.',
    'Desde mi escritorio en el diorama, te sugiero dividirlo en pasos más chicos.',
  ],
};

const MOCK_FOOTER_EN =
  '\n\n*(Mock mode — enable live LiteLLM in `.env`)*';
const MOCK_FOOTER_ES =
  '\n\n*(Modo mock — activá LiteLLM live en `.env`)*';

export function getMockAssistantReply(
  agentName: string,
  userMessage: string,
  locale: AppLocale = 'en',
): string {
  const pools = locale === 'es' ? MOCK_REPLIES_ES : MOCK_REPLIES_EN;
  const pool = pools[agentName.toLowerCase()] ?? pools.default;
  const snippet =
    userMessage.length > 60 ? `${userMessage.slice(0, 60)}…` : userMessage;
  const base = pool[Math.floor(Math.random() * pool.length)];

  if (locale === 'es') {
    return `${base}\n\nPreguntaste sobre **"${snippet}"**. Una idea rápida:\n\n- Dividilo en pasos más chicos\n- Probá un cambio a la vez\n- Mirá el \`CHECKLIST.md\` para próximas ideas${MOCK_FOOTER_ES}`;
  }

  return `${base}\n\nYou asked about **"${snippet}"**. Here's a quick take:\n\n- Break it into smaller steps\n- Test one change at a time\n- Check the \`CHECKLIST.md\` for next ideas${MOCK_FOOTER_EN}`;
}
