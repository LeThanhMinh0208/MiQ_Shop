import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Filter, Loader } from 'lucide-react';
import { fetchProducts } from '../services/productService.js';
import { formatCurrency } from '../utils/formatCurrency.js';

const ProductListing = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    brand: searchParams.get('brand') || '',
    minPrice: '',
    maxPrice: '',
    sort: 'newest',
  });
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });

  const brands = ['Adidas', 'Nike', 'Puma', 'Mizuno', 'Under Armour', 'New Balance'];

  useEffect(() => {
    loadProducts();
  }, [filters, pagination.page]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: 12,
        ...(filters.brand && { brand: filters.brand }),
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
        sort: filters.sort,
      };
      const data = await fetchProducts(params);
      setProducts(data.products);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Lỗi load products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-2">All Products</h1>
          <p className="text-ink-muted">{pagination.total} sản phẩm</p>
        </motion.div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          {/* Sidebar Filters */}
          <aside className="bg-white rounded-2xl p-6 h-fit sticky top-24 shadow-sm border border-cream-200">
            <div className="flex items-center gap-2 mb-6">
              <Filter className="w-5 h-5 text-primary" />
              <h2 className="font-display text-xl font-bold">FILTER</h2>
            </div>

            {/* Brand */}
            <div className="mb-6">
              <h3 className="font-bold text-sm uppercase mb-3">Brand</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="brand"
                    checked={filters.brand === ''}
                    onChange={() => setFilters({ ...filters, brand: '' })}
                    className="accent-primary"
                  />
                  <span className="text-sm">Tất cả</span>
                </label>
                {brands.map((b) => (
                  <label key={b} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="brand"
                      checked={filters.brand === b}
                      onChange={() => setFilters({ ...filters, brand: b })}
                      className="accent-primary"
                    />
                    <span className="text-sm">{b}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="mb-6">
              <h3 className="font-bold text-sm uppercase mb-3">Khoảng giá (VND)</h3>
              <div className="space-y-2">
                <input
                  type="number"
                  placeholder="Từ"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-cream-200 focus:border-primary focus:outline-none text-sm"
                />
                <input
                  type="number"
                  placeholder="Đến"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-cream-200 focus:border-primary focus:outline-none text-sm"
                />
              </div>
            </div>

            {/* Sort */}
            <div>
              <h3 className="font-bold text-sm uppercase mb-3">Sắp xếp</h3>
              <select
                value={filters.sort}
                onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-cream-200 focus:border-primary focus:outline-none text-sm"
              >
                <option value="newest">Mới nhất</option>
                <option value="price_asc">Giá tăng dần</option>
                <option value="price_desc">Giá giảm dần</option>
                <option value="rating">Đánh giá cao</option>
              </select>
            </div>
          </aside>

          {/* Products Grid */}
          <main>
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader className="w-10 h-10 text-primary animate-spin" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 text-ink-muted">Không có sản phẩm nào</div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {products.map((product, i) => (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ y: -8 }}
                    >
                      <Link to={`/products/${product._id}`} className="group block">
                        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-4 aspect-square mb-3 relative overflow-hidden border border-primary/20">
                          {product.salePrice && (
                            <span className="absolute top-3 left-3 z-10 bg-primary text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full">
                              SALE
                            </span>
                          )}
                          <img
                            src={product.images?.[0]?.url}
                            alt={product.name}
                            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-3/4 h-2 bg-primary/30 rounded-full blur-sm" />
                        </div>

                        <h3 className="font-display text-sm font-bold uppercase line-clamp-2 mb-1">
                          {product.name}
                        </h3>
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-bold text-ink">
                            {formatCurrency(product.salePrice || product.price)}
                          </span>
                          {product.salePrice && (
                            <span className="text-xs text-ink-muted line-through">
                              {formatCurrency(product.price)}
                            </span>
                          )}
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex justify-center gap-2 mt-10">
                    {Array.from({ length: pagination.pages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPagination({ ...pagination, page: i + 1 })}
                        className={`w-10 h-10 rounded-lg font-semibold transition ${
                          pagination.page === i + 1
                            ? 'bg-primary text-white'
                            : 'bg-white text-ink hover:bg-cream'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProductListing;