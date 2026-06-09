import { useTranslation } from '@/i18n';
import { useSceneStore } from '@/stores/scene.store';
import { UiIcon } from './UiIcon';
import './ZoomControls.css';

export function ZoomControls() {
  const { t } = useTranslation();
  const zoomIn = useSceneStore((s) => s.zoomIn);
  const zoomOut = useSceneStore((s) => s.zoomOut);
  const resetZoom = useSceneStore((s) => s.resetZoom);
  const resetView = useSceneStore((s) => s.resetView);

  return (
    <div className="zoom-controls" aria-label={t('zoom.ariaLabel')}>
      <button
        type="button"
        className="zoom-controls__btn"
        onClick={zoomIn}
        aria-label={t('zoom.in')}
        title={t('zoom.in')}
      >
        <UiIcon name="zoom-in" size={17} />
      </button>
      <button
        type="button"
        className="zoom-controls__btn"
        onClick={zoomOut}
        aria-label={t('zoom.out')}
        title={t('zoom.out')}
      >
        <UiIcon name="zoom-out" size={17} />
      </button>
      <button
        type="button"
        className="zoom-controls__btn zoom-controls__btn--reset"
        onClick={resetZoom}
        aria-label={t('zoom.reset')}
        title={t('zoom.reset')}
      >
        <UiIcon name="reset" size={16} />
      </button>
      <button
        type="button"
        className="zoom-controls__btn zoom-controls__btn--reset"
        onClick={resetView}
        aria-label={t('zoom.recenter')}
        title={t('zoom.recenter')}
      >
        <UiIcon name="recenter" size={16} />
      </button>
    </div>
  );
}
