import { useState, useId } from 'react';
import { Eye, EyeOff, Check, AlertCircle } from 'lucide-react';

const Input = ({
  label,
  type = 'text',
  error,
  success,
  hint,
  icon: Icon,
  maxLength,
  className = '',
  value,
  onChange,
  ...props
}) => {
  const id = useId();
  const [showPassword, setShowPassword] = useState(false);
  const [shaking, setShaking] = useState(false);

  const currentType = type === 'password' ? (showPassword ? 'text' : 'password') : type;

  const triggerShake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 450);
  };

  const prevError = useState(error);
  if (error && error !== prevError[0] && !shaking) {
    triggerShake();
  }

  const borderClass = error
    ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
    : success
      ? 'border-primary focus:border-primary focus:ring-primary/10'
      : 'border-surface-border focus:border-primary focus:ring-primary/10';

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-xs font-bold uppercase tracking-wider text-text-muted">
          {label}
        </label>
      )}

      <div className={`relative ${shaking ? 'animate-shake' : ''}`}>
        {Icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
            <Icon className="w-4 h-4" />
          </span>
        )}

        <input
          id={id}
          type={currentType}
          value={value}
          onChange={onChange}
          maxLength={maxLength}
          placeholder={props.placeholder || ' '}
          className={[
            'w-full rounded-xl border bg-bg-raised px-4 py-3 text-sm text-text-primary',
            'transition-all duration-200 ease-smooth',
            'focus:outline-none focus:ring-2',
            'placeholder:text-text-muted',
            Icon ? 'pl-10' : '',
            type === 'password' || success || error ? 'pr-10' : '',
            borderClass,
          ].filter(Boolean).join(' ')}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          {...props}
        />

        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center">
          {type === 'password' ? (
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-text-muted hover:text-text-primary transition p-0.5"
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              tabIndex={-1}
            >
              {showPassword
                ? <EyeOff className="w-4 h-4" />
                : <Eye className="w-4 h-4" />}
            </button>
          ) : success ? (
            <Check className="w-4 h-4 text-primary animate-bounce-in" />
          ) : error ? (
            <AlertCircle className="w-4 h-4 text-red-400" />
          ) : null}
        </span>

        {maxLength && value !== undefined && (
          <span className="absolute right-3.5 bottom-1.5 text-[10px] text-text-muted tabular-nums">
            {String(value).length}/{maxLength}
          </span>
        )}
      </div>

      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-red-500 flex items-center gap-1 animate-fade-in">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${id}-hint`} className="text-xs text-text-muted">
          {hint}
        </p>
      )}
    </div>
  );
};

export default Input;
