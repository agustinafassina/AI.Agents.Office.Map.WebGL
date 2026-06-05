const LEFT_WALL_X = -6.85 + 0.09 + 0.32;
const RIGHT_WALL_X = 7.15 - 0.09 - 0.32;
const BACK_WALL_Z = -6.35 + 0.09 + 0.28;export const PERIMETER_PLANTS: {
  position: [number, number, number];
  variant: 'small' | 'medium' | 'tall' | 'fiddle' | 'snake';
}[] = [
  { position: [LEFT_WALL_X, 0, 4.15], variant: 'fiddle' },
  { position: [LEFT_WALL_X, 0, 2.35], variant: 'tall' },
  { position: [LEFT_WALL_X, 0, 0.45], variant: 'small' },
  { position: [LEFT_WALL_X, 0, -2.15], variant: 'snake' },
  { position: [4.35, 0, BACK_WALL_Z], variant: 'medium' },
  { position: [RIGHT_WALL_X, 0, 3.35], variant: 'fiddle' },
  { position: [RIGHT_WALL_X, 0, -1.65], variant: 'snake' },
];
