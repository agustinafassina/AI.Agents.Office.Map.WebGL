import { sortModelsBySizeDesc } from '@/config/modelSize';
import type { AgentDefinition } from '@/types/agent';
import type { LiteLLMModel } from '@/types/litellm';

const ROLE_BIND_ORDER = ['backend-agent', 'ux-agent', 'po-agent', 'qa-agent'] as const;

function agentsInRoleBindOrder(agents: AgentDefinition[]): AgentDefinition[] {
  const byId = new Map(agents.map((agent) => [agent.id, agent]));
  const ordered = ROLE_BIND_ORDER.map((id) => byId.get(id)).filter(
    (agent): agent is AgentDefinition => agent !== undefined,
  );
  const boundIds = new Set(ordered.map((agent) => agent.id));
  const rest = agents.filter((agent) => !boundIds.has(agent.id));
  return [...ordered, ...rest];
}

export function bindExternalAgentsToModels(
  externalAgents: AgentDefinition[],
  models: LiteLLMModel[],
): AgentDefinition[] {
  if (externalAgents.length === 0) return [];

  const modelIds = new Set(models.map((model) => model.id));
  const exactMatches = externalAgents.filter((agent) => modelIds.has(agent.modelId));
  if (exactMatches.length === externalAgents.length && exactMatches.length > 0) {
    return agentsInRoleBindOrder(exactMatches);
  }

  if (models.length === 0) return externalAgents;

  const agents = agentsInRoleBindOrder(externalAgents);
  const sortedModels = sortModelsBySizeDesc(models);
  const pairCount = Math.min(agents.length, sortedModels.length);

  return agents.slice(0, pairCount).map((agent, index) => ({
    ...agent,
    modelId: sortedModels[index].id,
  }));
}
