import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchProducts } from '../../services/productService.js';
import { adminDeleteProduct } from '../../services/adminService.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import ProductForm from '../../components/admin/ProductForm.jsx';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await fetchProducts({ limit: 50 });
      setProducts(data.products);
    } catch (error) {
      toast.error('Không tải được sản phẩm');
    } finally {
      setLoading(false);
    }
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Quản lý sản phẩm</h1>
          <p className="text-ink-muted">{products.length} sản phẩm</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {showForm ? 'Đóng form' : 'Thêm sản phẩm'}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-2xl p-6 mb-6 border border-cream-200 overflow-hidden"
          >
            <h3 className="font-display text-xl font-bold mb-4">Tạo sản phẩm mới</h3>
            <ProductForm
              onSuccess={() => {
                setShowForm(false);
                loadProducts();
              }}
              onCancel={() => setShowForm(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader className="w-10 h-10 text-primary animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-cream-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-cream">
              <tr>
                <th className="text-left p-4 text-sm uppercase font-bold">Sản phẩm</th>
                <th className="text-left p-4 text-sm uppercase font-bold">Brand</th>
                <th className="text-left p-4 text-sm uppercase font-bold">Giá</th>
                <th className="text-left p-4 text-sm uppercase font-bold">Stock</th>
                <th className="text-right p-4 text-sm uppercase font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-t border-cream-200 hover:bg-cream/50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-cream rounded-lg p-1">
                        <img src={p.images?.[0]?.url} alt="" className="w-full h-full object-contain" />
                      </div>
                      <span className="font-semibold line-clamp-1">{p.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm">{p.brand}</td>
                  <td className="p-4 text-sm font-bold text-primary">
                    {formatCurrency(p.salePrice || p.price)}
                  </td>
                  <td className="p-4 text-sm">
                    {p.variants?.reduce((sum, v) => sum + v.stock, 0) || 0}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;