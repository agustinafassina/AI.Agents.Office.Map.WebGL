import type { AppLocale } from './types';
import { DEFAULT_LOCALE } from './types';

export type LocalizedTextMap = Partial<Record<AppLocale, string>> & { en: string };

export function parseLocalizedField(
  value: unknown,
): { text: string; map: LocalizedTextMap } | null {
  if (typeof value === 'string' && value.trim().length > 0) {
    const text = value.trim();
    return { text, map: { en: text, es: text } };
  }

  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    const record = value as Record<string, unknown>;
    const en = typeof record.en === 'string' ? record.en.trim() : '';
    const es = typeof record.es === 'string' ? record.es.trim() : '';
    if (!en) return null;
    return { text: en, map: { en, es: es || en } };
  }

  return null;
}

export function resolveLocalizedText(
  map: LocalizedTextMap | undefined,
  locale: AppLocale,
  fallback = '',
): string {
  if (!map) return fallback;
  return map[locale] ?? map[DEFAULT_LOCALE] ?? fallback;
}
