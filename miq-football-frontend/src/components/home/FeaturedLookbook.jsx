import { motion } from 'framer-motion';

const FeaturedLookbook = () => {
  return (
    <section className="py-12 lg:py-24 px-4 lg:px-8 bg-black text-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-lg"
          >
            <img
              src="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&h=600&fit=crop"
              alt="Street to Pitch Collection"
              className="w-full h-auto object-cover aspect-square lg:aspect-auto lg:h-96"
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
          </motion.div>

          {/* Right: Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex flex-col justify-center space-y-6"
          >
            {/* Accent Label */}
            <div className="inline-block">
              <span className="inline-block bg-primary text-white text-xs lg:text-sm font-bold px-4 py-2 rounded-full">
                NEW COLLECTION 2026
              </span>
            </div>

            {/* Main Title */}
            <h2 className="text-4xl lg:text-5xl xl:text-6xl font-black leading-tight">
              STREET
              <br />
              TO PITCH
              <br />
              <span className="text-primary">COLLECTION</span>
            </h2>

            {/* Subtitle */}
            <p className="text-lg lg:text-xl text-gray-300 max-w-md">
              Unleash your speed with the latest turf boots and breathable kits. Engineered
              for champions, designed for the streets.
            </p>

            {/* Feature Highlights */}
            <div className="flex flex-col sm:flex-row gap-4 py-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span className="text-sm text-gray-300">Premium Performance Fabric</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span className="text-sm text-gray-300">Custom Printing</span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-primary hover:bg-primary/80 text-white font-bold text-lg px-8 py-4 rounded-lg transition-all duration-300 inline-flex items-center gap-2 group"
              >
                Explore The Collection
                <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
              </motion.button>
            </div>

            {/* Trust Badge */}
            <div className="pt-4 border-t border-gray-700">
              <p className="text-xs text-gray-400">
                ✓ Free shipping on orders over 500K • ✓ 30-day returns • ✓ 1-year quality guarantee
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedLookbook;
