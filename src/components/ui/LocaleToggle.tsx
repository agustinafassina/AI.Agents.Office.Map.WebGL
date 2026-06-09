import type { AppLocale, TranslationKey } from '@/i18n';
import { APP_LOCALES, useTranslation } from '@/i18n';
import { useLocaleStore } from '@/stores/locale.store';
import { HudGlobeIcon } from './HudSelectIcons';
import './hudSelect.css';

const LOCALE_OPTIONS: { id: AppLocale; labelKey: TranslationKey }[] = [
  { id: 'en', labelKey: 'locale.en' },
  { id: 'es', labelKey: 'locale.es' },
];

export function LocaleToggle() {
  const { t } = useTranslation();
  const locale = useLocaleStore((state) => state.locale);
  const setLocale = useLocaleStore((state) => state.setLocale);

  return (
    <label className="hud-select">
      <span className="hud-select__icon">
        <HudGlobeIcon />
      </span>
      <select
        className="hud-select__control"
        value={locale}
        aria-label={t('locale.ariaLabel')}
        title={t('locale.label')}
        onChange={(event) => setLocale(event.target.value as AppLocale)}
      >
        {LOCALE_OPTIONS.filter((option) => APP_LOCALES.includes(option.id)).map(
          (option) => (
            <option key={option.id} value={option.id}>
              {t(option.labelKey)}
            </option>
          ),
        )}
      </select>
    </label>
  );
}
