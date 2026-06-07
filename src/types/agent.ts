import type { OfficeZoneId } from '@/config/officeZones';

export type AgentStatus = 'idle' | 'walking' | 'chatting' | 'coffee' | 'coffee-queue';

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
  moveSpeed: number;
  pendingChat: boolean;
  pendingCoffee: boolean;
  coffeeTimer: number;
  coffeeQueueTicket: number;
  posture: 'stand' | 'sit';
}
