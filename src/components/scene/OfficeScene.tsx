import { Canvas } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import { Suspense } from 'react';
import { OFFICE_PALETTE } from '@/config/agents.config';
import { useAgentMovement } from '@/hooks/useAgentMovement';
import { OfficeFloor } from './OfficeFloor';
import { OfficeLayout } from './OfficeLayout';
import { OfficeLighting } from './OfficeLighting';
import { IsometricCamera } from './IsometricCamera';
import { AgentsLayer } from './avatars/AgentsLayer';
import { CameraPanHandler } from './CameraPanHandler';
import { CameraZoomHandler } from './CameraZoomHandler';
import { TextureWarmup } from './TextureWarmup';
import { OptionalTextureLoader } from './OptionalTextureLoader';
import { OfficeZoneHotspots } from './OfficeZoneHotspots';
import { OfficePostProcessing } from './OfficePostProcessing';

const BG = OFFICE_PALETTE.sceneBackground;

function SceneContents() {
  useAgentMovement();

  return (
    <>
      <TextureWarmup />
      <OptionalTextureLoader />
      <IsometricCamera />
      <CameraPanHandler />
      <CameraZoomHandler />
      <OfficeLighting />
      <OfficeFloor />
      <OfficeLayout />
      <OfficeZoneHotspots />
      <ContactShadows
        position={[0.5, 0.01, 0.2]}
        opacity={0.28}
        width={14}
        height={11}
        blur={2.4}
        far={2.5}
        color="#1e2f27"
      />
      <AgentsLayer />
      <OfficePostProcessing />
    </>
  );
}

export function OfficeScene() {
  return (
    <Canvas
      orthographic
      shadows
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: false }}
      camera={{
        position: [11, 12.5, 11],
        near: -50,
        far: 200,
        zoom: 1,
      }}
      style={{ background: BG }}
      onPointerMissed={() => {
        document.body.style.cursor = 'default';
      }}
    >
      <color attach="background" args={[BG]} />
      <fog attach="fog" args={['#2a4538', 26, 50]} />
      <Suspense fallback={null}>
        <SceneContents />
      </Suspense>
    </Canvas>
  );
}
