import { AGENT_DEFINITIONS } from '@/config/agents.config';
import { bindExternalAgentsToModels } from '@/config/bindAgentsToModels';
import { buildAgentsFromModels } from '@/config/agentsFromModels';
import type { AgentDefinition } from '@/types/agent';
import type { LiteLLMModel } from '@/types/litellm';
import type { LiteLLMServiceStatus } from '@/services/litellm/litellm.service';

function mergeExternalOntoGenerated(
  generated: AgentDefinition[],
  external: AgentDefinition[],
): AgentDefinition[] {
  const byModelId = new Map(external.map((agent) => [agent.modelId, agent]));
  const byId = new Map(external.map((agent) => [agent.id, agent]));

  return generated.map((agent) => {
    const overlay = byModelId.get(agent.modelId) ?? byId.get(agent.id);
    if (!overlay) return agent;

    return {
      ...agent,
      ...overlay,
      id: agent.id,
      modelId: agent.modelId,
    };
  });
}

export function resolveAgentDefinitions(
  serviceMode: LiteLLMServiceStatus,
  models: LiteLLMModel[],
  externalAgents: AgentDefinition[] | null,
): AgentDefinition[] {
  if (externalAgents && externalAgents.length > 0) {
    if (serviceMode === 'live' && models.length > 0) {
      const bound = bindExternalAgentsToModels(externalAgents, models);
      if (bound.length > 0) return bound;

      const generated = buildAgentsFromModels(models);
      return mergeExternalOntoGenerated(generated, externalAgents);
    }

    return externalAgents;
  }

  if (serviceMode === 'live') {
    return buildAgentsFromModels(models);
  }

  return AGENT_DEFINITIONS;
}
