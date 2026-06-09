import type { AppLocale } from './types';
import { translate } from './translate';
import type { TranslationKey } from './types';

const ROLE_HINT_KEYS: Record<string, TranslationKey[]> = {
  'ux-agent': ['roles.ux.hint1', 'roles.ux.hint2'],
  'backend-agent': ['roles.backend.hint1', 'roles.backend.hint2'],
  'qa-agent': ['roles.qa.hint1', 'roles.qa.hint2'],
  'po-agent': ['roles.po.hint1', 'roles.po.hint2'],
};

export function getRoleHints(locale: AppLocale, agentId: string): string[] {
  const keys = ROLE_HINT_KEYS[agentId];
  if (!keys) return [];
  return keys.map((key) => translate(locale, key));
}
