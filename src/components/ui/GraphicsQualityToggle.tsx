import type { TranslationKey } from '@/i18n';
import { useTranslation } from '@/i18n';
import type { GraphicsQualityPreset } from '@/types/graphics';
import { useGraphicsStore } from '@/stores/graphics.store';
import { HudQualityIcon } from './HudSelectIcons';
import './hudSelect.css';

const OPTIONS: { id: GraphicsQualityPreset; labelKey: TranslationKey }[] = [
  { id: 'high', labelKey: 'graphics.high' },
  { id: 'balanced', labelKey: 'graphics.balanced' },
  { id: 'low', labelKey: 'graphics.low' },
];

export function GraphicsQualityToggle() {
  const { t } = useTranslation();
  const preset = useGraphicsStore((state) => state.preset);
  const setPreset = useGraphicsStore((state) => state.setPreset);

  return (
    <label className="hud-select">
      <span className="hud-select__icon">
        <HudQualityIcon />
      </span>
      <select
        className="hud-select__control hud-select__control--quality"
        value={preset}
        aria-label={t('graphics.ariaLabel')}
        title={t('graphics.label')}
        onChange={(event) => setPreset(event.target.value as GraphicsQualityPreset)}
      >
        {OPTIONS.map((option) => (
          <option key={option.id} value={option.id}>
            {t(option.labelKey)}
          </option>
        ))}
      </select>
    </label>
  );
}
