import { useState, useRef, useEffect, type FormEvent } from 'react';
import { useChatStore } from '@/stores/chat.store';
import { useAgentsStore } from '@/stores/agents.store';
import { useSceneStore } from '@/stores/scene.store';
import { AGENT_COMMAND_HINTS } from '@/utils/chatAgentCommands';
import { formatModelDisplayName } from '@/utils/agentModel';
import { ChatMessageBody } from './ChatMessageBody';
import './ChatPanel.css';

export function ChatPanel() {
  const isOpen = useChatStore((s) => s.isPanelOpen);
  const activeAgentId = useChatStore((s) => s.activeAgentId);
  const closeChat = useChatStore((s) => s.closeChat);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const agent = useAgentsStore((s) =>
    activeAgentId ? s.definitions.find((d) => d.id === activeAgentId) ?? null : null,
  );
  const conversation = useChatStore((s) => s.getActiveConversation());
  const connectionStatus = useChatStore((s) => s.connectionStatus);
  const serviceMode = useChatStore((s) => s.serviceMode);
  const models = useChatStore((s) => s.models);
  const resolveModelLabel = useChatStore((s) => s.resolveModelLabel);
  const isModelAvailableOnApi = useChatStore((s) => s.isModelAvailableOnApi);
  const setActiveAgentModel = useChatStore((s) => s.setActiveAgentModel);
  const clearSelection = useSceneStore((s) => s.clearSelection);

  const [input, setInput] = useState('');
  const [sendPulse, setSendPulse] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMessageContent = conversation?.messages.at(-1)?.content ?? '';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages.length, conversation?.isLoading, lastMessageContent]);

  if (!isOpen || !agent) return null;

  const modelLabel = resolveModelLabel(agent.modelId);
  const modelAvailable = isModelAvailableOnApi(agent.modelId);

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

  return (
    <aside className="chat-panel" aria-label={`Chat with ${agent.name}`}>
      <header className="chat-panel__header">
        <div className="chat-panel__agent">
          <img src={agent.logoUrl} alt="" className="chat-panel__logo" />
          <div>
            <h2 className="chat-panel__title">{agent.name}</h2>
            <label className="chat-panel__model">
              <span className="chat-panel__model-label">Model</span>
              {models.length > 0 ? (
                <select
                  className={`chat-panel__model-picker${
                    serviceMode === 'live' && !modelAvailable ? ' chat-panel__model-picker--missing' : ''
                  }`}
                  value={agent.modelId}
                  disabled={conversation?.isLoading}
                  aria-label={`LiteLLM model for ${agent.name}`}
                  onChange={(e) => setActiveAgentModel(e.target.value)}
                >
                  {!models.some((model) => model.id === agent.modelId) && (
                    <option value={agent.modelId}>{agent.modelId} (unavailable)</option>
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
                <span className="chat-panel__model-source"> · LiteLLM</span>
              )}
            </label>
          </div>
        </div>
        <button
          type="button"
          className="chat-panel__close"
          onClick={handleClose}
          aria-label="Close chat"
        >
          ×
        </button>
      </header>

      <div className="chat-panel__meta">
        <span className={`chat-panel__badge chat-panel__badge--${connectionStatus}`}>
          {connectionStatus}
        </span>
        <span className="chat-panel__badge chat-panel__badge--mode">
          {serviceMode === 'mock' ? 'Mock LiteLLM' : serviceMode === 'live' ? 'Live' : 'Degraded'}
        </span>
        {serviceMode === 'live' && models.length > 0 && (
          <span className="chat-panel__badge chat-panel__badge--models">
            {models.length} models
          </span>
        )}
      </div>

      <div className="chat-panel__messages">
        {conversation?.messages.length === 0 && (
          <div className="chat-panel__empty">
            <p>Say hello to {agent.name}. Conversation stays here while you explore the map.</p>
            <p className="chat-panel__hints">
              Try: {AGENT_COMMAND_HINTS.map((hint) => `"${hint}"`).join(' · ')}
            </p>
          </div>
        )}
        {conversation?.messages.map((msg) => (
          <div
            key={msg.id}
            className={`chat-panel__message chat-panel__message--${msg.role}`}
          >
            <span className="chat-panel__message-role">
              {msg.role === 'user' ? 'You' : agent.name}
            </span>
            {msg.role === 'assistant' ? (
              <ChatMessageBody content={msg.content} streaming={msg.streaming} />
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
          placeholder={`Message ${agent.name}…`}
          rows={2}
          disabled={conversation?.isLoading}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void handleSubmit(e);
            }
          }}
        />
        <button
          type="submit"
          className={`chat-panel__send${sendPulse ? ' chat-panel__send--pulse' : ''}`}
          disabled={!input.trim() || conversation?.isLoading}
        >
          Send
        </button>
      </form>
    </aside>
  );
}
