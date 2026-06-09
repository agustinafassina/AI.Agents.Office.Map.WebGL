import type { AppLocale } from '@/i18n/types';
import { resolveLocalizedText } from '@/i18n/localizedText';
import type { AgentDefinition } from '@/types/agent';

export function applyLocaleToAgents(
  agents: AgentDefinition[],
  locale: AppLocale,
): AgentDefinition[] {
  return agents.map((agent) => ({
    ...agent,
    role: resolveLocalizedText(agent.localized?.role, locale, agent.role),
    systemPrompt: agent.localized?.systemPrompt
      ? resolveLocalizedText(agent.localized.systemPrompt, locale, agent.systemPrompt)
      : agent.systemPrompt,
  }));
}
