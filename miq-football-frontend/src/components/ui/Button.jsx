import { useRef } from 'react';
import { Loader } from 'lucide-react';

const sizeClasses = {
  sm: 'px-4 py-2 text-xs gap-1.5 min-h-[36px]',
  md: 'px-6 py-3 text-[0.8125rem] gap-2 min-h-[44px]',
  lg: 'px-8 py-4 text-sm gap-2.5 min-h-[52px]',
};

const variantClasses = {
  primary: [
    'bg-gradient-to-br from-primary-500 to-primary-600 text-white',
    'shadow-button-primary hover:shadow-button-primary-hover',
    'hover:from-primary-600 hover:to-primary-700 hover:-translate-y-px',
    'active:translate-y-0 active:scale-[0.98]',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
  ].join(' '),

  secondary: [
    'bg-bg-elevated text-text-primary border border-surface-border',
    'shadow-depth-sm hover:shadow-depth-md',
    'hover:border-primary hover:text-primary hover:-translate-y-px',
    'active:translate-y-0 active:scale-[0.98]',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
  ].join(' '),

  ghost: [
    'bg-transparent text-text-primary',
    'hover:bg-surface',
    'active:bg-surface-border active:scale-[0.98]',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ].join(' '),

  danger: [
    'bg-gradient-to-br from-red-500 to-red-600 text-white',
    'shadow-[0_4px_14px_rgba(239,68,68,0.35)] hover:shadow-[0_6px_20px_rgba(239,68,68,0.5)]',
    'hover:from-red-600 hover:to-red-700 hover:-translate-y-px',
    'active:translate-y-0 active:scale-[0.98]',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
  ].join(' '),
};

const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  children,
  onClick,
  ...props
}) => {
  const btnRef = useRef(null);

  const handleClick = (e) => {
    // Ripple effect
    const btn = btnRef.current;
    if (!btn) return;
    const ripple = document.createElement('span');
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.className = 'ripple-wave';
    ripple.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px`;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 620);
    onClick?.(e);
  };

  return (
    <button
      ref={btnRef}
      onClick={handleClick}
      className={[
        'relative overflow-hidden rounded-xl',
        'inline-flex items-center justify-center',
        'font-semibold uppercase tracking-wider',
        'transition-all duration-200 ease-smooth',
        'select-none will-change-transform',
        sizeClasses[size],
        variantClasses[variant],
        fullWidth ? 'w-full' : '',
        loading ? 'pointer-events-none' : '',
        className,
      ].filter(Boolean).join(' ')}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <>
          <Loader className="w-4 h-4 animate-spin" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 flex-shrink-0" />}
          {children && <span>{children}</span>}
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 flex-shrink-0" />}
        </>
      )}
    </button>
  );
};

export default Button;
