export type AgentStatus = 'idle' | 'walking' | 'chatting';

export interface AgentDefinition {
  id: string;
  name: string;
  modelId: string;
  logoUrl: string;
  avatarColor: string;
  accentColor: string;
  systemPrompt?: string;
  spawnPosition: [number, number, number];
}

export interface AgentRuntimeState {
  id: string;
  status: AgentStatus;
  position: [number, number, number];
  targetPosition: [number, number, number] | null;
  waypointIndex: number;
  rotation: number;
}
