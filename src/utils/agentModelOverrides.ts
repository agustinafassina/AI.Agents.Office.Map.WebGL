import type { AgentDefinition } from '@/types/agent';

const STORAGE_KEY = 'office-map-agent-models';

export function readAgentModelOverrides(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed as Record<string, string>;
  } catch {
    return {};
  }
}

export function writeAgentModelOverride(agentId: string, modelId: string): void {
  const overrides = readAgentModelOverrides();
  overrides[agentId] = modelId;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
}

export function applyModelOverrides(agents: AgentDefinition[]): AgentDefinition[] {
  const overrides = readAgentModelOverrides();
  if (Object.keys(overrides).length === 0) return agents;

  return agents.map((agent) => {
    const modelId = overrides[agent.id];
    return modelId ? { ...agent, modelId } : agent;
  });
}
