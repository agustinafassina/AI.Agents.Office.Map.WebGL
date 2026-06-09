import type { AgentStatus } from '@/types/agent';

export function isAgentMoving(status: AgentStatus): boolean {
  return status === 'walking' || status === 'coffee-queue';
}