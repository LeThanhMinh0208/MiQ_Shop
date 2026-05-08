import { motion } from 'framer-motion';

const BrandLogos = () => {
  const brands = [
    { name: 'New Balance', style: 'italic' },
    { name: 'NIKE', style: 'normal' },
    { name: 'adidas', style: 'lowercase' },
    { name: 'PUMA', style: 'normal' },
    { name: 'Mizuno', style: 'normal' },
    { name: 'adidas', style: 'lowercase' },
    { name: 'Mizuno', style: 'normal' },
    { name: 'UNDER ARMOUR', style: 'normal' },
    { name: 'New Balance', style: 'italic' },
    { name: 'NIKE', style: 'normal' },
  ];

  return (
    <section className="relative py-10 bg-gradient-to-b from-emerald-50 to-cream overflow-hidden border-y border-primary/10">
      {/* Curved ribbon effect */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg className="w-full h-full opacity-30" viewBox="0 0 1200 100" preserveAspectRatio="none">
          <path
            d="M 0 50 Q 300 10 600 50 T 1200 50"
            stroke="rgba(16, 185, 129, 0.3)"
            strokeWidth="2"
            fill="none"
          />
        </svg>
      </div>

      {/* Marquee scroll */}
      <motion.div
        className="flex gap-12 items-center whitespace-nowrap"
        animate={{ x: [0, -1200] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      >
        {[...brands, ...brands].map((brand, i) => (
          <div
            key={i}
            className={`font-display text-2xl md:text-3xl font-bold text-ink-muted hover:text-primary transition shrink-0 ${
              brand.style === 'italic' ? 'italic' : ''
            } ${brand.style === 'lowercase' ? 'lowercase' : ''}`}
          >
            {brand.name}
          </div>
        ))}
      </motion.div>
    </section>
  );
};

export default BrandLogos;