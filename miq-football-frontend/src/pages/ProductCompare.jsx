import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart2, X, Star, ShoppingCart } from 'lucide-react';
import { useCompareStore } from '../store/compareStore.js';
import { useCartStore } from '../store/cartStore.js';
import { useLanguageStore } from '../store/languageStore.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import toast from 'react-hot-toast';

const FIELDS = [
  { labelKey: 'brand',    get: (p) => p.brand },
  { labelKey: 'price',    get: (p) => formatCurrency(p.salePrice || p.price) },
  { labelKey: 'rating',   get: (p) => p.ratings?.average ? `${p.ratings.average.toFixed(1)} ⭐ (${p.ratings.count})` : '—' },
  { labelKey: 'instock',  get: (p) => {
    const total = p.variants?.reduce((s, v) => s + v.stock, 0) ?? 0;
    return total > 0 ? `${total} units` : '—';
  }},
  { label: 'Sizes', get: (p) => p.variants?.map((v) => v.size).join(', ') || '—' },
];

const ProductCompare = () => {
  const { products, remove, clear } = useCompareStore();
  const addItem = useCartStore((s) => s.addItem);
  const t = useLanguageStore((s) => s.t);

  const handleAddToCart = (product) => {
    const firstInStock = product.variants?.find((v) => v.stock > 0);
    if (!firstInStock) { toast.error(t('outOfStockToast')); return; }
    addItem(product, firstInStock.size, 1);
    toast.success(t('addedToCart'));
  };

  if (products.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 py-20">
        <BarChart2 className="w-16 h-16 text-primary/30" />
        <h1 className="font-display text-3xl font-bold text-text-primary">{t('compareTitle')}</h1>
        <p className="text-text-muted">{t('compareEmpty')}</p>
        <Link to="/products" className="btn-primary">{t('allProducts')}</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base py-10">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-10"
        >
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-text-primary">{t('compareTitle')}</h1>
            <p className="text-text-muted text-sm mt-1">{t('compareHint')}</p>
          </div>
          <button onClick={clear} className="text-sm text-red-400 hover:text-red-500 transition font-semibold">
            {t('clearCompare')}
          </button>
        </motion.div>

        <div className={`grid gap-6 ${products.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-1 max-w-sm mx-auto'}`}>
          {/* Product cards */}
          {products.map((product, i) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-bg-elevated rounded-3xl border border-surface-border overflow-hidden"
            >
              {/* Image */}
              <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 p-8 aspect-square flex items-center justify-center">
                <button
                  onClick={() => remove(product._id)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-bg-elevated border border-surface-border flex items-center justify-center text-text-muted hover:text-red-400 transition"
                >
                  <X className="w-4 h-4" />
                </button>
                <Link to={`/products/${product._id}`}>
                  <img
                    src={product.images?.[0]?.url}
                    alt={product.name}
                    className="max-h-56 object-contain hover:scale-105 transition-transform duration-300"
                  />
                </Link>
              </div>

              {/* Name + price */}
              <div className="p-6 border-b border-surface-border">
                <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">{product.brand}</p>
                <Link to={`/products/${product._id}`}>
                  <h2 className="font-display text-lg font-bold text-text-primary hover:text-primary transition line-clamp-2">
                    {product.name}
                  </h2>
                </Link>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl font-bold text-primary">{formatCurrency(product.salePrice || product.price)}</span>
                  {product.salePrice && (
                    <span className="text-sm text-text-muted line-through">{formatCurrency(product.price)}</span>
                  )}
                </div>
                {product.ratings?.count > 0 && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="flex">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(product.ratings.average) ? 'fill-amber-400 text-amber-400' : 'text-surface-border'}`} />
                      ))}
                    </div>
                    <span className="text-xs text-text-muted">({product.ratings.count})</span>
                  </div>
                )}
              </div>

              {/* Spec rows */}
              <div className="divide-y divide-surface-border">
                {FIELDS.map(({ labelKey, label, get: getValue }) => (
                  <div key={labelKey || label} className="flex items-start justify-between px-6 py-3 gap-4">
                    <span className="text-xs font-bold text-text-muted uppercase tracking-wide flex-shrink-0">
                      {labelKey ? t(labelKey) : label}
                    </span>
                    <span className="text-sm font-semibold text-text-primary text-right">{getValue(product)}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="p-6">
                <button
                  onClick={() => handleAddToCart(product)}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  {t('addToCart')}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductCompare;
