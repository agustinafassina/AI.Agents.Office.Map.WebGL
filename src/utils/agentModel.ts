import type { LiteLLMModel } from '@/types/litellm';

export function resolveAgentModelLabel(
  configuredModelId: string,
  availableModels: LiteLLMModel[],
  serviceMode: 'mock' | 'live' | 'error',
): string {
  if (serviceMode !== 'live') {
    return formatModelDisplayName(configuredModelId);
  }

  const match = availableModels.find((model) => model.id === configuredModelId);
  return match?.id ?? configuredModelId;
}

export function formatModelDisplayName(modelId: string): string {
  const base = modelId.includes('/') ? modelId.split('/').pop()! : modelId;
  return base.replace(/[-_]/g, ' ');
}

export function isAgentModelAvailableOnApi(
  configuredModelId: string,
  availableModels: LiteLLMModel[],
  serviceMode: 'mock' | 'live' | 'error',
): boolean {
  if (serviceMode !== 'live') return true;
  return availableModels.some((model) => model.id === configuredModelId);
}