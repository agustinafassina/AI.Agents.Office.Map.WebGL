import { env } from '@/config/env';
import { useChatStore } from '@/stores/chat.store';
import './OfficeHud.css';

export function OfficeHud() {
  const serviceMode = useChatStore((s) => s.serviceMode);
  const connectionStatus = useChatStore((s) => s.connectionStatus);

  return (
    <div className="office-hud">
      <div className="office-hud__brand">
        <span className="office-hud__eyebrow">Isometric Workspace</span>
        <span className="office-hud__title">AI Agents Office</span>
        <span className="office-hud__hint">
          Use section pills · drag background · select agents
        </span>
        <div className="office-hud__chips" aria-hidden>
          <span>Hub</span>
          <span>Lounge</span>
          <span>Meet</span>
          <span>Desk</span>
        </div>
      </div>
      <div className="office-hud__status">
        <span className={`office-hud__dot office-hud__dot--${connectionStatus}`} />
        <span>
          {serviceMode === 'mock' ? 'Mock mode' : 'LiteLLM'} · {connectionStatus}
        </span>
        {!env.useMockLitellm && env.litellmApiKey && (
          <span className="office-hud__live">API configured</span>
        )}
      </div>
    </div>
  );
}