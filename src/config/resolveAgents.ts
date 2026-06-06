import { AGENT_DEFINITIONS } from '@/config/agents.config';
import { buildAgentsFromModels } from '@/config/agentsFromModels';
import type { AgentDefinition } from '@/types/agent';
import type { LiteLLMModel } from '@/types/litellm';
import type { LiteLLMServiceStatus } from '@/services/litellm/litellm.service';

export function resolveAgentDefinitions(
  serviceMode: LiteLLMServiceStatus,
  models: LiteLLMModel[],
): AgentDefinition[] {
  if (serviceMode === 'live') {
    return buildAgentsFromModels(models);
  }
  return AGENT_DEFINITIONS;
}
