import type { AppLocale } from '@/i18n/types';
import { APP_LOCALES, DEFAULT_LOCALE } from '@/i18n/types';

const STORAGE_KEY = 'office-map-locale';

function isLocale(value: unknown): value is AppLocale {
  return typeof value === 'string' && APP_LOCALES.includes(value as AppLocale);
}

export function readLocale(): AppLocale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw && isLocale(raw)) return raw;
  } catch {
    // private mode / blocked storage
  }

  return DEFAULT_LOCALE;
}

export function writeLocale(locale: AppLocale): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // ignore
  }
}

export function applyDocumentLocale(locale: AppLocale): void {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = locale;
}

export function hydrateLocale(): AppLocale {
  const locale = readLocale();
  applyDocumentLocale(locale);
  return locale;
}
