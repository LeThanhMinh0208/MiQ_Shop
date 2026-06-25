import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, Pencil, Search, ChevronUp, ChevronDown,
  CheckSquare, Square, EyeOff, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { TableSkeleton } from '../../components/ui/Skeleton.jsx';
import toast from 'react-hot-toast';
import { fetchProducts } from '../../services/productService.js';
import { adminDeleteProduct, adminUpdateProduct, adminGetCategories } from '../../services/adminService.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import ProductForm from '../../components/admin/ProductForm.jsx';

const PER_PAGE = 10;

const ProductManagement = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Sort
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');

  // Pagination
  const [page, setPage] = useState(1);

  // Bulk
  const [selected, setSelected] = useState(new Set());

  useEffect(() => {
    loadProducts();
    adminGetCategories().then(setCategories).catch(console.error);
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await fetchProducts({ limit: 200 });
      setAllProducts(data.products);
    } catch {
      toast.error('Không tải được sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const brands = useMemo(() => [...new Set(allProducts.map((p) => p.brand))].sort(), [allProducts]);

  const filtered = useMemo(() => {
    let list = [...allProducts];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    if (filterBrand) list = list.filter((p) => p.brand === filterBrand);
    if (filterCategory) list = list.filter((p) => {
      const catId = p.category?._id || p.category;
      return catId === filterCategory;
    });
    if (filterStatus === 'active') list = list.filter((p) => p.isActive);
    else if (filterStatus === 'inactive') list = list.filter((p) => !p.isActive);

    list.sort((a, b) => {
      let av = a[sortKey], bv = b[sortKey];
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [allProducts, search, filterBrand, filterCategory, filterStatus, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const SortIcon = ({ k }) => {
    if (sortKey !== k) return <ChevronUp className="w-3 h-3 opacity-30" />;
    return sortDir === 'asc'
      ? <ChevronUp className="w-3 h-3 text-primary" />
      : <ChevronDown className="w-3 h-3 text-primary" />;
  };

  const toggleSelectAll = () => {
    if (selected.size === paginated.length) setSelected(new Set());
    else setSelected(new Set(paginated.map((p) => p._id)));
  };

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn chắc chắn muốn xóa sản phẩm này?')) return;
    try {
      await adminDeleteProduct(id);
      toast.success('Đã xóa sản phẩm');
      loadProducts();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Xóa ${selected.size} sản phẩm đã chọn?`)) return;
    try {
      await Promise.all([...selected].map((id) => adminDeleteProduct(id)));
      toast.success(`Đã xóa ${selected.size} sản phẩm`);
      setSelected(new Set());
      loadProducts();
    } catch {
      toast.error('Xóa thất bại');
    }
  };

  const handleBulkHide = async () => {
    if (!confirm(`Ẩn ${selected.size} sản phẩm đã chọn?`)) return;
    try {
      await Promise.all([...selected].map((id) => adminUpdateProduct(id, { isActive: false })));
      toast.success(`Đã ẩn ${selected.size} sản phẩm`);
      setSelected(new Set());
      loadProducts();
    } catch {
      toast.error('Thao tác thất bại');
    }
  };

  const openEdit = (product) => {
    setEditProduct(product);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditProduct(null);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Quản lý sản phẩm</h1>
          <p className="text-text-muted">{filtered.length}/{allProducts.length} sản phẩm</p>
        </div>
        <button
          onClick={() => { setEditProduct(null); setShowForm(!showForm); }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {showForm && !editProduct ? 'Đóng form' : 'Thêm sản phẩm'}
        </button>
      </div>

      {/* Form Panel */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-bg-elevated rounded-2xl p-6 mb-6 border border-surface-border overflow-hidden"
          >
            <h3 className="font-display text-xl font-bold mb-4">
              {editProduct ? `Chỉnh sửa: ${editProduct.name}` : 'Tạo sản phẩm mới'}
            </h3>
            <ProductForm
              initialData={editProduct}
              onSuccess={() => { closeForm(); loadProducts(); }}
              onCancel={closeForm}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="bg-bg-elevated rounded-2xl border border-surface-border p-4 mb-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            placeholder="Tìm sản phẩm..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-surface-border bg-bg-raised text-text-primary focus:border-primary focus:outline-none text-sm"
          />
        </div>
        <select
          value={filterBrand}
          onChange={(e) => { setFilterBrand(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg border border-surface-border bg-bg-raised text-text-primary focus:border-primary focus:outline-none text-sm"
        >
          <option value="">Tất cả brand</option>
          {brands.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
        <select
          value={filterCategory}
          onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg border border-surface-border bg-bg-raised text-text-primary focus:border-primary focus:outline-none text-sm"
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg border border-surface-border bg-bg-raised text-text-primary focus:border-primary focus:outline-none text-sm"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hiện</option>
          <option value="inactive">Đã ẩn</option>
        </select>
      </div>

      {/* Bulk Action Bar */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-primary/10 border border-primary/30 rounded-xl px-4 py-3 mb-4 flex items-center gap-4"
          >
            <span className="font-bold text-sm text-primary">Đã chọn {selected.size} sản phẩm</span>
            <button
              onClick={handleBulkHide}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700 text-sm font-semibold hover:bg-amber-200 transition"
            >
              <EyeOff className="w-4 h-4" />
              Ẩn
            </button>
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-100 text-red-600 text-sm font-semibold hover:bg-red-200 transition"
            >
              <Trash2 className="w-4 h-4" />
              Xóa
            </button>
            <button
              onClick={() => setSelected(new Set())}
              className="ml-auto text-sm text-text-muted hover:text-text-primary transition"
            >
              Bỏ chọn
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <TableSkeleton rows={8} cols={6} />
      ) : (
        <>
          <div className="bg-bg-elevated rounded-2xl border border-surface-border overflow-hidden">
            <table className="w-full">
              <thead className="bg-bg-raised">
                <tr>
                  <th className="p-4 w-10">
                    <button onClick={toggleSelectAll} className="text-text-muted hover:text-text-primary transition">
                      {selected.size === paginated.length && paginated.length > 0
                        ? <CheckSquare className="w-4 h-4 text-primary" />
                        : <Square className="w-4 h-4" />}
                    </button>
                  </th>
                  <th
                    className="text-left p-4 text-sm uppercase font-bold cursor-pointer select-none"
                    onClick={() => handleSort('name')}
                  >
                    <span className="flex items-center gap-1">Sản phẩm <SortIcon k="name" /></span>
                  </th>
                  <th className="text-left p-4 text-sm uppercase font-bold">Brand</th>
                  <th
                    className="text-left p-4 text-sm uppercase font-bold cursor-pointer select-none"
                    onClick={() => handleSort('price')}
                  >
                    <span className="flex items-center gap-1">Giá <SortIcon k="price" /></span>
                  </th>
                  <th className="text-left p-4 text-sm uppercase font-bold">Stock</th>
                  <th className="text-left p-4 text-sm uppercase font-bold">Trạng thái</th>
                  <th className="text-right p-4 text-sm uppercase font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((p) => (
                  <tr
                    key={p._id}
                    className={`border-t border-surface-border hover:bg-bg-raised/50 ${selected.has(p._id) ? 'bg-primary/5' : ''}`}
                  >
                    <td className="p-4">
                      <button onClick={() => toggleSelect(p._id)} className="text-text-muted hover:text-text-primary transition">
                        {selected.has(p._id)
                          ? <CheckSquare className="w-4 h-4 text-primary" />
                          : <Square className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-bg-raised rounded-lg p-1 flex-shrink-0">
                          <img src={p.images?.[0]?.url} alt="" loading="lazy" decoding="async" className="w-full h-full object-contain" />
                        </div>
                        <span className="font-semibold line-clamp-1 text-sm">{p.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm">{p.brand}</td>
                    <td className="p-4 text-sm font-bold text-primary">
                      {formatCurrency(p.salePrice || p.price)}
                    </td>
                    <td className="p-4 text-sm">
                      {p.variants?.reduce((sum, v) => sum + v.stock, 0) || 0}
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                        p.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
                      }`}>
                        {p.isActive ? 'Hiện' : 'Ẩn'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(p)}
                          className="text-primary hover:bg-primary/10 p-2 rounded-lg transition"
                          title="Chỉnh sửa"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginated.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-text-muted">
                      Không tìm thấy sản phẩm nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-2 rounded-lg border border-surface-border disabled:opacity-30 hover:border-primary transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-9 h-9 rounded-lg text-sm font-bold transition ${
                    n === page
                      ? 'bg-primary text-white'
                      : 'border border-surface-border hover:border-primary'
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-2 rounded-lg border border-surface-border disabled:opacity-30 hover:border-primary transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductManagement;
