export interface CoffeeArmPose {
  rotX: number;
  rotY: number;
  rotZ: number;
}

export interface CoffeePoseFrame {
  rightArm: CoffeeArmPose;
  leftArm: CoffeeArmPose;
  bodyRotX: number;
  headRotX: number;
  headRotY: number;
  headRotZ: number;
}

export function getCoffeePoseFrame(elapsed: number, phase: number): CoffeePoseFrame {
  const t = elapsed + phase;
  const breathe = Math.sin(t * 1.55) * 0.045;
  const blow = Math.max(0, Math.sin(t * 0.9 + 0.35)) ** 2;
  const cradle = 0.92 + breathe;

  return {
    rightArm: {
      rotX: cradle + blow * 0.22,
      rotY: -0.14 - blow * 0.1,
      rotZ: -0.48 - breathe * 0.07,
    },
    leftArm: {
      rotX: cradle * 0.78 + blow * 0.14,
      rotY: 0.12 + blow * 0.05,
      rotZ: 0.42 + breathe * 0.06,
    },
    bodyRotX: 0.05 + blow * 0.05,
    headRotX: 0.1 + blow * 0.14,
    headRotY: -0.1 - blow * 0.06,
    headRotZ: blow * 0.035,
  };
}

export function easeCoffeeBlend(value: number): number {
  const clamped = Math.max(0, Math.min(1, value));
  return clamped * clamped * (3 - 2 * clamped);
}

export function lerpCoffeeValue(from: number, to: number, blend: number): number {
  return from + (to - from) * blend;
}