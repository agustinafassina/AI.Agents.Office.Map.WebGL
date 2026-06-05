import { useMemo, useState } from 'react';
import { env } from '@/config/env';
import { AGENT_DEFINITIONS } from '@/config/agents.config';
import { useChatStore } from '@/stores/chat.store';
import { useSceneStore } from '@/stores/scene.store';
import { AgentHudCard } from './AgentHudCard';
import { AgentPickerModal } from './AgentPickerModal';
import './OfficeHud.css';

const HUD_AGENT_PREVIEW_LIMIT = 3;

function getPreviewAgents(selectedAgentId: string | null) {
  if (AGENT_DEFINITIONS.length <= HUD_AGENT_PREVIEW_LIMIT) {
    return AGENT_DEFINITIONS;
  }

  const selectedIndex = AGENT_DEFINITIONS.findIndex((agent) => agent.id === selectedAgentId);
  if (selectedIndex >= 0 && selectedIndex < HUD_AGENT_PREVIEW_LIMIT) {
    return AGENT_DEFINITIONS.slice(0, HUD_AGENT_PREVIEW_LIMIT);
  }

  if (selectedIndex >= HUD_AGENT_PREVIEW_LIMIT) {
    const selected = AGENT_DEFINITIONS[selectedIndex];
    return [...AGENT_DEFINITIONS.slice(0, HUD_AGENT_PREVIEW_LIMIT - 1), selected];
  }

  return AGENT_DEFINITIONS.slice(0, HUD_AGENT_PREVIEW_LIMIT);
}

export function OfficeHud() {
  const serviceMode = useChatStore((s) => s.serviceMode);
  const connectionStatus = useChatStore((s) => s.connectionStatus);
  const focusOnAgent = useSceneStore((s) => s.focusOnAgent);
  const selectedAgentId = useSceneStore((s) => s.selectedAgentId);
  const openChat = useChatStore((s) => s.openChat);
  const [pickerOpen, setPickerOpen] = useState(false);

  const hasOverflow = AGENT_DEFINITIONS.length > HUD_AGENT_PREVIEW_LIMIT;
  const previewAgents = useMemo(
    () => getPreviewAgents(selectedAgentId),
    [selectedAgentId],
  );
  const overflowCount = AGENT_DEFINITIONS.length - HUD_AGENT_PREVIEW_LIMIT;

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
          </span>
          {!env.useMockLitellm && env.litellmApiKey && (
            <span className="office-hud__live">API configured</span>
          )}
        </div>
      </div>

      <AgentPickerModal
        open={pickerOpen}
        agents={AGENT_DEFINITIONS}
        selectedAgentId={selectedAgentId}
        onClose={() => setPickerOpen(false)}
        onSelect={handleAgentSelect}
      />
    </>
  );
}
