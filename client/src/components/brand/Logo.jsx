// MediVault brand mark.
// Concept: a rounded security "vault" shield (safekeeping of records) with a
// heartbeat / pulse line running through it (health). Drawn as a single inline
// SVG so it stays crisp at any size and inherits the accent colour. No images.

export function LogoMark({ size = 32, className = '', title = 'MediVault' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      role="img"
      aria-label={title}
      className={className}
    >
      <defs>
        <linearGradient id="mv-shield" x1="8" y1="3" x2="32" y2="37" gradientUnits="userSpaceOnUse">
          <stop stopColor="#17a195" />
          <stop offset="1" stopColor="#0f6960" />
        </linearGradient>
      </defs>
      {/* Shield / vault body */}
      <path
        d="M20 3.2l12.4 4.3a1.5 1.5 0 0 1 1 1.42v9.07c0 8.2-5.3 14.2-13.4 17.6a1.5 1.5 0 0 1-1.12 0C10.8 32.2 5.5 26.2 5.5 18V8.94a1.5 1.5 0 0 1 1-1.42L20 3.2z"
        fill="url(#mv-shield)"
      />
      {/* Inner inset to read as a vault door */}
      <path
        d="M20 7.6l9.3 3.2a.8.8 0 0 1 .53.76v6.9c0 6.3-4.1 10.9-10.1 13.5a.8.8 0 0 1-.6 0C13.1 29.35 9 24.75 9 18.46v-6.9a.8.8 0 0 1 .53-.76L20 7.6z"
        fill="#ffffff"
        fillOpacity="0.12"
        stroke="#ffffff"
        strokeOpacity="0.5"
        strokeWidth="1"
      />
      {/* Pulse / heartbeat */}
      <path
        d="M11.2 20.2h3.3l2-4.6 3.4 8.6 2.3-4.9 1.4 1.9h5.2"
        stroke="#ffffff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Full wordmark: mark + "MediVault" with a weight contrast so it reads as a
// designed logotype rather than plain bold text.
export function Logo({ size = 30, className = '', withWordmark = true, title = 'MediVault' }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} title={title} />
      {withWordmark && (
        <span className="text-[1.0625rem] font-bold leading-none tracking-tight text-ink-900">
          Medi<span className="text-accent-600">Vault</span>
        </span>
      )}
    </span>
  );
}
