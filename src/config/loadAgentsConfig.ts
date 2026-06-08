import type { AgentDefinition, AgentHomeZone } from '@/types/agent';

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

function parseAgentEntry(raw: unknown, index: number): AgentDefinition | null {
  if (!isRecord(raw)) return null;

  const id = readString(raw, 'id');
  const name = readString(raw, 'name');
  const role = readString(raw, 'role');
  const modelId = readString(raw, 'modelId');
  const logoUrl = readString(raw, 'logoUrl');
  const avatarColor = readString(raw, 'avatarColor');
  const accentColor = readString(raw, 'accentColor');
  const homeZone = readHomeZone(raw.homeZone);

  if (!id || !name || !role || !modelId || !logoUrl || !avatarColor || !accentColor || !homeZone) {
    console.warn(`[agents.json] Skipping agent at index ${index}: missing required fields`);
    return null;
  }

  const systemPrompt = readString(raw, 'systemPrompt') ?? undefined;
  const wallDeskSlot = readWallDeskSlot(raw.wallDeskSlot);

  return {
    id,
    name,
    role,
    modelId,
    logoUrl,
    avatarColor,
    accentColor,
    homeZone,
    wallDeskSlot: homeZone === 'wall-desks' ? wallDeskSlot : undefined,
    systemPrompt,
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
