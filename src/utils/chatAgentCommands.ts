export type AgentChatCommand = 'coffee' | 'relax' | 'desk';

const ACCENT_STRIP = /[^\p{L}\p{N}\s]/gu;

function normalize(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(ACCENT_STRIP, ' ')
    .replace(/\s+/g, ' ');
}

export function parseAgentChatCommand(content: string): AgentChatCommand | null {
  const text = normalize(content);
  if (!text) return null;

  if (
    /^(ve a |ir a )?(tomar )?(un )?cafe\b/.test(text) ||
    /^coffee break$/.test(text) ||
    /^take coffee$/.test(text) ||
    text === 'cafe'
  ) {
    return 'coffee';
  }

  if (
    /^(relajate|relaja|relax|descansa|descanso)\b/.test(text) ||
    /^(ve a |ir a )?(el )?living\b/.test(text) ||
    /^chill\b/.test(text)
  ) {
    return 'relax';
  }

  if (
    /^(vuelve|volvi|regresa|ir) (a |al )?(tu )?(desk|escritorio|puesto)\b/.test(text) ||
    /^(back to|go to) (your )?desk\b/.test(text) ||
    text === 'desk' ||
    text === 'escritorio'
  ) {
    return 'desk';
  }

  return null;
}

export const AGENT_COMMAND_HINTS = [
  've a tomar cafe',
  'relajate',
  'vuelve al escritorio',
] as const;

export const AGENT_COMMAND_ACK: Record<AgentChatCommand, string> = {
  coffee: 'Voy a la cafeteria. Te sigo respondiendo desde la barra.',
  relax: 'Me muevo al living un rato. Seguimos en chat.',
  desk: 'Vuelvo a mi zona de trabajo.',
};
