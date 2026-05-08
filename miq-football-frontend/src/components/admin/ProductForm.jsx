import { useState, useEffect } from 'react';
import { Upload, X, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminGetCategories } from '../../services/adminService.js';
import { adminCreateProduct } from '../../services/adminService.js';

const ProductForm = ({ onSuccess, onCancel }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    brand: 'Adidas',
    category: '',
    price: '',
    salePrice: '',
    sizes: '39,40,41,42,43',
    tags: 'firm-ground,fg',
  });

  useEffect(() => {
    adminGetCategories().then(setCategories).catch(console.error);
  }, []);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    setImageFiles(files);
    setImagePreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (imageFiles.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 ảnh');
      return;
    }

    setLoading(true);
    try {
      // Tạo FormData để upload ảnh
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('brand', form.brand);
      formData.append('category', form.category);
      formData.append('price', form.price);
      if (form.salePrice) formData.append('salePrice', form.salePrice);

      // Variants từ sizes string
      const sizes = form.sizes.split(',').map((s) => s.trim()).filter(Boolean);
      const variants = sizes.map((size) => ({ size, stock: 20 }));
      formData.append('variants', JSON.stringify(variants));

      // Tags
      const tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean);
      formData.append('tags', JSON.stringify(tags));

      // Append images
      imageFiles.forEach((file) => formData.append('images', file));

      await adminCreateProduct(formData);
      toast.success('Tạo sản phẩm thành công!');
      onSuccess?.();
    } catch (error) {
      toast.error(error.message || 'Tạo sản phẩm thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Images Upload */}
      <div>
        <label className="font-bold text-sm uppercase mb-2 block">Ảnh sản phẩm (tối đa 5)</label>
        <div className="border-2 border-dashed border-cream-200 rounded-xl p-6 text-center hover:border-primary transition cursor-pointer relative">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <Upload className="w-10 h-10 text-primary mx-auto mb-2" />
          <p className="text-sm text-ink-muted">Click để chọn ảnh hoặc kéo thả vào đây</p>
        </div>

        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-5 gap-2 mt-3">
            {imagePreviews.map((src, i) => (
              <div key={i} className="relative aspect-square bg-cream rounded-lg overflow-hidden">
                <img src={src} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <input
          required
          placeholder="Tên sản phẩm"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="px-4 py-3 rounded-lg border border-cream-200 focus:border-primary focus:outline-none"
        />
        <select
          required
          value={form.brand}
          onChange={(e) => setForm({ ...form, brand: e.target.value })}
          className="px-4 py-3 rounded-lg border border-cream-200 focus:border-primary focus:outline-none"
        >
          {['Adidas', 'Nike', 'Puma', 'Mizuno', 'Under Armour', 'New Balance'].map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>

      <select
        required
        value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value })}
        className="w-full px-4 py-3 rounded-lg border border-cream-200 focus:border-primary focus:outline-none"
      >
        <option value="">-- Chọn danh mục --</option>
        {categories.map((c) => (
          <option key={c._id} value={c._id}>{c.name}</option>
        ))}
      </select>

      <textarea
        required
        rows={3}
        placeholder="Mô tả sản phẩm"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        className="w-full px-4 py-3 rounded-lg border border-cream-200 focus:border-primary focus:outline-none resize-none"
      />

      <div className="grid grid-cols-2 gap-4">
        <input
          required
          type="number"
          placeholder="Giá gốc (VND)"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="px-4 py-3 rounded-lg border border-cream-200 focus:border-primary focus:outline-none"
        />
        <input
          type="number"
          placeholder="Giá sale (tuỳ chọn)"
          value={form.salePrice}
          onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
          className="px-4 py-3 rounded-lg border border-cream-200 focus:border-primary focus:outline-none"
        />
      </div>

      <input
        placeholder="Sizes (cách nhau dấu phẩy: 39,40,41)"
        value={form.sizes}
        onChange={(e) => setForm({ ...form, sizes: e.target.value })}
        className="w-full px-4 py-3 rounded-lg border border-cream-200 focus:border-primary focus:outline-none"
      />

      <input
        placeholder="Tags (firm-ground, fg, pro)"
        value={form.tags}
        onChange={(e) => setForm({ ...form, tags: e.target.value })}
        className="w-full px-4 py-3 rounded-lg border border-cream-200 focus:border-primary focus:outline-none"
      />

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader className="w-5 h-5 animate-spin" /> : 'Tạo sản phẩm'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn-outline"
          >
            Hủy
          </button>
        )}
      </div>
    </form>
  );
};

export default ProductForm;