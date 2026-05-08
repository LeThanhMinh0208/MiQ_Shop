import { motion } from 'framer-motion';

const ProductCustomizer = ({ name, number, onChange }) => {
  return (
    <div className="bg-cream rounded-2xl p-5 border border-primary/20">
      <h4 className="font-display text-sm font-bold uppercase mb-3 text-primary">
        Cá nhân hóa
      </h4>

      <div className="grid grid-cols-[1fr_auto] gap-4 items-center">
        <div className="space-y-2">
          <div>
            <label className="text-xs font-semibold text-ink-muted uppercase">Tên</label>
            <input
              type="text"
              value={name}
              onChange={(e) => onChange({ name: e.target.value.toUpperCase().slice(0, 12), number })}
              placeholder="MIQ PRO"
              className="w-full mt-1 px-3 py-2 rounded-lg border border-cream-200 focus:border-primary focus:outline-none text-sm uppercase"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-ink-muted uppercase">Số</label>
            <input
              type="number"
              value={number}
              onChange={(e) => onChange({ name, number: e.target.value.slice(0, 2) })}
              placeholder="7"
              max="99"
              className="w-full mt-1 px-3 py-2 rounded-lg border border-cream-200 focus:border-primary focus:outline-none text-sm"
            />
          </div>
        </div>

        {/* Mockup preview - jersey với tên/số */}
        <motion.div
          key={`${name}-${number}`}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-br from-primary to-primary-dark rounded-xl w-24 h-32 flex flex-col items-center justify-center text-white p-2 shadow-lg"
        >
          <div className="font-display text-xs font-bold uppercase tracking-wide text-center leading-tight">
            {name || 'TÊN'}
          </div>
          <div className="font-display text-4xl font-bold leading-none mt-1">
            {number || '0'}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductCustomizer;