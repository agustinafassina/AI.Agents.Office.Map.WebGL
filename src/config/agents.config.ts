import { getZoneWaypoints } from '@/config/agentZones.config';
import type { OfficeZoneId } from '@/config/officeZones';
import type { AgentDefinition } from '@/types/agent';

export const AVATAR_ILLUSTRATED_PALETTE: {
  avatarColor: string;
  accentColor: string;
  logoUrl: string;
}[] = [
  { avatarColor: '#9aab9e', accentColor: '#5a7358', logoUrl: '/logos/cursor.svg' },
  { avatarColor: '#c4a882', accentColor: '#8f7354', logoUrl: '/logos/research.svg' },
  { avatarColor: '#e2725b', accentColor: '#c86a48', logoUrl: '/logos/design.svg' },
  { avatarColor: '#87a685', accentColor: '#4a6b52', logoUrl: '/logos/ops.svg' },
  { avatarColor: '#d4a574', accentColor: '#a67b5b', logoUrl: '/logos/review.svg' },
  { avatarColor: '#bea078', accentColor: '#6b5340', logoUrl: '/logos/data.svg' },
];

export const OFFICE_PALETTE = {
  sceneBackground: '#1a382e',
  outline: '#3d5248',
  tileSage: '#b2beb5',
  tileGray: '#c8cec9',
  tileGrout: '#a8b0a8',
  wall: '#f0ebe3',
  wallMarble: '#ebe4d8',
  wallStripe: '#ddd4c8',
  wallAccent: '#e8e0d4',
  wood: '#c4a882',
  woodLight: '#e8d9bc',
  woodDark: '#8f7354',
  woodTable: '#6b5340',
  deskTop: '#e6d4b6',
  deskLeg: '#faf6f0',
  monitor: '#3a4038',
  monitorGlow: '#b8c9a8',
  sage: '#87a685',
  sageDark: '#5a7358',
  terracotta: '#c86a48',
  terracottaLight: '#e2725b',
  plant: '#5c9a6c',
  plantDark: '#3d6848',
  plantPot: '#b89068',
  potCeramic: '#f4f6f8',
  whiteboard: '#fafcfd',
  rug: '#a89078',
  rugWeave: '#9a8570',
  metal: '#a8b2bc',
  espresso: '#2a2a30',
  stringLight: '#ffedb8',
  underGlow: '#ffdba0',
  chairMesh: '#383e46',
  chairTan: '#bea078',
  chairCream: '#e8dece',
  chairWhite: '#f4f2ee',
  chairYellow: '#e5c76a',
  olive: '#7a8c68',
  stoolGray: '#c8ccd0',
  chairForest: '#4a6b52',
  platformWood: '#a67b5b',
  zoneMatSage: '#9aab9e',
  matTransition: '#b0a494',
  glass: '#b8dce4',
  mug: '#f0f2f4',
  notebook: '#faf8f4',
  selectionGlow: '#ffe9a8',
  fog: '#2a4538',
} as const;

export const AGENT_DEFINITIONS: AgentDefinition[] = [
  {
    id: 'backend-agent',
    name: 'Max',
    role: 'Backend',
    modelId: 'llama3-local',
    logoUrl: '/logos/ops.svg',
    avatarColor: '#87a685',
    accentColor: '#4a6b52',
    homeZone: 'center-desk',
    systemPrompt:
      'You are Max, a backend engineer in a product team office. Focus on APIs, data models, reliability, and clear implementation steps.',
  },
  {
    id: 'ux-agent',
    name: 'Lena',
    role: 'UI/UX',
    modelId: 'gemma2-2b-local',
    logoUrl: '/logos/design.svg',
    avatarColor: '#e2725b',
    accentColor: '#c86a48',
    homeZone: 'living',
    systemPrompt:
      'You are Lena, a UI/UX specialist in a product team office. Focus on user flows, accessibility, and pragmatic design feedback.',
  },
  {
    id: 'po-agent',
    name: 'Paula',
    role: 'Product Owner',
    modelId: 'qwen2.5-1.5b-local',
    logoUrl: '/logos/research.svg',
    avatarColor: '#c4a882',
    accentColor: '#8f7354',
    homeZone: 'wall-desks',
    wallDeskSlot: 1,
    systemPrompt:
      'You are Paula, a Product Owner in a product team office. Focus on user value, priorities, and acceptance criteria.',
  },
  {
    id: 'qa-agent',
    name: 'Quinn',
    role: 'QA',
    modelId: 'llama3.2-1b-local',
    logoUrl: '/logos/review.svg',
    avatarColor: '#d4a574',
    accentColor: '#a67b5b',
    homeZone: 'wall-desks',
    wallDeskSlot: 0,
    systemPrompt:
      'You are Quinn, a QA engineer in a product team office. Focus on test plans, edge cases, and reproducible bug reports.',
  },
];

export function getAgentsByZone(zoneId: OfficeZoneId): AgentDefinition[] {
  if (zoneId === 'all') return AGENT_DEFINITIONS;
  return AGENT_DEFINITIONS.filter((agent) => agent.homeZone === zoneId);
}

export const OFFICE_WAYPOINTS = getZoneWaypoints('center-desk');

export const SCENE_CONFIG = {
  bounds: { minX: -6.5, maxX: 7, minZ: -5.5, maxZ: 5 },
  walkSpeed: 1.05,
  idlePauseMin: 2,
  idlePauseMax: 5,
  coffeeBreakChance: 0.24,
  coffeeDurationMin: 4,
  coffeeDurationMax: 9,
} as const;
