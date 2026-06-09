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
    id: 'cursor-agent',
    name: 'Cursor',
    role: 'Code',
    modelId: 'gpt-4o-mini',
    logoUrl: '/logos/cursor.svg',
    avatarColor: '#9aab9e',
    accentColor: '#5a7358',
    homeZone: 'center-desk',
    systemPrompt: 'You are Cursor, a helpful coding assistant in a creative office.',
  },
  {
    id: 'research-agent',
    name: 'Research',
    role: 'Research',
    modelId: 'gpt-4o',
    logoUrl: '/logos/research.svg',
    avatarColor: '#c4a882',
    accentColor: '#8f7354',
    homeZone: 'living',
    systemPrompt: 'You are a research specialist who summarizes and explores ideas clearly.',
  },
  {
    id: 'design-agent',
    name: 'Design',
    role: 'Design',
    modelId: 'claude-3-5-sonnet',
    logoUrl: '/logos/design.svg',
    avatarColor: '#e2725b',
    accentColor: '#c86a48',
    homeZone: 'cafeteria',
    systemPrompt: 'You are a design-minded assistant focused on UX and visual coherence.',
  },
  {
    id: 'ops-agent',
    name: 'Ops',
    role: 'Ops',
    modelId: 'gpt-4o-mini',
    logoUrl: '/logos/ops.svg',
    avatarColor: '#87a685',
    accentColor: '#4a6b52',
    homeZone: 'wall-desks',
    wallDeskSlot: 0,
    systemPrompt: 'You are an operations assistant who helps with workflows and reliability.',
  },
  {
    id: 'review-agent',
    name: 'Review',
    role: 'QA',
    modelId: 'gpt-4o',
    logoUrl: '/logos/review.svg',
    avatarColor: '#d4a574',
    accentColor: '#a67b5b',
    homeZone: 'wall-desks',
    wallDeskSlot: 1,
    systemPrompt: 'You are a QA reviewer who checks quality, edge cases, and test coverage.',
  },
  {
    id: 'data-agent',
    name: 'Data',
    role: 'Analytics',
    modelId: 'claude-3-5-sonnet',
    logoUrl: '/logos/data.svg',
    avatarColor: '#bea078',
    accentColor: '#6b5340',
    homeZone: 'wall-desks',
    wallDeskSlot: 2,
    systemPrompt: 'You are a data analyst who interprets metrics and surfaces insights clearly.',
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
