import en from './locales/en.json';
import es from './locales/es.json';
import type { AppLocale, TranslationDictionary } from './types';

export const dictionaries: Record<AppLocale, TranslationDictionary> = {
  en,
  es,
};
