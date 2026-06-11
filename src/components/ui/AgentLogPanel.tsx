import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from '@/i18n';
import { useAgentInteractionLogStore } from '@/stores/agentInteractionLog.store';
import './AgentLogPanel.css';

interface AgentLogPanelProps {
  open: boolean;
  onClose: () => void;
}

function formatTurnTime(timestamp: number, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(timestamp));
}

export function AgentLogPanel({ open, onClose }: AgentLogPanelProps) {
  const { t, locale } = useTranslation();
  const sessions = useAgentInteractionLogStore((state) => state.sessions);
  const turnCount = useAgentInteractionLogStore((state) => state.turnCount);
  const downloadTxt = useAgentInteractionLogStore((state) => state.downloadTxt);
  const clearLog = useAgentInteractionLogStore((state) => state.clearLog);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const list = listRef.current;
    if (!list) return;
    list.scrollTop = list.scrollHeight;
  }, [open, turnCount]);

  if (!open) return null;

  return createPortal(
    <div className="agent-log-panel-host" role="presentation">
      <button
        type="button"
        className="agent-log-panel-host__backdrop"
        onClick={onClose}
        aria-label={t('agentLog.close')}
      />
      <section
        className="agent-log-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="agent-log-title"
      >
        <header className="agent-log-panel__header">
          <div>
            <h2 id="agent-log-title" className="agent-log-panel__title">
              {t('agentLog.title')}
            </h2>
            <p className="agent-log-panel__subtitle">{t('agentLog.subtitle')}</p>
          </div>
          <button
            type="button"
            className="agent-log-panel__close"
            onClick={onClose}
            aria-label={t('agentLog.close')}
          >
            ×
          </button>
        </header>

        <div ref={listRef} className="agent-log-panel__list" aria-live="polite">
          {sessions.length === 0 ? (
            <p className="agent-log-panel__empty">{t('agentLog.empty')}</p>
          ) : (
            sessions.map((session) => (
              <article key={session.id} className="agent-log-panel__session">
                <header className="agent-log-panel__session-header">
                  <span className="agent-log-panel__session-agents">
                    {session.agentNames.join(' · ')}
                  </span>
                  <span
                    className={`agent-log-panel__session-badge${
                      session.endedAt ? ' agent-log-panel__session-badge--ended' : ''
                    }`}
                  >
                    {session.endedAt ? t('agentLog.sessionEnded') : t('agentLog.sessionLive')}
                  </span>
                </header>

                {session.turns.length === 0 ? (
                  <p className="agent-log-panel__waiting">{t('agentLog.waiting')}</p>
                ) : (
                  <ul className="agent-log-panel__turns">
                    {session.turns.map((turn, index) => (
                      <li
                        key={`${session.id}-${index}`}
                        className="agent-log-panel__turn"
                      >
                        <time
                          className="agent-log-panel__turn-time"
                          dateTime={new Date(turn.timestamp).toISOString()}
                        >
                          {formatTurnTime(turn.timestamp, locale)}
                        </time>
                        <p className="agent-log-panel__turn-meta">
                          <strong>{turn.fromName}</strong>
                          <span aria-hidden> → </span>
                          {turn.toName}
                        </p>
                        <p className="agent-log-panel__turn-content">{turn.content}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))
          )}
        </div>

        <footer className="agent-log-panel__footer">
          <span className="agent-log-panel__count">
            {t('hud.agentLogCount', { count: turnCount })}
          </span>
          <div className="agent-log-panel__actions">
            <button
              type="button"
              className="agent-log-panel__btn agent-log-panel__btn--ghost"
              onClick={() => clearLog()}
              disabled={turnCount === 0}
            >
              {t('agentLog.clear')}
            </button>
            <button
              type="button"
              className="agent-log-panel__btn"
              onClick={() => downloadTxt()}
              disabled={turnCount === 0}
            >
              {t('agentLog.download')}
            </button>
          </div>
        </footer>
      </section>
    </div>,
    document.body,
  );
}
