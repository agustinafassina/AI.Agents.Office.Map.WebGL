import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import { useSceneStore } from '@/stores/scene.store';

export function CameraZoomHandler() {
  const { gl } = useThree();
  const setZoomLevel = useSceneStore((s) => s.setZoomLevel);

  useEffect(() => {
    const el = gl.domElement;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.08 : -0.08;
      const current = useSceneStore.getState().zoomLevel;
      setZoomLevel(current + delta);
    };

    el.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      el.removeEventListener('wheel', onWheel);
    };
  }, [gl, setZoomLevel]);

  return null;
}
