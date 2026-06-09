import { AVATAR_ILLUSTRATED_PALETTE } from '@/config/agents.config';
import type { AgentDefinition, AgentHomeZone } from '@/types/agent';
import type { LiteLLMModel } from '@/types/litellm';

const ZONE_CYCLE: AgentHomeZone[] = ['center-desk', 'living', 'cafeteria', 'wall-desks'];

const PROVIDER_LOGOS: Record<string, string> = {
  openai: '/logos/cursor.svg',
  anthropic: '/logos/research.svg',
  google: '/logos/data.svg',
  gemini: '/logos/data.svg',
  azure: '/logos/ops.svg',
};

function slugifyModelId(modelId: string): string {
  return modelId
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function formatModelName(modelId: string): string {
  const base = modelId.includes('/') ? modelId.split('/').pop()! : modelId;
  return base
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function providerFromModel(model: LiteLLMModel): string {
  if (model.owned_by) return model.owned_by;
  if (model.id.includes('/')) return model.id.split('/')[0];
  return 'model';
}

function logoForModel(model: LiteLLMModel, index: number): string {
  const provider = providerFromModel(model).toLowerCase();
  return PROVIDER_LOGOS[provider] ?? AVATAR_ILLUSTRATED_PALETTE[index % AVATAR_ILLUSTRATED_PALETTE.length].logoUrl;
}

function assignHome(index: number): Pick<AgentDefinition, 'homeZone' | 'wallDeskSlot'> {
  const homeZone = ZONE_CYCLE[index % ZONE_CYCLE.length];
  if (homeZone !== 'wall-desks') {
    return { homeZone };
  }

  const wallDeskSlot = (Math.floor(index / ZONE_CYCLE.length) % 3) as 0 | 1 | 2;
  return { homeZone, wallDeskSlot };
}

export function buildAgentsFromModels(models: LiteLLMModel[]): AgentDefinition[] {
  return models.map((model, index) => {
    const palette = AVATAR_ILLUSTRATED_PALETTE[index % AVATAR_ILLUSTRATED_PALETTE.length];
    const name = formatModelName(model.id);
    const provider = providerFromModel(model);

    return {
      id: `litellm-${slugifyModelId(model.id)}`,
      name,
      role: provider,
      modelId: model.id,
      logoUrl: logoForModel(model, index),
      avatarColor: palette.avatarColor,
      accentColor: palette.accentColor,
      ...assignHome(index),
      systemPrompt: `You are ${name}, a helpful assistant running on model ${model.id}.`,
    };
  });
}

export function preloadAgentLogos(agents: AgentDefinition[], preload: (url: string) => void): void {
  const urls = new Set(agents.map((agent) => agent.logoUrl));
  urls.forEach((url) => preload(url));
}
