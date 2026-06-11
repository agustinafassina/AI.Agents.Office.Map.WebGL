import { useState, useRef, useEffect, type FormEvent } from 'react';
import { getCommandHints } from '@/i18n/commandMessages';
import { getRoleHints } from '@/i18n/roleHints';
import { useConnectionLabel } from '@/i18n/connectionLabel';
import { useTranslation } from '@/i18n';
import { useChatStore } from '@/stores/chat.store';
import { useAgentsStore } from '@/stores/agents.store';
import { useSceneStore } from '@/stores/scene.store';
import { formatModelDisplayName } from '@/utils/agentModel';
import { LazyChatMessageBody } from './LazyChatMessageBody';
import './ChatPanel.css';

export function ChatPanel() {
  const isOpen = useChatStore((state) => state.isPanelOpen);
  const activeAgentId = useChatStore((state) => state.activeAgentId);
  const mountedRef = useRef(isOpen);

  if (isOpen) {
    mountedRef.current = true;
  }

  if (!mountedRef.current || !activeAgentId) {
    return null;
  }

  return <ChatPanelContent visible={isOpen} />;
}

function ChatPanelContent({ visible }: { visible: boolean }) {
  const { t, locale } = useTranslation();
  const connectionLabel = useConnectionLabel(useChatStore((s) => s.connectionStatus));
  const activeAgentId = useChatStore((s) => s.activeAgentId);
  const closeChat = useChatStore((s) => s.closeChat);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const stopResponse = useChatStore((s) => s.stopResponse);
  const agent = useAgentsStore((s) =>
    activeAgentId ? s.definitions.find((d) => d.id === activeAgentId) ?? null : null,
  );
  const agentModelId = useAgentsStore((s) =>
    activeAgentId
      ? s.definitions.find((d) => d.id === activeAgentId)?.modelId ?? null
      : null,
  );
  const conversation = useChatStore((s) => {
    const id = s.activeAgentId;
    if (!id) return null;
    return s.conversations[id] ?? null;
  });
  const connectionStatus = useChatStore((s) => s.connectionStatus);
  const serviceMode = useChatStore((s) => s.serviceMode);
  const models = useChatStore((s) => s.models);
  const resolveModelLabel = useChatStore((s) => s.resolveModelLabel);
  const isModelAvailableOnApi = useChatStore((s) => s.isModelAvailableOnApi);
  const setActiveAgentModel = useChatStore((s) => s.setActiveAgentModel);
  const modelSwitchNotice = useChatStore((s) => s.modelSwitchNotice);
  const clearActiveConversation = useChatStore((s) => s.clearActiveConversation);
  const clearSelection = useSceneStore((s) => s.clearSelection);

  const [input, setInput] = useState('');
  const [sendPulse, setSendPulse] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMessageContent = conversation?.messages.at(-1)?.content ?? '';

  useEffect(() => {
    if (!visible) return;
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [visible, conversation?.messages.length, conversation?.isLoading, lastMessageContent]);

  if (!agent) return null;

  const commandHints = getCommandHints(locale);
  const roleHints = getRoleHints(locale, agent.id);
  const modelLabel = resolveModelLabel(agentModelId ?? agent.modelId);
  const modelAvailable = isModelAvailableOnApi(agentModelId ?? agent.modelId);

  const handleClose = () => {
    closeChat();
    clearSelection();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || conversation?.isLoading) return;
    setInput('');
    setSendPulse(true);
    window.setTimeout(() => setSendPulse(false), 320);
    await sendMessage(text);
  };

  const serviceBadge =
    serviceMode === 'mock'
      ? t('chat.serviceMock')
      : serviceMode === 'live'
        ? t('chat.serviceLive')
        : t('chat.serviceDegraded');

  return (
    <aside
      className="chat-panel"
      aria-hidden={!visible}
      aria-label={t('chat.panelAriaLabel', { name: agent.name })}
    >
      <header className="chat-panel__header">
        <div className="chat-panel__agent">
          <img src={agent.logoUrl} alt="" className="chat-panel__logo" />
          <div>
            <h2 className="chat-panel__title">{agent.name}</h2>
            <p className="chat-panel__role">{agent.role}</p>
            <label className="chat-panel__model">
              <span className="chat-panel__model-label">{t('chat.model')}</span>
              {models.length > 0 ? (
                <select
                  className={`chat-panel__model-picker${
                    serviceMode === 'live' && !modelAvailable ? ' chat-panel__model-picker--missing' : ''
                  }`}
                  value={agentModelId ?? agent.modelId}
                  disabled={conversation?.isLoading}
                  aria-label={t('chat.modelPickerAria', { name: agent.name })}
                  onChange={(e) => setActiveAgentModel(e.target.value)}
                >
                  {!models.some((model) => model.id === (agentModelId ?? agent.modelId)) && (
                    <option value={agentModelId ?? agent.modelId}>
                      {t('chat.modelUnavailable', { modelId: agentModelId ?? agent.modelId })}
                    </option>
                  )}
                  {models.map((model) => (
                    <option key={model.id} value={model.id}>
                      {formatModelDisplayName(model.id)}
                    </option>
                  ))}
                </select>
              ) : (
                <code className="chat-panel__model-code">{modelLabel}</code>
              )}
              {serviceMode === 'live' && modelAvailable && models.length > 0 && (
                <span className="chat-panel__model-source">{t('chat.liveSource')}</span>
              )}
            </label>
          </div>
        </div>
        <button
          type="button"
          className="chat-panel__close"
          onClick={handleClose}
          aria-label={t('chat.close')}
        >
          ×
        </button>
      </header>

      <div className="chat-panel__meta">
        <span className="chat-panel__badge chat-panel__badge--role">{agent.role}</span>
        <span className={`chat-panel__badge chat-panel__badge--${connectionStatus}`}>
          {connectionLabel}
        </span>
        <span className="chat-panel__badge chat-panel__badge--mode">{serviceBadge}</span>
        {models.length > 0 && (
          <span className="chat-panel__badge chat-panel__badge--model">
            {formatModelDisplayName(agentModelId ?? agent.modelId)}
          </span>
        )}
        {serviceMode === 'live' && models.length > 0 && (
          <span className="chat-panel__badge chat-panel__badge--models">
            {t('chat.modelsBadge', { count: models.length })}
          </span>
        )}
        <button
          type="button"
          className="chat-panel__clear"
          onClick={clearActiveConversation}
          disabled={conversation?.isLoading || (conversation?.messages.length ?? 0) === 0}
          aria-label={t('chat.clearHistoryAria', { name: agent.name })}
        >
          {t('chat.clearHistory')}
        </button>
      </div>

      <div className="chat-panel__messages">
        {modelSwitchNotice && (
          <p className="chat-panel__system-note" role="status">
            {modelSwitchNotice}
          </p>
        )}
        {conversation?.messages.length === 0 && !modelSwitchNotice && (
          <div className="chat-panel__empty">
            <p>{t('chat.emptyState', { name: agent.name })}</p>
            {roleHints.length > 0 && (
              <p className="chat-panel__hints chat-panel__hints--role">
                {t('chat.roleHintsPrefix')}{' '}
                {roleHints.map((hint) => `"${hint}"`).join(' · ')}
              </p>
            )}
            <p className="chat-panel__hints">
              {t('chat.sceneHintsPrefix')}{' '}
              {commandHints.map((hint) => `"${hint}"`).join(' · ')}
            </p>
          </div>
        )}
        {conversation?.messages.map((msg) => (
          <div
            key={msg.id}
            className={`chat-panel__message chat-panel__message--${msg.role}`}
          >
            <span className="chat-panel__message-role">
              {msg.role === 'user' ? t('chat.you') : agent.name}
            </span>
            {msg.role === 'assistant' ? (
              <LazyChatMessageBody content={msg.content} streaming={msg.streaming} />
            ) : (
              <p className="chat-panel__message-text">{msg.content}</p>
            )}
          </div>
        ))}
        {conversation?.error && (
          <p className="chat-panel__error" role="alert">
            {conversation.error}
          </p>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-panel__form" onSubmit={handleSubmit}>
        <textarea
          className="chat-panel__input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('chat.placeholder', { name: agent.name })}
          rows={2}
          disabled={conversation?.isLoading}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void handleSubmit(e);
            }
          }}
        />
        <div className="chat-panel__actions">
          <button
            type="button"
            className="chat-panel__stop"
            onClick={stopResponse}
            disabled={!conversation?.isLoading}
            aria-label={t('chat.stopAria', { name: agent.name })}
          >
            {t('chat.stop')}
          </button>
          <button
            type="submit"
            className={`chat-panel__send${sendPulse ? ' chat-panel__send--pulse' : ''}`}
            disabled={!input.trim() || conversation?.isLoading}
          >
            {t('chat.send')}
          </button>
        </div>
      </form>
    </aside>
  );
}
