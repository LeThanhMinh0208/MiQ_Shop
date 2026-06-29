/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── Theme-switchable backgrounds (CSS vars, supports opacity) ─
        bg: {
          base:    'rgb(var(--rgb-bg-base) / <alpha-value>)',
          elevated:'rgb(var(--rgb-bg-elevated) / <alpha-value>)',
          raised:  'rgb(var(--rgb-bg-raised) / <alpha-value>)',
          overlay: 'rgb(var(--rgb-bg-overlay) / <alpha-value>)',
        },
        // ── Surface (CSS vars) ────────────────────────────────────────
        surface: {
          DEFAULT: 'rgb(var(--rgb-surface) / <alpha-value>)',
          light:   'rgb(var(--rgb-surface-light) / <alpha-value>)',
          border:  'rgb(var(--rgb-surface-border) / <alpha-value>)',
          divider: 'rgb(var(--rgb-surface-div) / <alpha-value>)',
          raised:  'rgb(var(--rgb-surface-raised) / <alpha-value>)',
          sunken:  'rgb(var(--rgb-surface-sunken) / <alpha-value>)',
        },
        // ── Text hierarchy (CSS vars) ─────────────────────────────────
        text: {
          primary:   'rgb(var(--rgb-text-primary) / <alpha-value>)',
          secondary: 'rgb(var(--rgb-text-secondary) / <alpha-value>)',
          muted:     'rgb(var(--rgb-text-muted) / <alpha-value>)',
          inverse:   'rgb(var(--rgb-text-inverse) / <alpha-value>)',
        },
        // ── Primary — Burnt Orange (same in both light and dark modes) ─
        primary: {
          50:    '#FFF7ED',
          100:   '#FFEDD5',
          200:   '#FED7AA',
          300:   '#FDBA74',
          400:   '#FB923C',
          DEFAULT: 'rgb(var(--rgb-primary) / <alpha-value>)',
          500:   'rgb(var(--rgb-primary) / <alpha-value>)',
          600:   '#EA580C',
          700:   '#C2410C',
          800:   '#9A3412',
          900:   '#7C2D12',
          light: '#FB7137',
          dark:  '#C2410C',
          glow:  'rgba(232,89,12,0.20)',
          neon:  '#FB923C',
          deep:  '#7C2D12',
        },
        // ── Gold luxury accent ───────────────────────────────────────
        gold: {
          DEFAULT: '#D4AF37',
          light:   '#F4D03F',
          dark:    '#9A7B0A',
        },
        // ── Legacy (admin pages, non-home) ───────────────────────────
        ink: {
          DEFAULT: '#1F2937',
          light:   '#374151',
          muted:   '#6B7280',
          faint:   '#9CA3AF',
        },
        cream: {
          DEFAULT: '#F8F9FA',
          50:      '#FFFFFF',
          100:     '#F8F9FA',
          200:     '#E5E7EB',
          300:     '#D1D5DB',
        },
      },
      fontFamily: {
        display: ['Oswald', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
        viet:    ['"Be Vietnam Pro"', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'xs':         '0 1px 2px 0 rgba(0,0,0,0.05)',
        'depth-sm':   '0 1px 2px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04)',
        'depth-md':   '0 2px 4px rgba(0,0,0,0.04), 0 6px 12px rgba(0,0,0,0.05), 0 12px 24px rgba(0,0,0,0.03)',
        'depth-lg':   '0 2px 4px rgba(0,0,0,0.04), 0 8px 16px rgba(0,0,0,0.06), 0 20px 40px rgba(0,0,0,0.05)',
        // Orange glow shadows
        'neon-xs':    '0 0 8px rgba(232,89,12,0.25)',
        'neon':       '0 0 20px rgba(232,89,12,0.35)',
        'neon-lg':    '0 0 40px rgba(232,89,12,0.45)',
        'pedestal':   '0 20px 40px -10px rgba(0,0,0,0.18)',
        'card':       '0 2px 8px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
        'card-hover': '0 8px 16px rgba(0,0,0,0.06), 0 24px 48px rgba(0,0,0,0.08)',
        'glass':      '0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.5)',
        'mega':       '0 24px 48px rgba(0,0,0,0.08), 0 8px 16px rgba(0,0,0,0.04)',
        'button-primary':       '0 4px 14px rgba(232,89,12,0.35)',
        'button-primary-hover': '0 6px 20px rgba(232,89,12,0.50)',
      },
      animation: {
        'marquee-l':      'marquee-l 28s linear infinite',
        'marquee-r':      'marquee-r 22s linear infinite',
        'levitate':       'levitate 4s ease-in-out infinite',
        'glow-pulse':     'glow-pulse 3s ease-in-out infinite',
        'spin-slow':      'spin 8s linear infinite',
        'spin-very-slow': 'spin 20s linear infinite',
        'gradient-shift': 'gradient-shift 4s ease infinite',
        'shimmer':     'shimmer 1.5s ease-in-out infinite',
        'fade-up':     'fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in':     'fadeIn 0.3s ease-out both',
        'slide-down':  'slideDown 0.3s cubic-bezier(0.16,1,0.3,1) both',
        'bounce-in':   'bounceIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
        'count-up':    'countUp 0.3s cubic-bezier(0.34,1.56,0.64,1) both',
        'ripple':      'ripple 600ms linear both',
        'shake':       'shake 400ms cubic-bezier(0.36,0.07,0.19,0.97) both',
        'float':       'float 3s ease-in-out infinite',
        'pulse-primary': 'pulsePrimary 2s ease-in-out infinite',
        'bar-fill':    'barFill 0.6s ease-out both',
        'announce':    'announceSlide 0.4s cubic-bezier(0.16,1,0.3,1) both',
      },
      keyframes: {
        'marquee-l': {
          from: { transform: 'translateX(0)' },
          to:   { transform: 'translateX(-50%)' },
        },
        'marquee-r': {
          from: { transform: 'translateX(-50%)' },
          to:   { transform: 'translateX(0)' },
        },
        levitate: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%':      { transform: 'translateY(-20px) rotate(2deg)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.6' },
          '50%':      { opacity: '1' },
        },
        shimmer: {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        bounceIn: {
          from: { opacity: '0', transform: 'scale(0.6)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        countUp: {
          from: { transform: 'translateY(8px) scale(0.8)', opacity: '0' },
          to:   { transform: 'translateY(0) scale(1)',     opacity: '1' },
        },
        ripple: {
          from: { transform: 'scale(0)', opacity: '0.6' },
          to:   { transform: 'scale(4)', opacity: '0' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%':      { transform: 'translateX(-6px)' },
          '40%':      { transform: 'translateX(6px)' },
          '60%':      { transform: 'translateX(-4px)' },
          '80%':      { transform: 'translateX(4px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        pulsePrimary: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(232,89,12,0.35)' },
          '50%':      { boxShadow: '0 0 0 8px rgba(232,89,12,0)' },
        },
        barFill: {
          from: { transform: 'scaleX(0)' },
          to:   { transform: 'scaleX(1)' },
        },
        announceSlide: {
          from: { opacity: '0', height: '0', paddingTop: '0', paddingBottom: '0' },
          to:   { opacity: '1', height: 'auto', paddingTop: '8px', paddingBottom: '8px' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% center' },
          '50%':      { backgroundPosition: '100% center' },
        },
      },
      backgroundImage: {
        'gradient-primary':      'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
        'gradient-primary-soft': 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
        'gradient-card': 'linear-gradient(135deg, #F9FAFB 0%, #FFFFFF 100%)',
        'noise': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
      transitionTimingFunction: {
        'spring':   'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'bounce':   'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'smooth':   'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
      },
    },
  },
  plugins: [],
};
