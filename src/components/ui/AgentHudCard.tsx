import type { AgentDefinition } from '@/types/agent';
import { useTranslation } from '@/i18n';
import { useChatStore } from '@/stores/chat.store';
import { AgentHudAvatar } from './AgentHudAvatar';

interface AgentHudCardProps {
  agent: AgentDefinition;
  selected?: boolean;
  onClick: () => void;
  onHover?: () => void;
  compact?: boolean;
}

export function AgentHudCard({
  agent,
  selected = false,
  onClick,
  onHover,
  compact = false,
}: AgentHudCardProps) {
  const { t } = useTranslation();
  const modelLabel = useChatStore((state) => state.resolveModelLabel(agent.modelId));
  const modelAvailable = useChatStore((state) => state.isModelAvailableOnApi(agent.modelId));
  const serviceMode = useChatStore((state) => state.serviceMode);

  return (
    <button
      type="button"
      className={`office-hud__avatar-btn${selected ? ' office-hud__avatar-btn--selected' : ''}${compact ? ' office-hud__avatar-btn--compact' : ''}`}
      onClick={onClick}
      onPointerEnter={onHover}
      title={t('agentCard.title', { name: agent.name, role: agent.role, model: modelLabel })}
      aria-label={t('agentCard.ariaLabel', { name: agent.name, role: agent.role, model: modelLabel })}
    >
      <AgentHudAvatar agent={agent} selected={selected} size={compact ? 32 : 26} />
      <span className="office-hud__agent-name">{agent.name}</span>
      <span className="office-hud__agent-role">{agent.role}</span>
      <span
        className={`office-hud__model-name${serviceMode === 'live' && !modelAvailable ? ' office-hud__model-name--missing' : ''}`}
      >
        {modelLabel}
      </span>
    </button>
  );
}