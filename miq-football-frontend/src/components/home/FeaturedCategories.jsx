import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const FeaturedCategories = () => {
  return (
    <section className="py-16 bg-cream">
      <div className="max-w-7xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-4xl md:text-5xl font-bold mb-10"
        >
          Featured Categories
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-auto md:h-[600px]">
          {/* CLUB KITS - Tall left card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            className="md:row-span-2 bg-gradient-to-br from-emerald-200 to-emerald-100 rounded-3xl p-8 relative overflow-hidden border border-primary/20 shadow-pedestal cursor-pointer flex flex-col justify-between"
          >
            <div className="relative z-10">
              <h3 className="font-display text-3xl md:text-4xl font-bold mb-3">CLUB KITS</h3>
              <p className="text-sm text-ink-light max-w-[200px]">
                Tận hưởng áo đấu chính hãng, mặc một đam mê.
              </p>
            </div>
            <div className="relative z-10 flex items-end justify-between">
              <Link
                to="/products?category=kits"
                className="bg-white text-ink font-semibold uppercase text-xs tracking-wider px-5 py-2 rounded-full hover:bg-primary hover:text-white transition shadow-md"
              >
                Explore →
              </Link>
            </div>

            {/* Jersey image */}
            <img
              src="https://images.unsplash.com/photo-1577471488278-16eec37ffcc2?w=400&q=80"
              alt="Club Kit"
              className="absolute bottom-4 right-4 w-48 h-48 object-contain drop-shadow-2xl"
            />
            {/* Pedestal */}
            <div className="absolute bottom-2 right-8 w-40 h-3 bg-primary/40 rounded-full blur-md" />
          </motion.div>

          {/* FOOTBALL BOOTS - Top right */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2 bg-gradient-to-br from-emerald-50 to-cream rounded-3xl p-6 relative overflow-hidden border border-primary/20 shadow-pedestal cursor-pointer min-h-[290px]"
          >
            <div className="relative z-10 max-w-[55%]">
              <h3 className="font-display text-3xl md:text-4xl font-bold mb-3">FOOTBALL BOOTS</h3>
              <p className="text-sm text-ink-light mb-4">Giày đỉnh cao mới ra mắt</p>
              <Link
                to="/products?category=boots"
                className="inline-block bg-white text-ink font-semibold uppercase text-xs tracking-wider px-5 py-2 rounded-full hover:bg-primary hover:text-white transition shadow-md"
              >
                Explore →
              </Link>
            </div>

            <img
              src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80"
              alt="Football Boots"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-72 h-64 object-contain drop-shadow-2xl"
            />
          </motion.div>

          {/* SPORTS APPAREL */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            transition={{ delay: 0.15 }}
            className="md:col-span-2 bg-gradient-to-br from-cream to-emerald-50 rounded-3xl p-6 relative overflow-hidden border border-primary/20 shadow-pedestal cursor-pointer min-h-[290px]"
          >
            <div className="relative z-10 max-w-[55%]">
              <h3 className="font-display text-3xl md:text-4xl font-bold mb-3">SPORTS APPAREL</h3>
              <p className="text-sm text-ink-light mb-4">Trang phục tập luyện chuyên nghiệp</p>
              <Link
                to="/products?category=apparel"
                className="inline-block bg-white text-ink font-semibold uppercase text-xs tracking-wider px-5 py-2 rounded-full hover:bg-primary hover:text-white transition shadow-md"
              >
                Explore →
              </Link>
            </div>

            <img
              src="https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400&q=80"
              alt="Sports Apparel"
              className="absolute right-4 top-1/2 -translate-y-1/2 w-56 h-56 object-cover rounded-2xl drop-shadow-2xl"
            />
          </motion.div>

          {/* ACCESSORIES - Full width bottom */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-3 bg-gradient-to-r from-emerald-100 via-emerald-50 to-emerald-100 rounded-3xl p-6 relative overflow-hidden border border-primary/20 shadow-pedestal cursor-pointer min-h-[200px] flex items-center"
          >
            <div className="relative z-10">
              <h3 className="font-display text-3xl md:text-4xl font-bold mb-3">ACCESSORIES</h3>
              <Link
                to="/products?category=accessories"
                className="inline-block bg-white text-ink font-semibold uppercase text-xs tracking-wider px-5 py-2 rounded-full hover:bg-primary hover:text-white transition shadow-md"
              >
                Explore →
              </Link>
            </div>

            {/* Accessories images */}
            <div className="absolute right-0 top-0 bottom-0 flex items-center gap-3 pr-6">
              <img
                src="https://images.unsplash.com/photo-1614632537190-23e4146777db?w=200&q=80"
                alt="Football"
                className="w-32 h-32 object-cover rounded-2xl drop-shadow-xl"
              />
              <img
                src="https://images.unsplash.com/photo-1556906781-9a412961c28c?w=200&q=80"
                alt="Gloves"
                className="w-32 h-32 object-cover rounded-2xl drop-shadow-xl hidden md:block"
              />
              <img
                src="https://images.unsplash.com/photo-1530870110042-98b2cb110834?w=200&q=80"
                alt="Socks"
                className="w-32 h-32 object-cover rounded-2xl drop-shadow-xl hidden lg:block"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;