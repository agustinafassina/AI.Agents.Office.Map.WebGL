import * as THREE from 'three';
import { OFFICE_PALETTE } from '@/config/agents.config';
import { getOfficeTextures } from '@/utils/textures/proceduralTextures';

export function softColor(
  color: string,
  opts?: {
    emissive?: string;
    emissiveIntensity?: number;
    map?: THREE.Texture | null;
    roughness?: number;
  },
): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    map: opts?.map ?? null,
    roughness: opts?.roughness ?? 0.96,
    metalness: 0.01,
    emissive: new THREE.Color(opts?.emissive ?? '#000000'),
    emissiveIntensity: opts?.emissiveIntensity ?? 0,
  });
}

function buildMaterials() {
  const tex = getOfficeTextures();

  return {
    tileSage: softColor('#ffffff', { map: tex.tileSage }),
    tileGray: softColor('#ffffff', { map: tex.tileGray }),
    tileGrout: softColor(OFFICE_PALETTE.tileGrout),
    wall: softColor('#ffffff', { map: tex.wallPlaster }),
    wallMarble: softColor('#ffffff', { map: tex.wallMarble }),
    wallStripe: softColor(OFFICE_PALETTE.wallStripe),
    wallAccent: softColor(OFFICE_PALETTE.wallAccent, { map: tex.wallPlaster }),
    wood: softColor(OFFICE_PALETTE.wood, { map: tex.woodGrain }),
    woodLight: softColor(OFFICE_PALETTE.woodLight, { map: tex.woodGrain }),
    woodDark: softColor(OFFICE_PALETTE.woodDark, { map: tex.woodGrainDark }),
    deskTop: softColor('#ffffff', { map: tex.woodGrain }),
    deskLeg: softColor(OFFICE_PALETTE.deskLeg),
    monitor: softColor(OFFICE_PALETTE.monitor, {
      emissive: OFFICE_PALETTE.monitorGlow,
      emissiveIntensity: 0.4,
    }),
    monitorBezel: softColor(OFFICE_PALETTE.monitor),
    sage: softColor(OFFICE_PALETTE.sage, { map: tex.plantFoliage }),
    sageDark: softColor(OFFICE_PALETTE.sageDark, { map: tex.plantFoliage }),
    terracotta: softColor(OFFICE_PALETTE.terracotta),
    terracottaLight: softColor(OFFICE_PALETTE.terracottaLight),
    plant: softColor('#ffffff', { map: tex.plantFoliage }),
    plantDark: softColor(OFFICE_PALETTE.plantDark, { map: tex.plantFoliage }),
    plantPot: softColor(OFFICE_PALETTE.plantPot),
    potCeramic: softColor(OFFICE_PALETTE.potCeramic),
    whiteboard: softColor(OFFICE_PALETTE.whiteboard),
    woodTable: softColor('#ffffff', { map: tex.woodGrainDark }),
    rug: softColor('#ffffff', { map: tex.rugJute }),
    rugWeave: softColor('#ffffff', { map: tex.rugWeave }),
    metal: softColor(OFFICE_PALETTE.metal),
    espresso: softColor(OFFICE_PALETTE.espresso),
    stringLight: softColor(OFFICE_PALETTE.stringLight, {
      emissive: OFFICE_PALETTE.stringLight,
      emissiveIntensity: 1,
    }),
    underGlow: softColor(OFFICE_PALETTE.underGlow, {
      emissive: OFFICE_PALETTE.underGlow,
      emissiveIntensity: 0.65,
    }),
    chairMesh: softColor(OFFICE_PALETTE.chairMesh),
    chairTan: softColor(OFFICE_PALETTE.chairTan),
  chairCream: softColor(OFFICE_PALETTE.chairCream),
  chairWhite: softColor(OFFICE_PALETTE.chairWhite),
    chairForest: softColor(OFFICE_PALETTE.chairForest),
    chairYellow: softColor(OFFICE_PALETTE.chairYellow),
    stoolGray: softColor(OFFICE_PALETTE.stoolGray),
    platformWood: softColor(OFFICE_PALETTE.platformWood, { map: tex.woodGrain }),
    olive: softColor(OFFICE_PALETTE.olive),
  zoneMatSage: softColor(OFFICE_PALETTE.zoneMatSage, { map: tex.tileSage }),
    glass: softColor(OFFICE_PALETTE.glass, {
      emissive: '#a0d0d8',
      emissiveIntensity: 0.12,
    }),
    matTransition: softColor(OFFICE_PALETTE.matTransition, { map: tex.rugWeave }),
    mug: softColor(OFFICE_PALETTE.mug),
    notebook: softColor(OFFICE_PALETTE.notebook),
  };
}

export const materials = buildMaterials();
