import { Bloom, BrightnessContrast, EffectComposer, HueSaturation } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

export function OfficePostProcessing() {
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom
        intensity={0.2}
        luminanceThreshold={0.72}
        luminanceSmoothing={0.35}
        mipmapBlur
        blendFunction={BlendFunction.SCREEN}
      />
      <BrightnessContrast brightness={0.01} contrast={0.08} />
      <HueSaturation hue={0} saturation={0.04} />
    </EffectComposer>
  );
}
