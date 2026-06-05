import type { OfficeZoneId } from '@/config/officeZones';

export type AgentStatus = 'idle' | 'walking' | 'chatting' | 'coffee';

export type AgentHomeZone = Exclude<OfficeZoneId, 'all'>;

export interface AgentDefinition {
  id: string;
  name: string;
  
  role: string;
  modelId: string;
  logoUrl: string;
  avatarColor: string;
  accentColor: string;
  homeZone: AgentHomeZone;
  
  wallDeskSlot?: 0 | 1 | 2;
  systemPrompt?: string;
}

export interface AgentRuntimeState {
  id: string;
  status: AgentStatus;
  position: [number, number, number];
  targetPosition: [number, number, number] | null;
  waypointIndex: number;
  rotation: number;
  
  pendingChat: boolean;
  pendingCoffee: boolean;
  coffeeTimer: number;
  posture: 'stand' | 'sit';
}
