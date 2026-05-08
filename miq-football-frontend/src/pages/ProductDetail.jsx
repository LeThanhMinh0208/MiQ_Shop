import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Loader, ShoppingCart, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchProductById, fetchBoughtTogether } from '../services/productService.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import { useCartStore } from '../store/cartStore.js';
import ProductCustomizer from '../components/product/ProductCustomizer.jsx';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [boughtTogether, setBoughtTogether] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [customizer, setCustomizer] = useState({ name: '', number: '' });

  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const data = await fetchProductById(id);
      setProduct(data);
      const recs = await fetchBoughtTogether(id).catch(() => []);
      setBoughtTogether(recs);
    } catch (error) {
      toast.error('Không tải được sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Vui lòng chọn size');
      return;
    }
    addItem(product, selectedSize, 1);
    toast.success('Đã thêm vào giỏ hàng!');
  };

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <Loader className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!product) return <div className="text-center py-20">Không tìm thấy sản phẩm</div>;

  const finalPrice = product.salePrice || product.price;

  return (
    <div className="min-h-screen bg-cream py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-10">
          {/* LEFT: Images */}
          <div className="space-y-4">
            <motion.div
              key={activeImage}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-3xl aspect-square p-12 relative overflow-hidden border border-primary/20"
            >
              {/* Energy ring effect */}
              <motion.div
                className="absolute inset-12 rounded-full border-2 border-primary/30 border-dashed"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              />
              <img
                src={product.images?.[activeImage]?.url}
                alt={product.name}
                className="relative z-10 w-full h-full object-contain drop-shadow-2xl"
              />
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-3/4 h-3 bg-primary/30 rounded-full blur-md" />
            </motion.div>

            {product.images?.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`bg-cream rounded-xl aspect-square p-3 border-2 transition ${
                      activeImage === i ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Info */}
          <div>
            <p className="text-sm text-primary font-bold uppercase mb-2">{product.brand}</p>
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${
                      s <= Math.round(product.ratings.average)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-cream-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-bold">{product.ratings.average}</span>
              <span className="text-sm text-ink-muted">({product.ratings.count} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-primary">{formatCurrency(finalPrice)}</span>
              {product.salePrice && (
                <span className="text-xl text-ink-muted line-through">
                  {formatCurrency(product.price)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-ink-light mb-6 leading-relaxed">{product.description}</p>

            {/* Sizes */}
            <div className="mb-6">
              <h3 className="font-bold uppercase text-sm mb-3">Chọn kích thước</h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.size}
                    onClick={() => setSelectedSize(v.size)}
                    disabled={v.stock === 0}
                    className={`min-w-[50px] py-2 px-4 rounded-lg border-2 font-semibold transition ${
                      selectedSize === v.size
                        ? 'border-primary bg-primary text-white'
                        : 'border-cream-200 hover:border-primary'
                    } ${v.stock === 0 ? 'opacity-30 cursor-not-allowed line-through' : ''}`}
                  >
                    {v.size}
                  </button>
                ))}
              </div>
            </div>

            {/* Customizer */}
            <div className="mb-6">
              <ProductCustomizer
                name={customizer.name}
                number={customizer.number}
                onChange={setCustomizer}
              />
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-primary text-white font-bold uppercase tracking-wider py-4 rounded-xl shadow-lg shadow-primary/40 hover:bg-primary-dark transition flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Thêm vào giỏ
              </button>
              <button className="px-6 border-2 border-ink hover:bg-ink hover:text-white font-bold uppercase tracking-wider rounded-xl transition">
                Mua ngay
              </button>
            </div>
          </div>
        </div>

        {/* COMPLETE YOUR LOOK - Apriori Recommendations */}
        {boughtTogether.length > 0 && (
          <section className="mt-20">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="font-display text-2xl md:text-3xl font-bold">COMPLETE YOUR LOOK</h2>
              <Zap className="w-6 h-6 text-primary fill-primary" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {boughtTogether.map((p) => (
                <Link
                  to={`/products/${p._id}`}
                  key={p._id}
                  className="group block bg-white rounded-2xl p-3 border border-cream-200 hover:shadow-pedestal transition"
                >
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 aspect-square rounded-xl p-3 mb-2">
                    <img src={p.images?.[0]?.url} alt={p.name} className="w-full h-full object-contain" />
                  </div>
                  <h4 className="text-xs font-bold uppercase line-clamp-2">{p.name}</h4>
                  <p className="text-sm font-bold text-primary mt-1">
                    {formatCurrency(p.salePrice || p.price)}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;