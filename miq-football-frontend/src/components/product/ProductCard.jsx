import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency.js';

const ProductCard = ({ product, isNew = true }) => {
  // Placeholder fallback nếu chưa có ảnh
  const imageUrl =
    product?.images?.[0]?.url ||
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Crect fill="%2310B981" opacity="0.15" width="200" height="200" rx="20"/%3E%3Ctext x="50%25" y="50%25" font-family="Oswald" font-size="20" font-weight="bold" fill="%2310B981" text-anchor="middle" dy=".3em"%3EMiQ%3C/text%3E%3C/svg%3E';

  const finalPrice = product?.salePrice || product?.price || 0;

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="group relative"
    >
      <Link to={`/products/${product?._id || '#'}`} className="block">
        {/* Pedestal */}
        <div className="pedestal aspect-square p-4 mb-3 relative overflow-hidden">
          {isNew && (
            <span className="absolute top-3 left-3 z-10 bg-primary text-white text-xs font-bold uppercase px-3 py-1 rounded-full">
              NEW
            </span>
          )}

          {/* Glow background */}
          <div className="pedestal-glow opacity-0 group-hover:opacity-70 transition-opacity duration-500" />

          {/* Product image */}
          <motion.img
            src={imageUrl}
            alt={product?.name || 'Product'}
            className="relative z-10 w-full h-full object-contain"
            whileHover={{ scale: 1.1, rotate: -3 }}
            transition={{ type: 'spring', stiffness: 200 }}
          />

          {/* Price badge */}
          <div className="absolute bottom-3 right-3 bg-white text-ink font-bold text-sm px-3 py-1 rounded-full shadow-md">
            {formatCurrency(finalPrice)}
          </div>
        </div>

        {/* Product info */}
        <h3 className="font-display text-sm font-bold uppercase line-clamp-2 mb-1">
          {product?.name || 'Adidas Predator Elite F50'}
        </h3>
        <p className="text-xs text-ink-muted mb-3">{product?.brand || 'Adidas'}</p>

        {/* CTA */}
        <button className="w-full bg-primary text-white text-xs font-bold uppercase tracking-wider py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
          <ShoppingCart className="w-4 h-4" />
          Add to Cart
        </button>
      </Link>
    </motion.div>
  );
};

export default ProductCard;