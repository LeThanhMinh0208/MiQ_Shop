import { Minus, Plus } from 'lucide-react';

const QuantityStepper = ({ value, onDecrement, onIncrement, min, max, disabled = false }) => {
  const decrDisabled = disabled || (min !== undefined && value <= min);
  const incrDisabled = disabled || (max !== undefined && value >= max);
  const btnCls = 'w-11 h-11 flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-overlay transition disabled:opacity-30';

  return (
    <div className="flex items-center border border-surface-border rounded-xl overflow-hidden bg-bg-raised">
      <button
        onClick={onDecrement}
        disabled={decrDisabled}
        className={btnCls}
        aria-label="Giảm số lượng"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <span className="w-11 text-center font-bold text-sm border-x border-surface-border h-11 flex items-center justify-center text-text-primary">
        {value}
      </span>
      <button
        onClick={onIncrement}
        disabled={incrDisabled}
        className={btnCls}
        aria-label="Tăng số lượng"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default QuantityStepper;
