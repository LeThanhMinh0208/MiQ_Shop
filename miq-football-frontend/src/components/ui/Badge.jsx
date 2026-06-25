const variantMap = {
  new:        'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-neon-xs',
  sale:       'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-[0_0_8px_rgba(239,68,68,0.3)]',
  bestseller: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow-[0_0_8px_rgba(245,158,11,0.3)]',
  hot:        'bg-gradient-to-r from-orange-400 to-orange-600 text-white',
  limited:    'bg-gradient-to-r from-purple-500 to-violet-600 text-white',
  info:       'bg-blue-50 text-blue-700 border border-blue-200',
  success:    'bg-primary-50 text-primary-700 border border-primary-200',
  warning:    'bg-amber-50 text-amber-700 border border-amber-200',
  error:      'bg-red-50 text-red-700 border border-red-200',
  neutral:    'bg-surface-border text-text-muted',
};

const sizeMap = {
  xs: 'text-xs px-1.5 py-0.5 rounded-md tracking-widest',
  sm: 'text-xs px-2.5 py-1 rounded-lg tracking-widest',
  md: 'text-xs px-3 py-1.5 rounded-lg tracking-wider',
};

const Badge = ({
  variant = 'neutral',
  size = 'sm',
  children,
  className = '',
  ...props
}) => (
  <span
    className={[
      'inline-flex items-center font-bold uppercase',
      variantMap[variant] ?? variantMap.neutral,
      sizeMap[size],
      className,
    ].join(' ')}
    {...props}
  >
    {children}
  </span>
);

export default Badge;
