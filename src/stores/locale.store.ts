import { create } from 'zustand';
import type { AppLocale } from '@/i18n/types';
import { useAgentsStore } from '@/stores/agents.store';
import {
  applyDocumentLocale,
  hydrateLocale,
  writeLocale,
} from '@/utils/localeStorage';

interface LocaleStore {
  locale: AppLocale;
  hydrated: boolean;
  hydrate: () => void;
  setLocale: (locale: AppLocale) => void;
}

export const useLocaleStore = create<LocaleStore>((set) => ({
  locale: 'en',
  hydrated: false,

  hydrate: () => {
    set({
      locale: hydrateLocale(),
      hydrated: true,
    });
  },

  setLocale: (locale) => {
    writeLocale(locale);
    applyDocumentLocale(locale);
    set({ locale, hydrated: true });
    useAgentsStore.getState().applyLocale(locale);
  },
}));
