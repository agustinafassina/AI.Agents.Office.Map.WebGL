import { env } from '@/config/env';
import { useChatStore } from '@/stores/chat.store';
import './OfficeHud.css';

export function OfficeHud() {
  const serviceMode = useChatStore((s) => s.serviceMode);
  const connectionStatus = useChatStore((s) => s.connectionStatus);

  return (
    <div className="office-hud">
      <div className="office-hud__brand">
        <span className="office-hud__title">AI Agents Office</span>
        <span className="office-hud__hint">
          Click an avatar to chat · Scroll to zoom · Shift+drag to pan
        </span>
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