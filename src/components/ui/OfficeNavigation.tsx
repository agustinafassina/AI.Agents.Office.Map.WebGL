import { useSceneStore } from '@/stores/scene.store';
import './OfficeNavigation.css';

const ZONE_LINKS = [
  { id: 'all', label: 'All', icon: '⌂', pan: [0, 0, 0] as [number, number, number], zoom: 1 },
  { id: 'hub', label: 'Hub', icon: '□', pan: [0.5, 0, 1.05] as [number, number, number], zoom: 0.78 },
  { id: 'lounge', label: 'Lounge', icon: '◔', pan: [0, 0, -3.45] as [number, number, number], zoom: 0.82 },
  { id: 'meet', label: 'Meet', icon: '○', pan: [-4.35, 0, 0.08] as [number, number, number], zoom: 0.82 },
  { id: 'desk', label: 'Desk', icon: '▱', pan: [5.1, 0, 1.85] as [number, number, number], zoom: 0.78 },
];

export function OfficeNavigation() {
  const setView = useSceneStore((s) => s.setView);

  return (
    <nav className="office-nav" aria-label="Office sections">
      {ZONE_LINKS.map((zone) => (
        <button
          key={zone.id}
          type="button"
          className="office-nav__btn"
          onClick={() => setView(zone.pan, zone.zoom)}
          aria-label={`Focus ${zone.label}`}
          title={`Focus ${zone.label}`}
        >
          <span className="office-nav__icon" aria-hidden>
            {zone.icon}
          </span>
          <span className="office-nav__label">{zone.label}</span>
        </button>
      ))}
    </nav>
  );
}
