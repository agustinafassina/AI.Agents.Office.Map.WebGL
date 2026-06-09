import type { OfficeZoneId } from '@/config/officeZones';
import type { TranslationKey } from './types';

export const NAV_ZONE_LABEL_KEYS: Record<OfficeZoneId, TranslationKey> = {
  all: 'nav.all',
  living: 'nav.living',
  'center-desk': 'nav.centerDesk',
  cafeteria: 'nav.cafeteria',
  'wall-desks': 'nav.wallDesks',
};

export type WorkZoneId = Exclude<OfficeZoneId, 'all'>;

export const ZONE_PLAQUE_LABEL_KEYS: Record<WorkZoneId, TranslationKey> = {
  living: 'zones.living.label',
  'center-desk': 'zones.centerDesk.label',
  cafeteria: 'zones.cafeteria.label',
  'wall-desks': 'zones.wallDesks.label',
};

export const ZONE_SUBTITLE_KEYS: Record<WorkZoneId, TranslationKey> = {
  living: 'zones.living.subtitle',
  'center-desk': 'zones.centerDesk.subtitle',
  cafeteria: 'zones.cafeteria.subtitle',
  'wall-desks': 'zones.wallDesks.subtitle',
};

export const COMMAND_HINT_KEYS = [
  'commands.coffee',
  'commands.relax',
  'commands.desk',
  'commands.focus',
] as const satisfies readonly TranslationKey[];
