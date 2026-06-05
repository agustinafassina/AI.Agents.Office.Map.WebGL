import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { AgentDefinition } from '@/types/agent';
import { AgentHudCard } from './AgentHudCard';
import './AgentPickerModal.css';

interface AgentPickerModalProps {
  open: boolean;
  agents: AgentDefinition[];
  selectedAgentId: string | null;
  onClose: () => void;
  onSelect: (agentId: string) => void;
}

export function AgentPickerModal({
  open,
  agents,
  selectedAgentId,
  onClose,
  onSelect,
}: AgentPickerModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="agent-picker-modal" onClick={onClose} role="presentation">
      <div
        className="agent-picker-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="agent-picker-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="agent-picker-modal__header">
          <div>
            <h2 id="agent-picker-title" className="agent-picker-modal__title">
              Choose an agent
            </h2>
            <p className="agent-picker-modal__subtitle">
              Select a model to focus the camera and open chat.
            </p>
          </div>
          <button
            type="button"
            className="agent-picker-modal__close"
            onClick={onClose}
            aria-label="Close agent picker"
          >
            ×
          </button>
        </header>
        <div className="agent-picker-modal__grid" role="list">
          {agents.map((agent) => (
            <div key={agent.id} role="listitem">
              <AgentHudCard
                agent={agent}
                selected={selectedAgentId === agent.id}
                compact
                onClick={() => {
                  onSelect(agent.id);
                  onClose();
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}
