import { useState } from 'react';
import { OFFICE_ZONE_LINKS } from '@/config/officeZones';
import { useSceneStore } from '@/stores/scene.store';
import { UiIcon } from './UiIcon';
import './OfficeNavigation.css';

export function OfficeNavigation() {
  const setView = useSceneStore((s) => s.setView);
  const [active, setActive] = useState('all');

  return (
    <nav className="office-nav" aria-label="Office sections">
      {OFFICE_ZONE_LINKS.map((zone) => (
        <button
          key={zone.id}
          type="button"
          className={`office-nav__btn${active === zone.id ? ' office-nav__btn--active' : ''}`}
          onClick={() => {
            setActive(zone.id);
            setView(zone.pan, zone.zoom);
          }}
          aria-label={`Focus ${zone.label}`}
          aria-current={active === zone.id ? 'true' : undefined}
          title={`Focus ${zone.label}`}
        >
          <span className="office-nav__icon" aria-hidden>
            <UiIcon name={zone.icon} size={16} />
          </span>
          <span className="office-nav__label">{zone.shortLabel}</span>
        </button>
      ))}
    </nav>
  );
}
