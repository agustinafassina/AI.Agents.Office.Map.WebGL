import { env } from '@/config/env';
import { OFFICE_ZONE_LINKS } from '@/config/officeZones';
import { useChatStore } from '@/stores/chat.store';
import { useSceneStore } from '@/stores/scene.store';
import './OfficeHud.css';

export function OfficeHud() {
  const serviceMode = useChatStore((s) => s.serviceMode);
  const connectionStatus = useChatStore((s) => s.connectionStatus);
  const setView = useSceneStore((s) => s.setView);

  const zoneChips = OFFICE_ZONE_LINKS.filter((z) => z.id !== 'all');

  return (
    <div className="office-hud">
      <div className="office-hud__brand">
        <span className="office-hud__eyebrow">Isometric Workspace</span>
        <span className="office-hud__title">AI Agents Office</span>
        <span className="office-hud__hint">
          Click zones · drag to pan · select agents to chat
        </span>
        <div className="office-hud__chips" role="group" aria-label="Quick zone focus">
          {zoneChips.map((zone) => (
            <button
              key={zone.id}
              type="button"
              className="office-hud__chip"
              onClick={() => setView(zone.pan, zone.zoom)}
              title={`Focus ${zone.label}`}
            >
              {zone.shortLabel}
            </button>
          ))}
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
