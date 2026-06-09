import { dictionaries } from './catalog';
import type { AppLocale, TranslationKey, TranslationVars } from './types';
import { DEFAULT_LOCALE } from './types';

function getNestedValue(
  dictionary: Record<string, unknown>,
  key: string,
): string | undefined {
  const parts = key.split('.');
  let current: unknown = dictionary;

  for (const part of parts) {
    if (!current || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }

  return typeof current === 'string' ? current : undefined;
}

function interpolate(template: string, vars?: TranslationVars): string {
  if (!vars) return template;

  return template.replace(/\{\{(\w+)\}\}/g, (_, token: string) => {
    const value = vars[token];
    return value === undefined ? '' : String(value);
  });
}

export function translate(
  locale: AppLocale,
  key: TranslationKey,
  vars?: TranslationVars,
): string {
  const localized =
    getNestedValue(dictionaries[locale] as Record<string, unknown>, key) ??
    getNestedValue(dictionaries[DEFAULT_LOCALE] as Record<string, unknown>, key);

  if (!localized) return key;

  return interpolate(localized, vars);
}
