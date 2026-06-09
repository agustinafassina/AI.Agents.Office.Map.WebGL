import type en from './locales/en.json';

export type AppLocale = 'en' | 'es';
export const APP_LOCALES: AppLocale[] = ['en', 'es'];
export const DEFAULT_LOCALE: AppLocale = 'en';
export type TranslationDictionary = typeof en;

type Join<P extends string, K extends string> = P extends '' ? K : `${P}.${K}`;

type LeafPaths<T, Prefix extends string = ''> = T extends string
  ? Prefix
  : {
      [K in keyof T & string]: LeafPaths<T[K], Join<Prefix, K>>;
    }[keyof T & string];

export type TranslationKey = LeafPaths<TranslationDictionary>;
export type TranslationVars = Record<string, string | number>;
