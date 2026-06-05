import type { AgentDefinition } from '@/types/agent';
import { AgentHudAvatar } from './AgentHudAvatar';

interface AgentHudCardProps {
  agent: AgentDefinition;
  selected?: boolean;
  onClick: () => void;
  compact?: boolean;
}

export function AgentHudCard({ agent, selected = false, onClick, compact = false }: AgentHudCardProps) {
  return (
    <button
      type="button"
      className={`office-hud__avatar-btn${selected ? ' office-hud__avatar-btn--selected' : ''}${compact ? ' office-hud__avatar-btn--compact' : ''}`}
      onClick={onClick}
      title={`${agent.name} · ${agent.role} · ${agent.modelId}`}
      aria-label={`Chat with ${agent.name}, ${agent.role}, model ${agent.modelId}`}
    >
      <AgentHudAvatar agent={agent} selected={selected} size={compact ? 32 : 26} />
      <span className="office-hud__agent-name">{agent.name}</span>
      <span className="office-hud__agent-role">{agent.role}</span>
      <span className="office-hud__model-name">{agent.modelId}</span>
    </button>
  );
}
