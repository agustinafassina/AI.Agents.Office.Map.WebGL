import * as THREE from 'three';
import { OFFICE_PALETTE } from '@/config/agents.config';
import {
  canvasTexture,
  createCanvas,
  hexToRgb,
  paintNoise,
} from './textureHelpers';

export interface OfficeTextureSet {
  tileSage: THREE.CanvasTexture;
  tileGray: THREE.CanvasTexture;
  wallPlaster: THREE.CanvasTexture;
  wallMarble: THREE.CanvasTexture;
  woodGrain: THREE.CanvasTexture;
  woodGrainDark: THREE.CanvasTexture;
  rugJute: THREE.CanvasTexture;
  rugWeave: THREE.CanvasTexture;
  plantFoliage: THREE.CanvasTexture;
}

function fillBase(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  hex: string,
): void {
  const [r, g, b] = hexToRgb(hex);
  ctx.fillStyle = `rgb(${r},${g},${b})`;
  ctx.fillRect(0, 0, w, h);
}

function createTileTexture(hex: string, variation: number): THREE.CanvasTexture {
  const size = 192;
  const [canvas, ctx] = createCanvas(size, size);
  fillBase(ctx, size, size, hex);
  paintNoise(ctx, size, size, variation);

  ctx.fillStyle = OFFICE_PALETTE.tileGrout;
  ctx.fillRect(0, 0, size, size);

  const inset = 8;
  const [r, g, b] = hexToRgb(hex);
  ctx.fillStyle = `rgb(${r},${g},${b})`;
  ctx.fillRect(inset, inset, size - inset * 2, size - inset * 2);
  paintNoise(ctx, size, size, variation * 0.5);

  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(inset + 2, inset + 2, size - (inset + 2) * 2, size - (inset + 2) * 2);

  return canvasTexture(canvas, [1, 1]);
}

function createWallPlaster(): THREE.CanvasTexture {
  const size = 384;
  const [canvas, ctx] = createCanvas(size, size);
  fillBase(ctx, size, size, OFFICE_PALETTE.wall);
  paintNoise(ctx, size, size, 14);

  for (let i = 0; i < 1200; i++) {
    const shade = 200 + Math.random() * 25;
    ctx.fillStyle = `rgba(${shade},${shade + 2},${shade + 4},0.12)`;
    ctx.fillRect(Math.random() * size, Math.random() * size, 1.5, 1.5);
  }

  for (let x = 0; x < size; x += 22) {
    const shade = 6 + Math.random() * 8;
    ctx.fillStyle = `rgba(${198 + shade},${202 + shade},${208 + shade},0.1)`;
    ctx.fillRect(x, 0, 6, size);
  }

  return canvasTexture(canvas, [2, 2]);
}

function createWallMarble(): THREE.CanvasTexture {
  const [canvas, ctx] = createCanvas(256, 256);
  fillBase(ctx, 256, 256, OFFICE_PALETTE.wallMarble);
  paintNoise(ctx, 256, 256, 10);

  ctx.globalAlpha = 0.12;
  ctx.strokeStyle = '#b8c4d0';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.moveTo(Math.random() * 256, Math.random() * 256);
    ctx.bezierCurveTo(
      Math.random() * 256,
      Math.random() * 256,
      Math.random() * 256,
      Math.random() * 256,
      Math.random() * 256,
      Math.random() * 256,
    );
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  return canvasTexture(canvas, [1.5, 1.5]);
}

function createWoodGrain(hex: string, dark = false): THREE.CanvasTexture {
  const [canvas, ctx] = createCanvas(256, 128);
  fillBase(ctx, 256, 128, hex);
  paintNoise(ctx, 256, 128, dark ? 14 : 10);

  ctx.globalAlpha = dark ? 0.2 : 0.14;
  for (let y = 0; y < 128; y += 3) {
    const [r, g, b] = hexToRgb(hex);
    const delta = (Math.sin(y * 0.2) + 1) * (dark ? 18 : 12);
    ctx.fillStyle = `rgb(${r - delta},${g - delta},${b - delta})`;
    ctx.fillRect(0, y, 256, 2);
  }
  ctx.globalAlpha = 1;

  return canvasTexture(canvas, [2, 1]);
}

function createRugJute(): THREE.CanvasTexture {
  const [canvas, ctx] = createCanvas(256, 256);
  fillBase(ctx, 256, 256, OFFICE_PALETTE.rug);
  paintNoise(ctx, 256, 256, 18);

  ctx.strokeStyle = 'rgba(90,75,60,0.25)';
  ctx.lineWidth = 1;
  for (let i = -256; i < 512; i += 6) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 256, 256);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(i, 256);
    ctx.lineTo(i + 256, 0);
    ctx.stroke();
  }

  return canvasTexture(canvas, [3, 3]);
}

function createRugWeave(): THREE.CanvasTexture {
  const [canvas, ctx] = createCanvas(128, 128);
  fillBase(ctx, 128, 128, OFFICE_PALETTE.rugWeave);

  for (let y = 0; y < 128; y += 4) {
    for (let x = 0; x < 128; x += 4) {
      ctx.fillStyle = (x + y) % 8 === 0 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
      ctx.fillRect(x, y, 4, 4);
    }
  }

  return canvasTexture(canvas, [4, 4]);
}

function createPlantFoliage(): THREE.CanvasTexture {
  const size = 192;
  const [canvas, ctx] = createCanvas(size, size);
  fillBase(ctx, size, size, OFFICE_PALETTE.plant);
  paintNoise(ctx, size, size, 22);

  ctx.globalAlpha = 0.15;
  ctx.fillStyle = OFFICE_PALETTE.plantDark;
  for (let i = 0; i < 20; i++) {
    ctx.beginPath();
    ctx.ellipse(
      Math.random() * size,
      Math.random() * size,
      8 + Math.random() * 12,
      4 + Math.random() * 8,
      Math.random() * Math.PI,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  return canvasTexture(canvas, [1, 1]);
}

const TEXTURE_VERSION = 2;
let cached: OfficeTextureSet | null = null;
let cachedVersion = 0;

export function getOfficeTextures(): OfficeTextureSet {
  if (cached && cachedVersion === TEXTURE_VERSION) return cached;
  if (cached) {
    Object.values(cached).forEach((t) => t.dispose());
    cached = null;
  }
  cachedVersion = TEXTURE_VERSION;

  cached = {
    tileSage: createTileTexture(OFFICE_PALETTE.tileSage, 14),
    tileGray: createTileTexture(OFFICE_PALETTE.tileGray, 12),
    wallPlaster: createWallPlaster(),
    wallMarble: createWallMarble(),
    woodGrain: createWoodGrain(OFFICE_PALETTE.deskTop),
    woodGrainDark: createWoodGrain(OFFICE_PALETTE.woodTable, true),
    rugJute: createRugJute(),
    rugWeave: createRugWeave(),
    plantFoliage: createPlantFoliage(),
  };

  return cached;
}

export function disposeOfficeTextures(): void {
  if (!cached) return;
  Object.values(cached).forEach((t) => t.dispose());
  cached = null;
}
