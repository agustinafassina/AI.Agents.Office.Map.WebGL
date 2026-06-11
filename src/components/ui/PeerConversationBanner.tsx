import { useMemo } from 'react';
import { useTranslation } from '@/i18n';
import { useAgentsStore } from '@/stores/agents.store';
import { useConversationVisualsStore } from '@/stores/conversationVisuals.store';
import './PeerConversationBanner.css';

export function PeerConversationBanner() {
  const { t } = useTranslation();
  const peerConversations = useConversationVisualsStore((s) => s.peerConversations);
  const agents = useAgentsStore((s) => s.definitions);

  const items = useMemo(() => {
    const byId = new Map(agents.map((agent) => [agent.id, agent]));

    return peerConversations
      .map((chat) => {
        const agentA = byId.get(chat.agentA);
        const agentB = byId.get(chat.agentB);
        if (!agentA || !agentB) return null;

        const activeSpeakerId =
          chat.generatingAgentId ?? (chat.streaming ? chat.lastSpeakerId : null);
        const speaker = activeSpeakerId ? byId.get(activeSpeakerId) : null;
        const isActive = Boolean(chat.generatingAgentId || chat.streaming);

        return {
          id: chat.id,
          label: speaker
            ? t('peerChat.speaking', { name: speaker.name })
            : t('peerChat.banner', { nameA: agentA.name, nameB: agentB.name }),
          isActive,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [agents, peerConversations, t]);

  if (items.length === 0) return null;

  return (
    <div className="peer-chat-banner" role="status" aria-live="polite">
      {items.map((item) => (
        <div
          key={item.id}
          className={`peer-chat-banner__item${item.isActive ? ' peer-chat-banner__item--active' : ''}`}
        >
          <span className="peer-chat-banner__icon" aria-hidden>
            <span className="peer-chat-banner__dot" />
            <span className="peer-chat-banner__dot" />
            <span className="peer-chat-banner__dot" />
          </span>
          <span className="peer-chat-banner__label">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
