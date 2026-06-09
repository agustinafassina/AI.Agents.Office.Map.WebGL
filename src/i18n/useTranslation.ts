import { useCallback } from 'react';
import { useLocaleStore } from '@/stores/locale.store';
import { translate } from './translate';
import type { AppLocale, TranslationKey, TranslationVars } from './types';

export function useTranslation() {
  const locale = useLocaleStore((state) => state.locale);

  const t = useCallback(
    (key: TranslationKey, vars?: TranslationVars) => translate(locale, key, vars),
    [locale],
  );

  return { t, locale };
}

export function useLocale(): AppLocale {
  return useLocaleStore((state) => state.locale);
}
