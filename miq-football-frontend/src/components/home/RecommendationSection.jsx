import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { Link } from 'react-router-dom';

const RecommendationSection = ({ title = 'RECOMMENDATIONS FOR YOU', products = [] }) => {
  // Mock data với ảnh thật
  const mockProducts = [
    {
      _id: '1',
      name: 'Adidas Predator Elite F50',
      price: 5800000,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
      isNew: true,
    },
    {
      _id: '2',
      name: 'Nike Mercurial Vapor',
      price: 5200000,
      image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&q=80',
      isNew: true,
    },
    {
      _id: '3',
      name: 'Adidas Predator F50',
      price: 6200000,
      image: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=400&q=80',
      isNew: false,
      featured: true,
    },
    {
      _id: '4',
      name: 'Nike Phantom GX',
      price: 5500000,
      image: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=400&q=80',
      isNew: true,
    },
    {
      _id: '5',
      name: 'Puma Future Ultimate',
      price: 4800000,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
      isNew: true,
    },
  ];

  const displayProducts = products.length > 0 ? products : mockProducts;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-3 mb-10"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold">{title}</h2>
          <Zap className="w-7 h-7 text-primary fill-primary" />
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {displayProducts.map((product, i) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -8 }}
              className={`group cursor-pointer ${
                product.featured ? 'ring-2 ring-primary rounded-2xl p-1' : ''
              }`}
            >
              <Link to={`/products/${product._id}`}>
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-4 aspect-square mb-3 relative overflow-hidden border border-primary/20">
                  {product.isNew && (
                    <span className="absolute top-3 left-3 z-10 bg-primary text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full">
                      NEW
                    </span>
                  )}

                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                  />

                  {/* Pedestal shadow */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-3/4 h-2 bg-primary/30 rounded-full blur-sm" />
                </div>

                <h3 className="font-display text-sm font-bold uppercase mb-1 line-clamp-2">
                  {product.name}
                </h3>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-ink">{formatCurrency(product.price)}</span>
                  <button
                    className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-md transition ${
                      product.featured
                        ? 'bg-primary text-white'
                        : 'bg-cream text-ink hover:bg-primary hover:text-white'
                    }`}
                    onClick={(e) => e.preventDefault()}
                  >
                    Add to Cart
                  </button>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecommendationSection;