export type AgentInteractionSessionType = 'peer';

export interface AgentInteractionTurn {
  timestamp: number;
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  content: string;
}

export interface AgentInteractionSession {
  id: string;
  type: AgentInteractionSessionType;
  startedAt: number;
  endedAt: number | null;
  agentIds: string[];
  agentNames: string[];
  turns: AgentInteractionTurn[];
}

export interface PeerTranscriptTurn {
  agentId: string;
  agentName: string;
  content: string;
  timestamp: number;
}
