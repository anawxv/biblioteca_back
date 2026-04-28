export function HeroIllustration({ compact = false }) {
  const width = compact ? 120 : 210;
  const height = compact ? 100 : 160;

  return (
    <svg
      aria-hidden="true"
      className={`hero-illustration${compact ? " hero-illustration--compact" : ""}`}
      viewBox="0 0 240 180"
      width={width}
      height={height}
    >
      <defs>
        <linearGradient id="bookPink" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#FF93C8" />
          <stop offset="100%" stopColor="#FF4DA6" />
        </linearGradient>
        <linearGradient id="bookOrange" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#FFD6E9" />
          <stop offset="100%" stopColor="#FFA8D4" />
        </linearGradient>
      </defs>
      <ellipse cx="130" cy="138" fill="#FFE6F2" rx="78" ry="36" />
      <g transform="translate(42 18)">
        <rect x="38" y="58" width="118" height="16" rx="8" fill="#FF66B3" />
        <rect x="24" y="78" width="128" height="18" rx="9" fill="#FFB5D9" />
        <rect x="34" y="100" width="114" height="18" rx="9" fill="url(#bookOrange)" />
        <rect x="44" y="38" width="116" height="16" rx="8" fill="#FFC2DF" />
        <rect x="55" y="20" width="96" height="14" rx="7" fill="url(#bookPink)" />
        <rect x="54" y="18" width="8" height="104" rx="4" fill="#F7A1CD" opacity="0.72" />
        <rect x="86" y="18" width="8" height="104" rx="4" fill="#F7A1CD" opacity="0.72" />
        <rect x="118" y="18" width="8" height="104" rx="4" fill="#F7A1CD" opacity="0.72" />
      </g>
      <g transform="translate(24 92)">
        <rect x="0" y="20" width="28" height="30" rx="8" fill="#F59E0B" />
        <path d="M14 2c8 0 16 8 16 17v8H-2v-8C-2 10 6 2 14 2Z" fill="#34D399" />
        <path d="M11 0c8 3 9 13 5 20" fill="none" stroke="#059669" strokeWidth="4" strokeLinecap="round" />
      </g>
      <g fill="#FFA7D6" opacity="0.85">
        <path d="M194 44l4 10 10 4-10 4-4 10-4-10-10-4 10-4 4-10Z" />
        <path d="M38 34l3 8 8 3-8 3-3 8-3-8-8-3 8-3 3-8Z" />
        <circle cx="196" cy="116" r="4" />
        <circle cx="26" cy="68" r="4" />
      </g>
      <path
        d="M202 130c9 0 16 7 16 16h-32c0-9 7-16 16-16Z"
        fill="#FFE8C8"
        stroke="#FF8AB9"
        strokeWidth="3"
      />
      <path d="M192 130c0-5 4-8 10-8" fill="none" stroke="#FF8AB9" strokeWidth="3" />
    </svg>
  );
}
