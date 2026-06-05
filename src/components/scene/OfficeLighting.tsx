import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { OfficeAmbientZones } from './OfficeAmbientZones';

const KEY_LIGHT_POS: [number, number, number] = [9, 17, -10];

function AccentSpot({
  position,
  target,
  intensity = 0.35,
  color = '#ffedb8',
  angle = 0.5,
}: {
  position: [number, number, number];
  target: [number, number, number];
  intensity?: number;
  color?: string;
  angle?: number;
}) {
  return (
    <spotLight
      position={position}
      angle={angle}
      penumbra={0.85}
      intensity={intensity}
      color={color}
      distance={12}
      decay={2}
      castShadow={false}
    >
      <object3D attach="target" position={target} />
    </spotLight>
  );
}

export function OfficeLighting() {
  const keyRef = useRef<THREE.DirectionalLight>(null);

  useFrame(({ clock }) => {
    if (keyRef.current) {
      keyRef.current.intensity = 0.44 + Math.sin(clock.elapsedTime * 0.22) * 0.018;
    }
  });

  return (
    <>
      <ambientLight intensity={0.58} color="#f6f0e6" />
      <directionalLight
        ref={keyRef}
        position={KEY_LIGHT_POS}
        intensity={0.46}
        color="#fff6ea"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.00008}
        shadow-radius={9}
        shadow-camera-far={32}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
      />
      <directionalLight position={[-7, 10, 5]} intensity={0.14} color="#d8e8e0" />
      <hemisphereLight args={['#f6f4ef', '#2d4a3a', 0.48]} />

      <AccentSpot
        position={[2.8, 3.2, -3.55]}
        target={[2.0, 0.85, -4.3]}
        intensity={0.42}
        color="#ffe8c4"
      />
      <AccentSpot
        position={[0.2, 3.4, -6.15]}
        target={[0, 1.1, -5.5]}
        intensity={0.32}
        color="#dcefdc"
        angle={0.65}
      />
      <AccentSpot
        position={[-5.8, 2.6, 0.6]}
        target={[-4.9, 1.05, 0.08]}
        intensity={0.28}
        color="#fafcfd"
        angle={0.45}
      />
      <AccentSpot
        position={[6.2, 2.4, 2.2]}
        target={[5.1, 0.9, 1.85]}
        intensity={0.22}
        color="#fff5e8"
      />
      <AccentSpot
        position={[0.5, 2.8, 3.2]}
        target={[0.5, 0.5, 1.05]}
        intensity={0.2}
        color="#f5f0e6"
        angle={0.55}
      />

      <OfficeAmbientZones />
    </>
  );
}
