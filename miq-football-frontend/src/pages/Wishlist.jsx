import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useWishlistStore } from '../store/wishlistStore.js';
import { useCartStore } from '../store/cartStore.js';
import { useAuthStore } from '../store/authStore.js';
import { fetchWishlistApi } from '../services/wishlistService.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import { useLanguageStore } from '../store/languageStore.js';
import EmptyState from '../components/ui/EmptyState.jsx';

const Wishlist = () => {
  const { items, toggle, setItems } = useWishlistStore();
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const t = useLanguageStore((s) => s.t);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlistApi()
        .then((serverItems) => {
          if (serverItems && serverItems.length > 0) setItems(serverItems);
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const handleRemove = (product) => {
    toggle(product);
    toast.success(t('removedFromWishlist'), { duration: 1500 });
  };

  const handleAddToCart = (product) => {
    const availableVariant = product.variants?.find((v) => v.stock > 0);
    if (!availableVariant) {
      toast.error(t('outOfStockWishlist'));
      return;
    }
    addItem(product, availableVariant.size, 1);
    toast.success(t('addedToCart'));
  };

  return (
    <div className="min-h-screen bg-bg-raised py-8">
      <div className="max-w-6xl mx-auto px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Heart className="w-6 h-6 text-red-500 fill-red-500" />
              <h1 className="font-display text-4xl font-bold">{t('wishlistTitle')}</h1>
            </div>
            <p className="text-text-muted">
              {items.length > 0
                ? `${items.length} ${t('products')}`
                : t('wishlistEmpty')}
            </p>
          </div>

          {items.length > 0 && (
            <Link to="/products" className="btn-outline text-sm !py-2 flex items-center gap-2">
              {t('continueShopping')} <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </motion.div>

        {/* Empty state */}
        {items.length === 0 ? (
          <EmptyState
            variant="wishlist"
            action={
              <Link to="/products" className="btn-primary inline-flex items-center gap-2 !py-3">
                {t('exploreShopping')} <ArrowRight className="w-4 h-4" />
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence>
              {items.map((product, i) => {
                const finalPrice = product.salePrice || product.price;
                const inStock = product.variants?.some((v) => v.stock > 0) ?? true;

                return (
                  <motion.div
                    key={product._id}
                    layout
                    initial={{ opacity: 0, y: 24, scale: 0.96 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, amount: 0.15 }}
                    exit={{ opacity: 0, scale: 0.88, transition: { duration: 0.2 } }}
                    transition={{ delay: i * 0.05, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className="bg-bg-elevated rounded-2xl border border-surface-border overflow-hidden group hover:shadow-lg transition-shadow"
                  >
                    <Link to={`/products/${product._id}`} className="block relative">
                      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 aspect-square p-4 relative overflow-hidden">
                        {product.salePrice && (
                          <span className="absolute top-2 left-2 z-10 bg-primary text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
                            SALE
                          </span>
                        )}
                        {!inStock && (
                          <div className="absolute inset-0 bg-bg-elevated/60 flex items-center justify-center z-10">
                            <span className="text-xs font-bold text-text-muted bg-bg-elevated px-3 py-1 rounded-full border border-surface-border">
                              {t('outOfStock')}
                            </span>
                          </div>
                        )}
                        <img
                          src={product.images?.[0]?.url}
                          alt={product.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-400"
                        />
                      </div>
                    </Link>

                    <div className="p-3">
                      <Link to={`/products/${product._id}`}>
                        <h3 className="font-display text-xs font-bold uppercase line-clamp-2 mb-1 hover:text-primary transition">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-[11px] text-text-muted mb-2">{product.brand}</p>

                      <div className="flex items-baseline gap-1.5 mb-3">
                        <span className="text-sm font-bold text-primary">
                          {formatCurrency(finalPrice)}
                        </span>
                        {product.salePrice && (
                          <span className="text-xs text-text-muted line-through">
                            {formatCurrency(product.price)}
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={!inStock}
                          className="flex-1 bg-primary text-white text-xs font-bold uppercase tracking-wide py-2 rounded-lg flex items-center justify-center gap-1.5 hover:bg-primary-dark transition disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          {t('addToCart')}
                        </button>
                        <button
                          onClick={() => handleRemove(product)}
                          className="p-2 border border-surface-border rounded-lg text-red-400 hover:bg-red-50 hover:border-red-200 transition"
                          title={t('removeFromWishlist')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
