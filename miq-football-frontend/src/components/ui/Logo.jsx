import { Link } from 'react-router-dom';

/**
 * Logo MiQ — Luxury neon wordmark
 *
 * Props:
 *   variant  — 'full' (wordmark + tagline) | 'compact' (wordmark only)
 *   white    — true → render on dark background (Navbar)
 *   size     — 'sm' | 'md' | 'lg' | 'xl' | '2xl'
 *   asLink   — wrap in <Link to="/">
 *   className
 */
const SIZES = {
  sm:   { h: 28,  tagPx: 6.5, gap: 3 },
  md:   { h: 36,  tagPx: 8,   gap: 4 },
  lg:   { h: 46,  tagPx: 9,   gap: 4 },
  xl:   { h: 60,  tagPx: 10,  gap: 5 },
  '2xl':{ h: 80,  tagPx: 12,  gap: 6 },
};

const Logo = ({ variant = 'full', white = false, size = 'md', asLink = true, className = '' }) => {
  const s = SIZES[size] || SIZES.md;

  // viewBox: 0 0 120 44  (M i Q  S P O R T)
  const vbW = 120;
  const vbH = 44;
  const svgW = s.h * (vbW / vbH);
  const svgH = s.h;

  const baseColor  = white ? '#FFFFFF' : '#111827';
  const mutedColor = white ? 'rgba(255,255,255,0.38)' : 'rgba(17,24,39,0.38)';

  const inner = (
    <div className={`inline-flex flex-col items-start select-none ${className}`} style={{ gap: s.gap }}>
      <svg
        viewBox={`0 0 ${vbW} ${vbH}`}
        width={svgW}
        height={svgH}
        xmlns="http://www.w3.org/2000/svg"
        aria-label="MiQ Sport"
        role="img"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Green gradient for Q */}
          <linearGradient id="logo-q-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#00FFB3" />
            <stop offset="45%"  stopColor="#10B981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>

          {/* Soft glow filter for the Q */}
          <filter id="logo-q-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Glow for the dot on i */}
          <filter id="logo-dot-glow" x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Subtle white glow for M in dark (navbar) mode */}
          <filter id="logo-m-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Gold accent gradient for SPORT tag */}
          <linearGradient id="logo-sport-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#10B981" />
            <stop offset="60%"  stopColor="#34D399" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>

        {/* ── M ────────────────────────────────── */}
        <text
          x="0" y="38"
          fontFamily="Oswald, sans-serif"
          fontWeight="800"
          fontSize="40"
          fill={baseColor}
          letterSpacing="-2"
          filter={white ? 'url(#logo-m-glow)' : undefined}
        >M</text>

        {/* ── i — vertical bar ─────────────────── */}
        <rect x="34" y="18" width="5" height="20" rx="2" fill={baseColor} />

        {/* i dot — large glowing neon circle */}
        <circle cx="36.5" cy="9" r="4.5" fill="#10B981" filter="url(#logo-dot-glow)" />
        {/* outer halo ring */}
        <circle cx="36.5" cy="9" r="7" fill="rgba(16,185,129,0.18)" />

        {/* ── Q — neon gradient + glow ─────────── */}
        <text
          x="43" y="38"
          fontFamily="Oswald, sans-serif"
          fontWeight="800"
          fontSize="40"
          fill="url(#logo-q-grad)"
          letterSpacing="-2"
          filter="url(#logo-q-glow)"
        >Q</text>

        {/* Decorative separator line */}
        <rect x="70" y="14" width="1.5" height="24" rx="0.75" fill={mutedColor} />

        {/* ── SPORT — small caps tracking ─────── */}
        {variant === 'full' && (
          <text
            x="76" y="31"
            fontFamily="Oswald, sans-serif"
            fontWeight="700"
            fontSize="13"
            fill={mutedColor}
            letterSpacing="4"
          >SPORT</text>
        )}
      </svg>
    </div>
  );

  if (asLink) {
    return (
      <Link to="/" className="group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm">
        {inner}
      </Link>
    );
  }
  return inner;
};

export default Logo;
