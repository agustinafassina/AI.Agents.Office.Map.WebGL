import type { AgentDefinition, AgentHomeZone } from '@/types/agent';
import type { AvatarDesignId } from '@/types/avatarDesign';
import { AVATAR_DESIGN_IDS } from '@/types/avatarDesign';
import { parseLocalizedField } from '@/i18n/localizedText';

const HOME_ZONES: AgentHomeZone[] = ['center-desk', 'living', 'cafeteria', 'wall-desks'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readString(obj: Record<string, unknown>, key: string): string | null {
  const value = obj[key];
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

function readHomeZone(value: unknown): AgentHomeZone | null {
  if (typeof value !== 'string') return null;
  return HOME_ZONES.includes(value as AgentHomeZone) ? (value as AgentHomeZone) : null;
}

function readWallDeskSlot(value: unknown): 0 | 1 | 2 | undefined {
  if (value === 0 || value === 1 || value === 2) return value;
  return undefined;
}

function readAvatarDesignId(value: unknown): AvatarDesignId | undefined {
  if (typeof value !== 'string') return undefined;
  return AVATAR_DESIGN_IDS.includes(value as AvatarDesignId)
    ? (value as AvatarDesignId)
    : undefined;
}

function parseAgentEntry(raw: unknown, index: number): AgentDefinition | null {
  if (!isRecord(raw)) return null;

  const id = readString(raw, 'id');
  const name = readString(raw, 'name');
  const roleField = parseLocalizedField(raw.role);
  const modelId = readString(raw, 'modelId');
  const logoUrl = readString(raw, 'logoUrl');
  const avatarColor = readString(raw, 'avatarColor');
  const accentColor = readString(raw, 'accentColor');
  const homeZone = readHomeZone(raw.homeZone);

  if (
    !id ||
    !name ||
    !roleField ||
    !modelId ||
    !logoUrl ||
    !avatarColor ||
    !accentColor ||
    !homeZone
  ) {
    console.warn(`[agents.json] Skipping agent at index ${index}: missing required fields`);
    return null;
  }

  const systemPromptField = parseLocalizedField(raw.systemPrompt);
  const wallDeskSlot = readWallDeskSlot(raw.wallDeskSlot);
  const avatarDesignId = readAvatarDesignId(raw.avatarDesignId);

  return {
    id,
    name,
    role: roleField.text,
    modelId,
    logoUrl,
    avatarColor,
    accentColor,
    avatarDesignId,
    homeZone,
    wallDeskSlot: homeZone === 'wall-desks' ? wallDeskSlot : undefined,
    systemPrompt: systemPromptField?.text,
    localized: {
      role: { en: roleField.map.en, es: roleField.map.es ?? roleField.map.en },
      ...(systemPromptField
        ? {
            systemPrompt: {
              en: systemPromptField.map.en,
              es: systemPromptField.map.es ?? systemPromptField.map.en,
            },
          }
        : {}),
    },
  };
}

export function parseAgentsConfig(data: unknown): AgentDefinition[] | null {
  if (!isRecord(data) || !Array.isArray(data.agents)) {
    console.warn('[agents.json] Invalid root: expected { "agents": [...] }');
    return null;
  }

  const agents = data.agents
    .map((entry, index) => parseAgentEntry(entry, index))
    .filter((agent): agent is AgentDefinition => agent !== null);

  return agents.length > 0 ? agents : null;
}

export async function loadExternalAgentsConfig(): Promise<AgentDefinition[] | null> {
  const url = import.meta.env.VITE_AGENTS_CONFIG_URL?.trim() || '/agents.json';

  try {
    const response = await fetch(url, { cache: 'no-cache' });
    if (!response.ok) {
      if (response.status !== 404) {
        console.warn(`[agents.json] Failed to load ${url} (${response.status})`);
      }
      return null;
    }

    const data: unknown = await response.json();
    return parseAgentsConfig(data);
  } catch (err) {
    console.warn('[agents.json] Could not load external agents config', err);
    return null;
  }
}
