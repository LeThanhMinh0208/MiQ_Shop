import { useState, useEffect } from 'react';
import { Upload, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminGetCategories, adminCreateProduct, adminUpdateProduct } from '../../services/adminService.js';

const ProductForm = ({ initialData = null, onSuccess, onCancel }) => {
  const isEdit = !!initialData?._id;
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
    tags: '',
  });

  useEffect(() => {
    adminGetCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    if (initialData) {
      const sizes = initialData.variants?.map((v) => v.size).join(',') || '';
      const tags = initialData.tags?.join(',') || '';
      setForm({
        name: initialData.name || '',
        description: initialData.description || '',
        brand: initialData.brand || 'Adidas',
        category: initialData.category?._id || initialData.category || '',
        price: initialData.price || '',
        salePrice: initialData.salePrice || '',
        sizes,
        tags,
      });
    }
  }, [initialData]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    setImageFiles(files);
    setImagePreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEdit && imageFiles.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 ảnh');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('brand', form.brand);
      formData.append('category', form.category);
      formData.append('price', form.price);
      if (form.salePrice) formData.append('salePrice', form.salePrice);
      else formData.append('salePrice', '');

      const sizes = form.sizes.split(',').map((s) => s.trim()).filter(Boolean);
      const variants = sizes.map((size) => ({ size, stock: 20 }));
      formData.append('variants', JSON.stringify(variants));

      const tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean);
      formData.append('tags', JSON.stringify(tags));

      imageFiles.forEach((file) => formData.append('images', file));

      if (isEdit) {
        await adminUpdateProduct(initialData._id, formData);
        toast.success('Cập nhật sản phẩm thành công!');
      } else {
        await adminCreateProduct(formData);
        toast.success('Tạo sản phẩm thành công!');
      }
      onSuccess?.();
    } catch (error) {
      toast.error(error.message || 'Thao tác thất bại');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'px-4 py-3 rounded-lg border border-surface-border bg-bg-raised text-text-primary focus:border-primary focus:outline-none w-full';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Images */}
      <div>
        <label className="font-bold text-sm uppercase mb-2 block">
          {isEdit ? 'Ảnh mới (bỏ trống để giữ ảnh cũ)' : 'Ảnh sản phẩm (tối đa 5)'}
        </label>

        {isEdit && initialData.images?.length > 0 && imagePreviews.length === 0 && (
          <div className="grid grid-cols-5 gap-2 mb-3">
            {initialData.images.map((img, i) => (
              <div key={i} className="relative aspect-square bg-bg-raised rounded-lg overflow-hidden border border-surface-border">
                <img src={img.url} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}

        <div className="border-2 border-dashed border-surface-border rounded-xl p-6 text-center hover:border-primary transition cursor-pointer relative">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <Upload className="w-10 h-10 text-primary mx-auto mb-2" />
          <p className="text-sm text-text-muted">Click để chọn ảnh hoặc kéo thả vào đây</p>
        </div>

        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-5 gap-2 mt-3">
            {imagePreviews.map((src, i) => (
              <div key={i} className="relative aspect-square bg-bg-raised rounded-lg overflow-hidden">
                <img src={src} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
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
          className={inputCls}
        />
        <select
          required
          value={form.brand}
          onChange={(e) => setForm({ ...form, brand: e.target.value })}
          className={inputCls}
        >
          {['MiQ', 'Adidas', 'Nike', 'Puma', 'Mizuno', 'Under Armour', 'New Balance', 'Umbro'].map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>

      <select
        required
        value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value })}
        className={inputCls}
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
        className={`${inputCls} resize-none`}
      />

      <div className="grid grid-cols-2 gap-4">
        <input
          required
          type="number"
          placeholder="Giá gốc (VND)"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className={inputCls}
        />
        <input
          type="number"
          placeholder="Giá sale (tuỳ chọn)"
          value={form.salePrice}
          onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
          className={inputCls}
        />
      </div>

      <input
        placeholder="Sizes (cách nhau dấu phẩy: 39,40,41)"
        value={form.sizes}
        onChange={(e) => setForm({ ...form, sizes: e.target.value })}
        className={inputCls}
      />

      {/* Tag picker — predefined + free text */}
      <div>
        <label className="font-bold text-sm uppercase mb-2 block text-text-primary">Tags</label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {[
            { label: '⚽ CLB', val: 'club' },
            { label: '🏆 Đội tuyển', val: 'national' },
            { label: '🏃 Tập luyện', val: 'training' },
            { label: '🧤 Thủ môn', val: 'goalkeeper' },
            { label: '🌱 Sân cỏ FG', val: 'firm-ground' },
            { label: '🌧️ Sân mềm SG', val: 'soft-ground' },
            { label: '🔲 Sân nhân tạo', val: 'ag' },
            { label: '🏟️ Futsal', val: 'futsal' },
            { label: '🏠 Sân trong nhà', val: 'indoor' },
            { label: '🩳 Quần short', val: 'shorts' },
            { label: '🧥 Tracksuit', val: 'tracksuit' },
            { label: '⭐ Nổi bật', val: 'featured' },
            { label: '🆕 Mới', val: 'new-arrival' },
          ].map(({ label, val }) => {
            const active = form.tags.split(',').map((t) => t.trim()).includes(val);
            return (
              <button
                key={val}
                type="button"
                onClick={() => {
                  const arr = form.tags.split(',').map((t) => t.trim()).filter(Boolean);
                  const next = active ? arr.filter((t) => t !== val) : [...arr, val];
                  setForm({ ...form, tags: next.join(',') });
                }}
                className={`text-xs px-2.5 py-1 rounded-full border font-bold transition ${
                  active
                    ? 'bg-primary/15 border-primary/40 text-primary'
                    : 'bg-bg-raised border-surface-border text-text-muted hover:border-primary/30'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
        <input
          placeholder="Tags tùy chỉnh (firm-ground, fg, pro)"
          value={form.tags}
          onChange={(e) => setForm({ ...form, tags: e.target.value })}
          className={inputCls}
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader className="w-5 h-5 animate-spin" /> : isEdit ? 'Cập nhật sản phẩm' : 'Tạo sản phẩm'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-outline">
            Hủy
          </button>
        )}
      </div>
    </form>
  );
};

export default ProductForm;
