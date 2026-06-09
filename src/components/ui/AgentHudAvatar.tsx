import type { CSSProperties } from 'react';
import type { AgentDefinition } from '@/types/agent';
import './AgentHudAvatar.css';

interface AgentHudAvatarProps {
  agent: AgentDefinition;
  size?: number;
  selected?: boolean;
}

const DREAD_OFFSETS = [
  { left: '18%', rotate: '-14deg', height: '34%' },
  { left: '32%', rotate: '-6deg', height: '38%' },
  { left: '46%', rotate: '0deg', height: '40%' },
  { left: '60%', rotate: '6deg', height: '38%' },
  { left: '74%', rotate: '14deg', height: '34%' },
  { left: '26%', rotate: '-10deg', height: '28%' },
  { left: '68%', rotate: '10deg', height: '28%' },
] as const;

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
      <span className="agent-hud-avatar__dreads">
        {DREAD_OFFSETS.map((dread, index) => (
          <span
            key={index}
            className="agent-hud-avatar__dread"
            style={{
              left: dread.left,
              height: dread.height,
              transform: `translateX(-50%) rotate(${dread.rotate})`,
            }}
          />
        ))}
      </span>
      <span className="agent-hud-avatar__head" />
      <span className="agent-hud-avatar__body" />
    </span>
  );
}
