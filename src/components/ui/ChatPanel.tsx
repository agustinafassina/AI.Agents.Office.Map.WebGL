import { useState, useRef, useEffect, type FormEvent } from 'react';
import { useChatStore } from '@/stores/chat.store';
import { useSceneStore } from '@/stores/scene.store';
import { AGENT_COMMAND_HINTS } from '@/utils/chatAgentCommands';
import './ChatPanel.css';

export function ChatPanel() {
  const isOpen = useChatStore((s) => s.isPanelOpen);
  const closeChat = useChatStore((s) => s.closeChat);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const agent = useChatStore((s) => s.getActiveAgent());
  const conversation = useChatStore((s) => s.getActiveConversation());
  const connectionStatus = useChatStore((s) => s.connectionStatus);
  const serviceMode = useChatStore((s) => s.serviceMode);
  const models = useChatStore((s) => s.models);
  const resolveModelLabel = useChatStore((s) => s.resolveModelLabel);
  const isModelAvailableOnApi = useChatStore((s) => s.isModelAvailableOnApi);
  const clearSelection = useSceneStore((s) => s.clearSelection);

  const [input, setInput] = useState('');
  const [sendPulse, setSendPulse] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages.length, conversation?.isLoading]);

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
            <p className="chat-panel__model">
              Model:{' '}
              <code className={serviceMode === 'live' && !modelAvailable ? 'chat-panel__model--missing' : ''}>
                {modelLabel}
              </code>
              {serviceMode === 'live' && modelAvailable && (
                <span className="chat-panel__model-source"> · from LiteLLM</span>
              )}
            </p>
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
            <p className="chat-panel__message-text">{msg.content}</p>
          </div>
        ))}
        {conversation?.isLoading && (
          <div className="chat-panel__message chat-panel__message--assistant">
            <span className="chat-panel__message-role">{agent.name}</span>
            <p className="chat-panel__typing" aria-live="polite">
              Thinking
              <span className="chat-panel__typing-dots" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
            </p>
          </div>
        )}
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
