import { useSceneStore } from '@/stores/scene.store';
import { UiIcon } from './UiIcon';
import './ZoomControls.css';

export function ZoomControls() {
  const zoomIn = useSceneStore((s) => s.zoomIn);
  const zoomOut = useSceneStore((s) => s.zoomOut);
  const resetZoom = useSceneStore((s) => s.resetZoom);
  const resetView = useSceneStore((s) => s.resetView);

  return (
    <div className="zoom-controls" aria-label="Zoom del mapa">
      <button type="button" className="zoom-controls__btn" onClick={zoomIn} aria-label="Acercar" title="Acercar">
        <UiIcon name="zoom-in" size={17} />
      </button>
      <button type="button" className="zoom-controls__btn" onClick={zoomOut} aria-label="Alejar" title="Alejar">
        <UiIcon name="zoom-out" size={17} />
      </button>
      <button
        type="button"
        className="zoom-controls__btn zoom-controls__btn--reset"
        onClick={resetZoom}
        aria-label="Restablecer zoom"
        title="Restablecer zoom"
      >
        <UiIcon name="reset" size={16} />
      </button>
      <button
        type="button"
        className="zoom-controls__btn zoom-controls__btn--reset"
        onClick={resetView}
        aria-label="Recentrar vista"
        title="Recentrar vista"
      >
        <UiIcon name="recenter" size={16} />
      </button>
    </div>
  );
}
