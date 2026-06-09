import { useEffect, useState, type ReactElement } from 'react';
import {
  Bloom,
  BrightnessContrast,
  EffectComposer,
  HueSaturation,
  N8AO,
  Vignette,
} from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import type { GraphicsQualityFlags } from '@/types/graphics';

interface OfficePostProcessingProps {
  flags: GraphicsQualityFlags;
}

export function OfficePostProcessing({ flags }: OfficePostProcessingProps) {
  const { ao, bloom, colorGrade } = flags;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  if (!ready) return null;

  const effects: ReactElement[] = [];

  if (ao) {
    effects.push(
      <N8AO
        key="ao"
        aoRadius={0.22}
        intensity={1.2}
        distanceFalloff={1}
        screenSpaceRadius
        quality="medium"
      />,
    );
  }

  if (bloom) {
    effects.push(
      <Bloom
        key="bloom"
        intensity={0.22}
        luminanceThreshold={0.72}
        luminanceSmoothing={0.28}
        mipmapBlur
        blendFunction={BlendFunction.SCREEN}
      />,
    );
  }

  if (colorGrade) {
    effects.push(
      <BrightnessContrast
        key="brightness"
        brightness={0.012}
        contrast={0.06}
      />,
      <HueSaturation key="hue" hue={0.025} saturation={0.14} />,
      <Vignette key="vignette" eskil={false} offset={0.22} darkness={0.32} />,
    );
  }

  if (effects.length === 0) return null;

  return (
    <EffectComposer multisampling={0} enableNormalPass={ao}>
      {effects}
    </EffectComposer>
  );
}
