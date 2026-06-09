import {
  Bloom,
  BrightnessContrast,
  EffectComposer,
  HueSaturation,
  N8AO,
  Vignette,
} from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

export function OfficePostProcessing() {
  return (
    <EffectComposer multisampling={0} enableNormalPass>
      <N8AO
        aoRadius={0.22}
        intensity={1.2}
        distanceFalloff={1}
        screenSpaceRadius
        quality="medium"
      />
      <Bloom
        intensity={0.22}
        luminanceThreshold={0.72}
        luminanceSmoothing={0.28}
        mipmapBlur
        blendFunction={BlendFunction.SCREEN}
      />
      <BrightnessContrast brightness={0.012} contrast={0.06} />
      <HueSaturation hue={0.025} saturation={0.14} />
      <Vignette eskil={false} offset={0.22} darkness={0.32} />
    </EffectComposer>
  );
}
