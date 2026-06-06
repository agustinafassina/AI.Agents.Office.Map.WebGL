import { useMemo, useState } from 'react';
import { env } from '@/config/env';
import { useChatStore } from '@/stores/chat.store';
import { useAgentsStore } from '@/stores/agents.store';
import { useSceneStore } from '@/stores/scene.store';
import type { AgentDefinition } from '@/types/agent';
import { AgentHudCard } from './AgentHudCard';
import { AgentPickerModal } from './AgentPickerModal';
import './OfficeHud.css';

const HUD_AGENT_PREVIEW_LIMIT = 3;

function getPreviewAgents(agents: AgentDefinition[], selectedAgentId: string | null) {
  if (agents.length <= HUD_AGENT_PREVIEW_LIMIT) {
    return agents;
  }

  const selectedIndex = agents.findIndex((agent) => agent.id === selectedAgentId);
  if (selectedIndex >= 0 && selectedIndex < HUD_AGENT_PREVIEW_LIMIT) {
    return agents.slice(0, HUD_AGENT_PREVIEW_LIMIT);
  }

  if (selectedIndex >= HUD_AGENT_PREVIEW_LIMIT) {
    const selected = agents[selectedIndex];
    return [...agents.slice(0, HUD_AGENT_PREVIEW_LIMIT - 1), selected];
  }

  return agents.slice(0, HUD_AGENT_PREVIEW_LIMIT);
}

export function OfficeHud() {
  const serviceMode = useChatStore((state) => state.serviceMode);
  const connectionStatus = useChatStore((state) => state.connectionStatus);
  const models = useChatStore((state) => state.models);
  const agents = useAgentsStore((state) => state.definitions);
  const focusOnAgent = useSceneStore((state) => state.focusOnAgent);
  const selectedAgentId = useSceneStore((state) => state.selectedAgentId);
  const openChat = useChatStore((state) => state.openChat);
  const [pickerOpen, setPickerOpen] = useState(false);

  const hasOverflow = agents.length > HUD_AGENT_PREVIEW_LIMIT;
  const previewAgents = useMemo(
    () => getPreviewAgents(agents, selectedAgentId),
    [agents, selectedAgentId],
  );
  const overflowCount = agents.length - HUD_AGENT_PREVIEW_LIMIT;

  const handleAgentSelect = (agentId: string) => {
    focusOnAgent(agentId);
    openChat(agentId);
  };

  return (
    <>
      <div className="office-hud">
        <div className="office-hud__brand">
          <span className="office-hud__eyebrow">Isometric Workspace</span>
          <span className="office-hud__title">AI Agents Office</span>
          <span className="office-hud__hint">
            Bottom nav for zones · drag to pan · select agents to chat
          </span>
          <div className="office-hud__agents" role="group" aria-label="Office agents">
            {connectionStatus === 'connecting' && (
              <span className="office-hud__loading">Loading agents…</span>
            )}
            {connectionStatus !== 'connecting' && agents.length === 0 && (
              <span className="office-hud__loading">No agents available</span>
            )}
            {previewAgents.map((agent) => (
              <AgentHudCard
                key={agent.id}
                agent={agent}
                selected={selectedAgentId === agent.id}
                onClick={() => handleAgentSelect(agent.id)}
              />
            ))}
            {hasOverflow && (
              <button
                type="button"
                className="office-hud__view-more"
                onClick={() => setPickerOpen(true)}
                aria-haspopup="dialog"
                aria-expanded={pickerOpen}
              >
                <span className="office-hud__view-more-icon" aria-hidden>
                  +
                </span>
                <span className="office-hud__view-more-label">View more</span>
                <span className="office-hud__view-more-count">+{overflowCount}</span>
              </button>
            )}
          </div>
        </div>
        <div className="office-hud__status">
          <span className={`office-hud__dot office-hud__dot--${connectionStatus}`} />
          <span>
            {serviceMode === 'mock' ? 'Mock mode' : 'LiteLLM'} · {connectionStatus}
            {serviceMode === 'live' && models.length > 0 && ` · ${models.length} models`}
          </span>
          {!env.useMockLitellm && env.litellmApiKey && (
            <span className="office-hud__live">API configured</span>
          )}
        </div>
      </div>

      <AgentPickerModal
        open={pickerOpen}
        agents={agents}
        selectedAgentId={selectedAgentId}
        onClose={() => setPickerOpen(false)}
        onSelect={handleAgentSelect}
      />
    </>
  );
}
