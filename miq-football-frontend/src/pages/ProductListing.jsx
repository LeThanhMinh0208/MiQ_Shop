import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, Search, Frown, ChevronRight, ChevronLeft } from 'lucide-react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchProducts } from '../services/productService.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import { ProductGridSkeleton } from '../components/ui/Skeleton.jsx';
import ProductCard from '../components/product/ProductCard.jsx';
import { useLanguageStore } from '../store/languageStore.js';

const brands = ['Adidas', 'Nike', 'Puma', 'Mizuno', 'Under Armour', 'New Balance'];

const makeSubCategories = (t) => [
  { group: t('kitGroupLabel'), icon: '👕', items: [
    { label: t('allKitsLabel'),   category: 'kits', tag: '' },
    { label: t('clubKits'),       category: 'kits', tag: 'club' },
    { label: t('nationalKits'),   category: 'kits', tag: 'national' },
    { label: t('trainingKits'),   category: 'kits', tag: 'training' },
    { label: t('goalkeeperKits'), category: 'kits', tag: 'goalkeeper' },
  ]},
  { group: t('bootGroupLabel'), icon: '👟', items: [
    { label: t('allBootsLabel'), category: 'boots', tag: '' },
    { label: t('fgLabel'),       category: 'boots', tag: 'firm-ground' },
    { label: t('sgLabel'),       category: 'boots', tag: 'soft-ground' },
    { label: t('agLabel'),       category: 'boots', tag: 'ag' },
    { label: t('indoorLabel'),   category: 'boots', tag: 'indoor' },
  ]},
  { group: t('apparelGroupLabel'), icon: '🩳', items: [
    { label: t('allApparelLabel'), category: 'apparel', tag: '' },
  ]},
  { group: t('accessoriesGroupLabel'), icon: '🧢', items: [
    { label: t('allAccessoriesLabel'), category: 'accessories', tag: '' },
  ]},
];

const makePricePresets = (t) => [
  { label: t('under500k'),    min: '',        max: '500000'  },
  { label: t('range500to1m'), min: '500000',  max: '1000000' },
  { label: t('range1to2m'),   min: '1000000', max: '2000000' },
  { label: t('over2m'),       min: '2000000', max: ''        },
];

const CATEGORY_LABELS = {
  'giay-da-bong':        'Giày Đá Bóng',
  'ao-dau-clb':          'Áo Đấu CLB',
  'trang-phuc-the-thao': 'Trang Phục Thể Thao',
  'phu-kien':            'Phụ Kiện',
  'football-boots':      'Giày Đá Bóng',
  'boots':               'Giày Đá Bóng',
  'kits':                'Áo Đấu CLB',
  'apparel':             'Trang Phục Thể Thao',
  'accessories':         'Phụ Kiện',
};

const getCategoryLabel = (slug) =>
  CATEGORY_LABELS[slug] ||
  CATEGORY_LABELS[slug.toLowerCase()] ||
  slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

// Ellipsis pagination helper
const getPageNumbers = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set(
    [1, total, current - 1, current, current + 1].filter((p) => p >= 1 && p <= total)
  );
  const sorted = [...pages].sort((a, b) => a - b);
  const result = [];
  let prev = null;
  for (const p of sorted) {
    if (prev !== null && p - prev > 1) result.push('…');
    result.push(p);
    prev = p;
  }
  return result;
};

// ── Sidebar filter panel (shared between desktop & mobile drawer) ───────────
const FilterPanel = ({ filters, setFilter, isFetching, isLoading, categoryParam, tagParam, setUrlCategory, subCategories, pricePresets }) => {
  const t = useLanguageStore((s) => s.t);
  const activePreset = pricePresets.findIndex(
    (p) => p.min === filters.minPrice && p.max === filters.maxPrice
  );

  const [openGroup, setOpenGroup] = useState(null);

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Filter className="w-5 h-5 text-primary" />
        <h2 className="font-display text-xl font-bold text-text-primary">{t('filterBy')}</h2>
        {isFetching && !isLoading && (
          <div className="ml-auto w-4 h-4 rounded-full border-2 border-surface-border border-t-primary animate-spin" />
        )}
      </div>

      {/* Sub-categories */}
      <div>
        <h3 className="font-bold text-[10px] uppercase tracking-[0.2em] text-text-muted mb-3">
          {t('category')}
        </h3>

        {/* All products */}
        <button
          onClick={() => setUrlCategory('', '')}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all mb-1 ${
            !categoryParam
              ? 'bg-primary/15 text-primary border border-primary/30'
              : 'text-text-secondary hover:text-primary hover:bg-primary/5 border border-transparent'
          }`}
        >
          <span className="text-base">🛒</span>
          {t('allProducts')}
        </button>

        {subCategories.map((group) => {
          const isGroupActive = categoryParam === group.items[0].category;
          const isOpen = openGroup === group.group || isGroupActive;

          return (
            <div key={group.group} className="mb-1">
              <button
                onClick={() => setOpenGroup(isOpen ? null : group.group)}
                aria-expanded={isOpen}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isGroupActive
                    ? 'bg-primary/8 text-primary'
                    : 'text-text-primary hover:bg-surface'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-base">{group.icon}</span>
                  {group.group}
                </span>
                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="pl-7 pt-1 pb-1 space-y-0.5">
                      {group.items.map((item) => {
                        const isActive = categoryParam === item.category && tagParam === item.tag;
                        return (
                          <button
                            key={item.label}
                            onClick={() => setUrlCategory(item.category, item.tag)}
                            className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              isActive
                                ? 'bg-primary/15 text-primary font-bold'
                                : 'text-text-secondary hover:text-primary hover:bg-primary/5'
                            }`}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Brand */}
      <div>
        <h3 className="font-bold text-[10px] uppercase tracking-[0.2em] text-text-muted mb-3">
          {t('brand')}
        </h3>
        <div className="space-y-1.5">
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input type="radio" name="brand" checked={filters.brand === ''}
              onChange={() => setFilter({ brand: '' })} className="accent-primary" />
            <span className="text-sm text-text-secondary group-hover:text-primary transition">{t('tabAll')}</span>
          </label>
          {brands.map((b) => (
            <label key={b} className="flex items-center gap-2.5 cursor-pointer group">
              <input type="radio" name="brand" checked={filters.brand === b}
                onChange={() => setFilter({ brand: b })} className="accent-primary" />
              <span className="text-sm text-text-secondary group-hover:text-primary transition">{b}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price presets */}
      <div>
        <h3 className="font-bold text-[10px] uppercase tracking-[0.2em] text-text-muted mb-3">
          {t('price')}
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {pricePresets.map((preset, i) => (
            <button
              key={i}
              onClick={() =>
                activePreset === i
                  ? setFilter({ minPrice: '', maxPrice: '' })
                  : setFilter({ minPrice: preset.min, maxPrice: preset.max })
              }
              className={`text-xs font-semibold px-3 py-2 rounded-xl border transition-all duration-150 ${
                activePreset === i
                  ? 'bg-primary/15 border-primary/40 text-primary'
                  : 'bg-bg-raised border-surface-border text-text-muted hover:border-primary/30 hover:text-text-primary'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div>
        <h3 className="font-bold text-[10px] uppercase tracking-[0.2em] text-text-muted mb-3">
          {t('sortBy')}
        </h3>
        <select
          value={filters.sort}
          onChange={(e) => setFilter({ sort: e.target.value })}
          className="w-full px-3 py-2.5 rounded-xl border border-surface-border bg-bg-raised focus:border-primary focus:outline-none text-sm text-text-primary"
        >
          <option value="newest">{t('newest')}</option>
          <option value="price_asc">{t('priceAsc')}</option>
          <option value="price_desc">{t('priceDesc')}</option>
          <option value="rating">{t('topRated')}</option>
        </select>
      </div>
    </div>
  );
};

// ── Main component ─────────────────────────────────────────────────────────
const ProductListing = () => {
  const t = useLanguageStore((s) => s.t);
  const SUB_CATEGORIES = makeSubCategories(t);
  const PRICE_PRESETS  = makePricePresets(t);
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerSwipeX = useRef(null);
  const [filters, setFilters] = useState({
    brand:    searchParams.get('brand') || '',
    minPrice: '',
    maxPrice: '',
    sort:     searchParams.get('sort') || 'newest',
  });

  const searchQuery   = searchParams.get('search')   || '';
  const categoryParam = searchParams.get('category') || '';
  const tagParam      = searchParams.get('tag')      || '';
  const saleParam     = searchParams.get('sale')     || '';
  const brandParam    = searchParams.get('brand')    || '';
  const sortParam     = searchParams.get('sort')     || '';

  // Sync URL params → local filter state when URL changes (e.g. from Navbar dropdown)
  useEffect(() => {
    setFilters((f) => ({
      ...f,
      brand: brandParam,           // always sync — clears brand when nav dropdown is clicked
      sort:  sortParam || f.sort,
    }));
  }, [brandParam, sortParam]);

  useEffect(() => { setPage(1); }, [searchQuery, categoryParam, tagParam, saleParam]);

  // Close drawer on desktop resize
  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 1024) setDrawerOpen(false); };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const queryParams = {
    page,
    limit: 12,
    sort: filters.sort,
    ...(searchQuery    && { search:    searchQuery }),
    ...(categoryParam  && { category:  categoryParam }),
    ...(tagParam       && { tag:       tagParam }),
    ...(saleParam      && { sale:      saleParam }),
    ...(filters.brand  && { brand:     filters.brand }),
    ...(filters.minPrice && { minPrice: filters.minPrice }),
    ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
  };

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['products', queryParams],
    queryFn: () => fetchProducts(queryParams),
    placeholderData: keepPreviousData,
  });

  const products   = data?.products   ?? [];
  const pagination = data?.pagination ?? { page: 1, total: 0, pages: 1 };

  const setFilter = (patch) => {
    setFilters((f) => ({ ...f, ...patch }));
    setPage(1);
  };

  const clearSearch    = () => { const n = new URLSearchParams(searchParams); n.delete('search');   setSearchParams(n); setPage(1); };
  const clearCategory  = () => { const n = new URLSearchParams(searchParams); n.delete('category'); n.delete('tag'); setSearchParams(n); setPage(1); };
  const clearTag       = () => { const n = new URLSearchParams(searchParams); n.delete('tag');      setSearchParams(n); setPage(1); };
  const clearSale      = () => { const n = new URLSearchParams(searchParams); n.delete('sale');     setSearchParams(n); setPage(1); };
  const clearAllFilters = () => { setSearchParams({}); setFilters({ brand: '', minPrice: '', maxPrice: '', sort: 'newest' }); setPage(1); };
  const setUrlCategory = (category, tag) => {
    const n = new URLSearchParams(searchParams);
    if (category) { n.set('category', category); } else { n.delete('category'); }
    if (tag)      { n.set('tag', tag);            } else { n.delete('tag'); }
    n.delete('sale');
    setSearchParams(n);
    setPage(1);
  };

  const hasActiveFilters = searchQuery || categoryParam || tagParam || saleParam || filters.brand || filters.minPrice || filters.maxPrice;
  const activeFilterCount = [searchQuery, categoryParam, tagParam, saleParam, filters.brand, filters.minPrice, filters.maxPrice].filter(Boolean).length;
  const categoryLabel = categoryParam ? getCategoryLabel(categoryParam) : '';
  const pageNumbers = getPageNumbers(page, pagination.pages);

  return (
    <div className="min-h-screen bg-bg-base py-8">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-20">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-text-muted mb-6">
          <Link to="/" className="hover:text-primary transition-colors font-medium">{t('home')}</Link>
          <ChevronRight className="w-3 h-3 flex-shrink-0" />
          {categoryParam ? (
            <>
              <Link to="/products" className="hover:text-primary transition-colors font-medium">{t('products')}</Link>
              <ChevronRight className="w-3 h-3 flex-shrink-0" />
              <span className="text-text-secondary font-semibold">{categoryLabel}</span>
            </>
          ) : searchQuery ? (
            <>
              <Link to="/products" className="hover:text-primary transition-colors font-medium">{t('products')}</Link>
              <ChevronRight className="w-3 h-3 flex-shrink-0" />
              <span className="text-text-secondary font-semibold">"{searchQuery}"</span>
            </>
          ) : (
            <span className="text-text-secondary font-semibold">{t('allProducts')}</span>
          )}
        </nav>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              {searchQuery ? (
                <div className="flex items-center gap-3 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Search className="w-5 h-5 text-primary" />
                      <h1 className="font-display text-3xl md:text-4xl font-bold text-text-primary">{t('viewAllResults')}</h1>
                    </div>
                    <p className="text-text-muted">
                      <span className="font-bold text-text-primary">{pagination.total}</span> {t('products')}:{' '}
                      <span className="font-bold text-primary">"{searchQuery}"</span>
                    </p>
                  </div>
                  <button
                    onClick={clearSearch}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-surface border border-surface-border rounded-full text-sm font-medium text-text-secondary hover:border-primary hover:text-primary transition"
                  >
                    <X className="w-3.5 h-3.5" /> Xóa tìm kiếm
                  </button>
                </div>
              ) : categoryParam ? (
                <div>
                  <h1 className="font-display text-4xl md:text-5xl font-bold mb-1 text-text-primary">{categoryLabel}</h1>
                  <p className="text-text-muted">{pagination.total} {t('products')}</p>
                </div>
              ) : (
                <div>
                  <h1 className="font-display text-4xl md:text-5xl font-bold mb-1 text-text-primary">{t('allProducts')}</h1>
                  <p className="text-text-muted">{pagination.total} {t('products')}</p>
                </div>
              )}
            </div>

            {/* Mobile filter button */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-surface border border-surface-border rounded-xl text-sm font-semibold text-text-primary hover:border-primary/40 transition"
            >
              <Filter className="w-4 h-4 text-primary" />
              {t('filterLabel')}
            </button>
          </div>

          {/* Active filter pills */}
          <AnimatePresence>
            {hasActiveFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 mt-3 flex-wrap"
              >
                <span className="text-xs font-semibold text-text-muted uppercase">{t('filterBy')}:</span>
                {categoryParam && (
                  <span className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                    {categoryLabel}
                    <button onClick={clearCategory} aria-label="Xoá bộ lọc danh mục"><X className="w-3 h-3" /></button>
                  </span>
                )}
                {tagParam && (
                  <span className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                    #{tagParam}
                    <button onClick={clearTag}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {saleParam && (
                  <span className="flex items-center gap-1 text-xs bg-red-500/15 text-red-400 px-3 py-1 rounded-full font-medium">
                    Flash Sale
                    <button onClick={clearSale}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {filters.brand && (
                  <span className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                    {filters.brand}
                    <button onClick={() => setFilter({ brand: '' })}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {(filters.minPrice || filters.maxPrice) && (
                  <span className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                    {filters.minPrice ? formatCurrency(filters.minPrice) : '0'} – {filters.maxPrice ? formatCurrency(filters.maxPrice) : '∞'}
                    <button onClick={() => setFilter({ minPrice: '', maxPrice: '' })}><X className="w-3 h-3" /></button>
                  </span>
                )}
                <button
                  onClick={clearAllFilters}
                  className="flex items-center gap-1 text-xs bg-red-500/10 border border-red-500/25 text-red-400 hover:bg-red-500/20 px-3 py-1 rounded-full font-semibold transition"
                >
                  <X className="w-3 h-3" /> Xóa tất cả bộ lọc
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="grid lg:grid-cols-[260px_1fr] gap-8">

          {/* Desktop sidebar */}
          <aside className="hidden lg:block bg-surface rounded-2xl p-6 h-fit sticky top-24 border border-surface-border">
            <FilterPanel filters={filters} setFilter={setFilter} isFetching={isFetching} isLoading={isLoading} categoryParam={categoryParam} tagParam={tagParam} setUrlCategory={setUrlCategory} subCategories={SUB_CATEGORIES} pricePresets={PRICE_PRESETS} />
          </aside>

          {/* Products Grid */}
          <main>
            {isLoading ? (
              <ProductGridSkeleton count={12} />
            ) : products.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-24 text-center"
              >
                <div className="w-20 h-20 rounded-2xl bg-surface border border-surface-border flex items-center justify-center mb-5">
                  <Frown className="w-10 h-10 text-text-muted/50" />
                </div>
                <p className="font-display text-2xl font-bold text-text-primary mb-2">{t('noProducts')}</p>
                <p className="text-text-muted text-sm mb-2 max-w-xs">
                  {searchQuery
                    ? <><span>{t('noProducts')} </span><span className="font-bold text-text-primary">"{searchQuery}"</span></>
                    : t('noProducts')}
                </p>
                {searchQuery && (
                  <p className="text-xs text-text-muted mb-5">
                    Gợi ý:{' '}
                    {['Nike', 'Adidas', 'Puma'].map((s, i) => (
                      <span key={s}>
                        <button className="text-primary underline"
                          onClick={() => setSearchParams({ search: s })}>{s}</button>
                        {i < 2 && ', '}
                      </span>
                    ))}
                  </p>
                )}
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <button onClick={clearAllFilters} className="btn-outline text-sm !py-2">
                    Xóa tất cả bộ lọc
                  </button>
                  <Link to="/products" className="btn-primary text-sm !py-2" onClick={() => setSearchParams({})}>
                    Xem tất cả sản phẩm
                  </Link>
                </div>
              </motion.div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 gap-y-8">
                  {products.map((product, i) => (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.04, 0.28) }}
                    >
                      <ProductCard
                        product={product}
                        isNew={product.createdAt && (Date.now() - new Date(product.createdAt).getTime()) < 30 * 24 * 60 * 60 * 1000}
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Ellipsis Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex justify-center items-center gap-1.5 mt-10">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="w-9 h-9 rounded-lg flex items-center justify-center border border-surface-border text-text-muted hover:border-primary/40 hover:text-primary transition disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Trang trước"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {pageNumbers.map((p, i) =>
                      p === '…' ? (
                        <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-text-muted text-sm select-none">
                          …
                        </span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`w-9 h-9 rounded-lg font-semibold text-sm transition ${
                            page === p
                              ? 'bg-primary text-white shadow-neon'
                              : 'bg-surface text-text-secondary border border-surface-border hover:border-primary/40 hover:text-primary'
                          }`}
                        >
                          {p}
                        </button>
                      )
                    )}

                    <button
                      onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                      disabled={page === pagination.pages}
                      className="w-9 h-9 rounded-lg flex items-center justify-center border border-surface-border text-text-muted hover:border-primary/40 hover:text-primary transition disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Trang sau"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Overlay */}
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            {/* Panel — swipe left to dismiss */}
            <motion.div
              key="drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-bg-elevated border-r border-surface-border p-6 overflow-y-auto lg:hidden"
              onTouchStart={(e) => { drawerSwipeX.current = e.touches[0].clientX; }}
              onTouchEnd={(e) => {
                const dx = e.changedTouches[0].clientX - (drawerSwipeX.current ?? 0);
                if (dx < -60) setDrawerOpen(false);
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <span className="font-display text-lg font-bold text-text-primary">{t('filterBy')}</span>
                <button
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Đóng bộ lọc"
                  className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-surface transition text-text-muted hover:text-text-primary"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <FilterPanel filters={filters} setFilter={setFilter} isFetching={isFetching} isLoading={isLoading} categoryParam={categoryParam} tagParam={tagParam} setUrlCategory={setUrlCategory} subCategories={SUB_CATEGORIES} pricePresets={PRICE_PRESETS} />
              <button
                onClick={() => setDrawerOpen(false)}
                className="mt-8 w-full py-3 bg-primary hover:bg-emerald-400 text-white font-bold rounded-xl transition"
              >
                Áp dụng{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductListing;
