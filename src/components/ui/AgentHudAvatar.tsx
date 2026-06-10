import type { CSSProperties } from 'react';
import type { AgentDefinition } from '@/types/agent';
import type { AvatarDesignId } from '@/types/avatarDesign';
import { getAvatarDesign, resolveAvatarDesignId } from '@/config/avatarDesigns';
import './AgentHudAvatar.css';

interface AgentHudAvatarProps {
  agent: AgentDefinition;
  size?: number;
  selected?: boolean;
}

interface HudDreadOffset {
  left: string;
  rotate: string;
  height: string;
}

const HUD_DREADS: Record<AvatarDesignId, HudDreadOffset[]> = {
  'bob-marley': [
    { left: '8%', rotate: '-20deg', height: '58%' },
    { left: '16%', rotate: '-14deg', height: '64%' },
    { left: '24%', rotate: '-10deg', height: '68%' },
    { left: '32%', rotate: '-6deg', height: '72%' },
    { left: '40%', rotate: '-3deg', height: '74%' },
    { left: '50%', rotate: '0deg', height: '76%' },
    { left: '60%', rotate: '3deg', height: '74%' },
    { left: '68%', rotate: '6deg', height: '72%' },
    { left: '76%', rotate: '10deg', height: '68%' },
    { left: '84%', rotate: '14deg', height: '64%' },
    { left: '92%', rotate: '20deg', height: '58%' },
    { left: '20%', rotate: '-8deg', height: '52%' },
    { left: '80%', rotate: '8deg', height: '52%' },
    { left: '44%', rotate: '-2deg', height: '66%' },
    { left: '56%', rotate: '2deg', height: '66%' },
  ],
  'michael-jackson': [
    { left: '10%', rotate: '-22deg', height: '32%' },
    { left: '18%', rotate: '-16deg', height: '36%' },
    { left: '28%', rotate: '-10deg', height: '28%' },
    { left: '72%', rotate: '10deg', height: '28%' },
    { left: '82%', rotate: '16deg', height: '36%' },
    { left: '90%', rotate: '22deg', height: '32%' },
    { left: '42%', rotate: '-4deg', height: '20%' },
    { left: '58%', rotate: '4deg', height: '20%' },
  ],
  'freddie-mercury': [
    { left: '34%', rotate: '-4deg', height: '26%' },
    { left: '50%', rotate: '0deg', height: '28%' },
    { left: '66%', rotate: '4deg', height: '26%' },
  ],
  shakira: [
    { left: '8%', rotate: '-18deg', height: '52%' },
    { left: '16%', rotate: '-12deg', height: '58%' },
    { left: '24%', rotate: '-8deg', height: '62%' },
    { left: '32%', rotate: '-4deg', height: '66%' },
    { left: '40%', rotate: '-2deg', height: '68%' },
    { left: '50%', rotate: '0deg', height: '70%' },
    { left: '60%', rotate: '2deg', height: '68%' },
    { left: '68%', rotate: '4deg', height: '66%' },
    { left: '76%', rotate: '8deg', height: '62%' },
    { left: '84%', rotate: '12deg', height: '58%' },
    { left: '92%', rotate: '18deg', height: '52%' },
    { left: '20%', rotate: '-10deg', height: '48%' },
    { left: '80%', rotate: '10deg', height: '48%' },
    { left: '36%', rotate: '-3deg', height: '64%' },
    { left: '64%', rotate: '3deg', height: '64%' },
  ],
};

export function AgentHudAvatar({ agent, size = 26, selected = false }: AgentHudAvatarProps) {
  const designId = resolveAvatarDesignId(agent);
  const design = getAvatarDesign(designId);
  const dreads = HUD_DREADS[designId];

  return (
    <span
      className={`agent-hud-avatar agent-hud-avatar--${designId}${selected ? ' agent-hud-avatar--selected' : ''}`}
      style={
        {
          '--avatar-size': `${size}px`,
          '--shirt': design.chassisColor,
          '--hair': design.hairColor,
          '--accent': design.accentColor,
          '--skin': design.skinColor,
        } as CSSProperties
      }
      aria-hidden
    >
      {designId === 'michael-jackson' && <span className="agent-hud-avatar__fedora" />}
      {designId === 'michael-jackson' && <span className="agent-hud-avatar__glove" />}
      {designId === 'bob-marley' && <span className="agent-hud-avatar__tam" />}
      <span className="agent-hud-avatar__dreads">
        {dreads.map((dread, index) => (
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
