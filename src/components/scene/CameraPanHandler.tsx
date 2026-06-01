import { useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { useSceneStore } from '@/stores/scene.store';

export function CameraPanHandler() {
  const { gl } = useThree();
  const addPan = useSceneStore((s) => s.addPan);
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = gl.domElement;

    const onDown = (e: PointerEvent) => {
      if (e.button === 2 || (e.button === 0 && e.shiftKey)) {
        dragging.current = true;
        last.current = { x: e.clientX, y: e.clientY };
        e.preventDefault();
      }
    };

    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      const dx = (e.clientX - last.current.x) * 0.012;
      const dz = (e.clientY - last.current.y) * 0.012;
      last.current = { x: e.clientX, y: e.clientY };
      addPan(-dx, -dz);
    };

    const onUp = () => {
      dragging.current = false;
    };

    const onContext = (e: Event) => e.preventDefault();

    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('contextmenu', onContext);

    return () => {
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('contextmenu', onContext);
    };
  }, [gl, addPan]);

  return null;
}
