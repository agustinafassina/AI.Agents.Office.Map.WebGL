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

const MOCK_PEER_OPENERS_EN = [
  'Hey, quick thought on the sprint board?',
  'Got a minute? I was looking at the auth flow.',
  'Coffee chat — how is your side of the release going?',
];

const MOCK_PEER_OPENERS_ES = [
  '¿Tenés un minuto? Estaba mirando el flujo de auth.',
  'Charla rápida — ¿cómo va tu parte del release?',
  'Oye, ¿viste lo del tablero del sprint?',
];

const MOCK_PEER_REPLIES_EN = [
  'Makes sense. I would start with the happy path and add error states after.',
  'Agreed — let us sync with Paula before we change scope.',
  'Good point. I can draft a quick checklist for QA.',
];

const MOCK_PEER_REPLIES_ES = [
  'Tiene sentido. Empezaría por el camino feliz y después los errores.',
  'De acuerdo — sincronicemos con Paula antes de cambiar el scope.',
  'Buen punto. Puedo armar un checklist rápido para QA.',
];

export function getMockPeerReply(
  agentName: string,
  peerName: string,
  isOpener: boolean,
  locale: AppLocale = 'en',
): string {
  if (isOpener) {
    const pool = locale === 'es' ? MOCK_PEER_OPENERS_ES : MOCK_PEER_OPENERS_EN;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  const pool = locale === 'es' ? MOCK_PEER_REPLIES_ES : MOCK_PEER_REPLIES_EN;
  const line = pool[Math.floor(Math.random() * pool.length)];
  if (locale === 'es') {
    return `${line} (${agentName} a ${peerName})`;
  }
  return `${line} (${agentName} to ${peerName})`;
}

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
