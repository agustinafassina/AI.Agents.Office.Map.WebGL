import { useSceneStore } from '@/stores/scene.store';
import './ZoomControls.css';

export function ZoomControls() {
  const zoomIn = useSceneStore((s) => s.zoomIn);
  const zoomOut = useSceneStore((s) => s.zoomOut);
  const resetZoom = useSceneStore((s) => s.resetZoom);

  return (
    <div className="zoom-controls" aria-label="Zoom del mapa">
      <button
        type="button"
        className="zoom-controls__btn"
        onClick={zoomIn}
        aria-label="Acercar"
        title="Acercar"
      >
        +
      </button>
      <button
        type="button"
        className="zoom-controls__btn"
        onClick={zoomOut}
        aria-label="Alejar"
        title="Alejar"
      >
        −
      </button>
      <button
        type="button"
        className="zoom-controls__btn zoom-controls__btn--reset"
        onClick={resetZoom}
        aria-label="Restablecer zoom"
        title="Restablecer zoom"
      >
        ⟲
      </button>
    </div>
  );
}