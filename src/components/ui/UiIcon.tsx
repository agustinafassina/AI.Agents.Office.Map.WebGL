export type IconName =
  | 'home'
  | 'living'
  | 'center-desk'
  | 'cafeteria'
  | 'wall-desks'
  | 'zoom-in'
  | 'zoom-out'
  | 'reset'
  | 'recenter'
  | 'follow'
  | 'follow-active';

const FILLED_PATHS: Partial<Record<IconName, string>> = {
  home: 'M12 3L4 10v9h5v-6h6v6h5v-9L12 3zm0 2.3l5 4.5v6.2h-2v-5H9v5H7v-6.2l5-4.5z',
  'center-desk': 'M5 5h6v6H5V5zm8 0h6v6h-6V5zM5 13h6v6H5v-6zm8 0h6v6h-6v-6z',
  cafeteria: 'M4 18h16v2H4v-2zm2-4h3v3H6v-3zm5 0h3v3h-3v-3zm5 0h3v3h-3v-3zM7 6h10l2 4H5l2-4z',
  living: 'M12 4a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6z',
  'wall-desks': 'M4 8h16v2H4V8zm2 4h12v6H6v-6zm2 2v2h8v-2H8z',
};

interface UiIconProps {
  name: IconName;
  size?: number;
  className?: string;
}

const STROKE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function UiIcon({ name, size = 18, className }: UiIconProps) {
  const svgProps = {
    className,
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    'aria-hidden': true as const,
  };

  if (name === 'zoom-in') {
    return (
      <svg {...svgProps}>
        <circle {...STROKE} cx="10.5" cy="10.5" r="5.5" />
        <path {...STROKE} d="M10.5 8v5M8 10.5h5" />
        <path {...STROKE} d="M15 15l4 4" />
      </svg>
    );
  }

  if (name === 'zoom-out') {
    return (
      <svg {...svgProps}>
        <circle {...STROKE} cx="10.5" cy="10.5" r="5.5" />
        <path {...STROKE} d="M8 10.5h5" />
        <path {...STROKE} d="M15 15l4 4" />
      </svg>
    );
  }

  if (name === 'reset') {
    return (
      <svg {...svgProps}>
        <path {...STROKE} d="M4 12a8 8 0 0113.7-5.7" />
        <path {...STROKE} d="M16 4v4h-4" />
        <path {...STROKE} d="M20 12a8 8 0 01-13.7 5.7" />
        <path {...STROKE} d="M8 20v-4h4" />
      </svg>
    );
  }

  if (name === 'recenter') {
    return (
      <svg {...svgProps}>
        <circle {...STROKE} cx="12" cy="12" r="3.5" />
        <path {...STROKE} d="M12 4v3M12 17v3M4 12h3M17 12h3" />
      </svg>
    );
  }

  if (name === 'follow') {
    return (
      <svg {...svgProps}>
        <circle {...STROKE} cx="12" cy="12" r="3" />
        <path {...STROKE} d="M12 2v3M12 19v3M2 12h3M19 12h3" />
        <path {...STROKE} d="M16 8l2-2M6 18l-2 2M8 6L6 4M18 16l2 2" />
      </svg>
    );
  }

  if (name === 'follow-active') {
    return (
      <svg {...svgProps}>
        <circle {...STROKE} cx="12" cy="12" r="3" fill="currentColor" />
        <path {...STROKE} d="M12 2v3M12 19v3M2 12h3M19 12h3" />
      </svg>
    );
  }

  return (
    <svg {...svgProps} fill="currentColor">
      <path d={FILLED_PATHS[name]} />
    </svg>
  );
}
