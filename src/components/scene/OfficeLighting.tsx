import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

const KEY_LIGHT_POS: [number, number, number] = [9, 18, -11];

export function OfficeLighting() {
  const keyRef = useRef<THREE.DirectionalLight>(null);

  useFrame(({ clock }) => {
    if (keyRef.current) {
      keyRef.current.intensity = 0.48 + Math.sin(clock.elapsedTime * 0.35) * 0.03;
    }
  });

  return (
    <>
      <ambientLight intensity={0.8} color="#f4f7fa" />
      <directionalLight
        ref={keyRef}
        position={KEY_LIGHT_POS}
        target-position={[0.5, 0, 0.5]}
        intensity={0.48}
        color="#fff9f4"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
        shadow-radius={5}
        shadow-camera-far={32}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
      />
      <directionalLight position={[-3, 12, 6]} intensity={0.15} color="#e8f0f8" />
      <hemisphereLight args={['#eef2f6', '#5a7a58', 0.48]} />
    </>
  );
}
