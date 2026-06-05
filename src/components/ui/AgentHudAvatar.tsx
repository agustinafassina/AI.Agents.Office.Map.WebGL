import type { CSSProperties } from 'react';
import type { AgentDefinition } from '@/types/agent';
import './AgentHudAvatar.css';

interface AgentHudAvatarProps {
  agent: AgentDefinition;
  size?: number;
  selected?: boolean;
}

export function AgentHudAvatar({ agent, size = 26, selected = false }: AgentHudAvatarProps) {
  return (
    <span
      className={`agent-hud-avatar${selected ? ' agent-hud-avatar--selected' : ''}`}
      style={
        {
          '--avatar-size': `${size}px`,
          '--shirt': agent.avatarColor,
          '--hair': agent.accentColor,
        } as CSSProperties
      }
      aria-hidden
    >
      <span className="agent-hud-avatar__hair" />
      <span className="agent-hud-avatar__head" />
      <span className="agent-hud-avatar__body" />
    </span>
  );
}
