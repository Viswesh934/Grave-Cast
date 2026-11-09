import type { SVGProps } from 'react';

/**
 * CoffinBloodLogo
 * Gothic coffin casket silhouette infused with pulsing arterial crimson blood channels and sigil.
 */
export function CoffinBloodLogo({ size = 28, className = '', ...props }: { size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={`overflow-visible ${className}`}
      {...props}
    >
      <defs>
        {/* Blood glow filter */}
        <filter id="bloodGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 0.1 0 0 0  0 0 0.2 0 0  0 0 0 2 0" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        {/* Pulsing blood gradient */}
        <linearGradient id="bloodPulse" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff4d6d" />
          <stop offset="50%" stopColor="#ff1744" />
          <stop offset="100%" stopColor="#b91c1c" />
        </linearGradient>
        {/* Obsidian casket gradient */}
        <linearGradient id="casketStone" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#283a30" />
          <stop offset="60%" stopColor="#14221b" />
          <stop offset="100%" stopColor="#0c1712" />
        </linearGradient>
      </defs>

      {/* Intense Ambient Red Glow halo */}
      <polygon
        points="32,2 51,17 45,60 19,60 13,17"
        fill="#ff1744"
        opacity="0.65"
        filter="url(#bloodGlow)"
      />

      {/* Outer Coffin Heavy Rim */}
      <polygon
        points="32,4 49,18 43,58 21,58 15,18"
        fill="url(#casketStone)"
        stroke="#ff1744"
        strokeWidth="1.8"
        strokeOpacity="0.8"
      />

      {/* Inner Inset Facet */}
      <polygon
        points="32,8 45,20 40,54 24,54 19,20"
        fill="#08120e"
        stroke="#1a3528"
        strokeWidth="1.2"
      />

      {/* Corner Iron Studs */}
      <circle cx="32" cy="7" r="1.5" fill="#3a5a48" />
      <circle cx="46" cy="19" r="1.5" fill="#3a5a48" />
      <circle cx="18" cy="19" r="1.5" fill="#3a5a48" />
      <circle cx="41" cy="55" r="1.5" fill="#3a5a48" />
      <circle cx="23" cy="55" r="1.5" fill="#3a5a48" />

      {/* Pulsing Arterial Blood Veins */}
      <path
        d="M32 16 Q36 22 41 24 M32 30 Q26 28 22 25 M32 38 Q38 42 39 48 M32 44 Q25 46 25 50"
        stroke="#ff1744"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.75"
        filter="url(#bloodGlow)"
      />

      {/* Central Glowing Blood Cruciform Sigil */}
      <path
        d="M32 16 L32 48 M23 26 L41 26"
        stroke="url(#bloodPulse)"
        strokeWidth="3.2"
        strokeLinecap="square"
        filter="url(#bloodGlow)"
      />
      <path
        d="M32 16 L32 48 M23 26 L41 26"
        stroke="#ffffff"
        strokeWidth="1.2"
        strokeLinecap="square"
        opacity="0.9"
      />

      {/* Glowing Blood Core Drop */}
      <circle cx="32" cy="26" r="3" fill="#ff1744" filter="url(#bloodGlow)" />
      <circle cx="32" cy="26" r="1.4" fill="#ffffff" />
    </svg>
  );
}

export function CopyIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

export function CheckIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function SearchIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function VolumeIcon({ size = 18, muted = false, className = '' }: { size?: number; muted?: boolean; className?: string }) {
  if (muted) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <line x1="22" x2="16" y1="9" y2="15" />
        <line x1="16" x2="22" y1="9" y2="15" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

export function GitHubIcon({ size = 18, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

export function PumpkinIcon({ size = 28, className = '', ...props }: { size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={`overflow-visible ${className}`} {...props}>
      <path d="M30 5 C30 5, 32 15, 27 18 C33 16, 38 12, 36 5 C33 7, 31 6, 30 5 Z" fill="#33691E" stroke="#1B5E20" strokeWidth="1.5" />
      <ellipse cx="18" cy="38" rx="14" ry="19" fill="#E65100" />
      <ellipse cx="46" cy="38" rx="14" ry="19" fill="#E65100" />
      <ellipse cx="24" cy="38" rx="16" ry="21" fill="#F57C00" />
      <ellipse cx="40" cy="38" rx="16" ry="21" fill="#F57C00" />
      <ellipse cx="32" cy="38" rx="14" ry="22" fill="#FB8C00" />
      <polygon points="21,27 27,33 17,35" fill="#210500" />
      <polygon points="22,28.5 26,32.5 18.5,34" fill="#FFD54F" />
      <polygon points="43,27 37,33 47,35" fill="#210500" />
      <polygon points="42,28.5 38,32.5 45.5,34" fill="#FFD54F" />
      <polygon points="32,34 28,40 36,40" fill="#210500" />
      <polygon points="32,35.5 29.5,39.5 34.5,39.5" fill="#FFE082" />
      <path d="M16 43 Q32 58 48 43 C44 48 42 45 40 47 C38 45 35 49 32 46 C29 49 26 45 24 47 C22 45 20 48 16 43 Z" fill="#210500" />
      <path d="M17.5 44 Q32 56.5 46.5 44 C43.5 47.5 41.5 45 39.5 46.5 C37.5 44.5 34.5 48 32 45.5 C29.5 48 26.5 44.5 24.5 46.5 C22.5 45 20.5 47.5 17.5 44 Z" fill="#FFCA28" />
    </svg>
  );
}

export function SparklesIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
    </svg>
  );
}

