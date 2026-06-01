import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { OfficeAmbientZones } from './OfficeAmbientZones';

const KEY_LIGHT_POS: [number, number, number] = [7, 15, -9];

export function OfficeLighting() {
  const keyRef = useRef<THREE.DirectionalLight>(null);

  useFrame(({ clock }) => {
    if (keyRef.current) {
      keyRef.current.intensity = 0.38 + Math.sin(clock.elapsedTime * 0.25) * 0.02;
    }
  });

  return (
    <>
      <ambientLight intensity={0.68} color="#faf6f0" />
      <directionalLight
        ref={keyRef}
        position={KEY_LIGHT_POS}
        intensity={0.38}
        color="#fff5e8"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.00008}
        shadow-radius={8}
        shadow-camera-far={32}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
      />
      <directionalLight position={[-5, 9, 4]} intensity={0.1} color="#dce8e4" />
      <hemisphereLight args={['#f8f6f2', '#3d5c48', 0.5]} />
      <OfficeAmbientZones />
    </>
  );
}
