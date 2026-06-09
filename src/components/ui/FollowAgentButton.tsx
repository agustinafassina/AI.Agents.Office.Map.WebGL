import { useTranslation } from '@/i18n';
import { useChatStore } from '@/stores/chat.store';
import { useAgentsStore } from '@/stores/agents.store';
import { useSceneStore } from '@/stores/scene.store';
import { isAgentMoving } from '@/utils/agentMovement';
import { UiIcon } from './UiIcon';
import './FollowAgentButton.css';

export function FollowAgentButton() {
  const { t } = useTranslation();
  const activeAgentId = useChatStore((state) => state.activeAgentId);
  const selectedAgentId = useSceneStore((state) => state.selectedAgentId);
  const followAgentId = useSceneStore((state) => state.followAgentId);
  const toggleFollowAgent = useSceneStore((state) => state.toggleFollowAgent);

  const agentId = activeAgentId ?? selectedAgentId;
  const runtime = useAgentsStore((state) => (agentId ? state.runtime[agentId] : undefined));
  const agent = useAgentsStore((state) =>
    agentId ? state.definitions.find((def) => def.id === agentId) : undefined,
  );

  if (!agentId || !runtime || !agent || !isAgentMoving(runtime.status)) {
    return null;
  }

  const isFollowing = followAgentId === agentId;

  return (
    <button
      type="button"
      className={`follow-agent-btn${isFollowing ? ' follow-agent-btn--active' : ''}`}
      onClick={() => toggleFollowAgent(agentId)}
      aria-pressed={isFollowing}
      aria-label={isFollowing ? t('follow.stopAria', { name: agent.name }) : t('follow.startAria', { name: agent.name })}
      title={isFollowing ? t('follow.stop') : t('follow.start')}
    >
      <UiIcon name={isFollowing ? 'follow-active' : 'follow'} size={16} />
      <span className="follow-agent-btn__label">
        {isFollowing ? t('follow.stop') : t('follow.start')}
      </span>
    </button>
  );
}
