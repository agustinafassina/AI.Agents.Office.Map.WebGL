import { useFrame, useThree } from '@react-three/fiber';
import { useLayoutEffect, useRef } from 'react';
import * as THREE from 'three';
import { useSceneStore } from '@/stores/scene.store';

const ISO_DIRECTION = new THREE.Vector3(1, 1.15, 1).normalize();
const CAMERA_DISTANCE = 20;

const FRUSTUM_HEIGHT = 15;

function applyFrustum(
  camera: THREE.OrthographicCamera,
  aspect: number,
  zoomLevel: number,
): void {
  const halfH = (FRUSTUM_HEIGHT / 2) * zoomLevel;
  const halfW = halfH * aspect;
  camera.left = -halfW;
  camera.right = halfW;
  camera.top = halfH;
  camera.bottom = -halfH;
  camera.updateProjectionMatrix();
}

export function IsometricCamera() {
  const { camera, size } = useThree();
  const panOffset = useSceneStore((s) => s.panOffset);
  const zoomLevel = useSceneStore((s) => s.zoomLevel);
  const viewIntent = useSceneStore((s) => s.viewIntent);
  const lookTarget = useRef(new THREE.Vector3(0, 0, 0));
  const smoothZoom = useRef(zoomLevel);
  const initialized = useRef(false);

  useLayoutEffect(() => {
    if (!(camera instanceof THREE.OrthographicCamera)) return;

    const aspect = size.width / Math.max(size.height, 1);
    smoothZoom.current = zoomLevel;
    applyFrustum(camera, aspect, smoothZoom.current);

    camera.near = -50;
    camera.far = 200;
    camera.zoom = 1;
    camera.up.set(0, 1, 0);

    lookTarget.current.set(0, 0, 0);
    camera.position.copy(lookTarget.current).add(
      ISO_DIRECTION.clone().multiplyScalar(CAMERA_DISTANCE),
    );
    camera.lookAt(lookTarget.current);
    initialized.current = true;
  }, [camera, size.width, size.height, zoomLevel]);

  useFrame((_, delta) => {
    if (!(camera instanceof THREE.OrthographicCamera) || !initialized.current) return;

    const [px, , pz] = panOffset;
    const desiredLook = new THREE.Vector3(px, 0, pz);

    const panRate = viewIntent === 'agent-focus' ? 3.4 : 5;
    const zoomRate = viewIntent === 'agent-focus' ? 4.8 : 8;
    const alpha = 1 - Math.exp(-panRate * delta);
    lookTarget.current.lerp(desiredLook, alpha);

    const desiredPos = lookTarget.current
      .clone()
      .add(ISO_DIRECTION.clone().multiplyScalar(CAMERA_DISTANCE));

    camera.position.lerp(desiredPos, alpha);
    camera.lookAt(lookTarget.current);

    smoothZoom.current += (zoomLevel - smoothZoom.current) * (1 - Math.exp(-zoomRate * delta));
    const aspect = size.width / Math.max(size.height, 1);
    applyFrustum(camera, aspect, smoothZoom.current);
  });

  return null;
}
