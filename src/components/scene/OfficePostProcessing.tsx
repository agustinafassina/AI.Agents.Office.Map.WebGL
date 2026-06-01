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
        intensity={0.18}
        luminanceThreshold={0.78}
        luminanceSmoothing={0.32}
        mipmapBlur
        blendFunction={BlendFunction.SCREEN}
      />
      <BrightnessContrast brightness={0.005} contrast={0.1} />
      <HueSaturation hue={0} saturation={0.05} />
      <Vignette eskil={false} offset={0.2} darkness={0.28} />
    </EffectComposer>
  );
}
