import type { IconName } from '@/components/ui/UiIcon';
import { COFFEE_LOUNGE_CENTER_Z } from '@/components/scene/furniture/coffeeLoungeConstants';
import { PRIVATE_DESK_CENTER, PRIVATE_DESK_SPACING_Z } from '@/components/scene/furniture/deskConstants';
import { MEETING_ZONE_POSITION } from '@/components/scene/furniture/meetingConstants';

export interface OfficeZoneLink {
  id: string;
  label: string;
  shortLabel: string;
  icon: IconName;
  pan: [number, number, number];
  zoom: number;
  accent: string;
  hotspot?: {
    position: [number, number, number];
    size: [number, number];
  };
}

export const OFFICE_ZONE_LINKS: OfficeZoneLink[] = [
  {
    id: 'all',
    label: 'Full Office',
    shortLabel: 'All',
    icon: 'home',
    pan: [0, 0, 0],
    zoom: 1,
    accent: '#d4a574',
  },
  {
    id: 'hub',
    label: 'Central Hub',
    shortLabel: 'Hub',
    icon: 'hub',
    pan: [0.5, 0, 1.05],
    zoom: 0.78,
    accent: '#d4a574',
    hotspot: { position: [0.5, 0.015, 1.05], size: [4.1, 3.5] },
  },
  {
    id: 'lounge',
    label: 'Coffee Lounge',
    shortLabel: 'Lounge',
    icon: 'lounge',
    pan: [0, 0, COFFEE_LOUNGE_CENTER_Z + 0.15],
    zoom: 0.82,
    accent: '#9aab9e',
    hotspot: {
      position: [0, 0.015, COFFEE_LOUNGE_CENTER_Z],
      size: [5.4, 2.9],
    },
  },
  {
    id: 'meet',
    label: 'Meeting Area',
    shortLabel: 'Meet',
    icon: 'meet',
    pan: [MEETING_ZONE_POSITION[0], 0, MEETING_ZONE_POSITION[2]],
    zoom: 0.82,
    accent: '#c8ccd0',
    hotspot: {
      position: [MEETING_ZONE_POSITION[0], 0.015, MEETING_ZONE_POSITION[2]],
      size: [2.9, 2.6],
    },
  },
  {
    id: 'desk',
    label: 'Private Desk',
    shortLabel: 'Desk',
    icon: 'desk',
    pan: [PRIVATE_DESK_CENTER[0], 0, PRIVATE_DESK_CENTER[2]],
    zoom: 0.78,
    accent: '#8fa38c',
    hotspot: {
      position: [PRIVATE_DESK_CENTER[0], 0.015, PRIVATE_DESK_CENTER[2]],
      size: [2.2, PRIVATE_DESK_SPACING_Z + 1.5],
    },
  },
];

export const OFFICE_HOTSPOT_ZONES = OFFICE_ZONE_LINKS.filter((z) => z.hotspot);
