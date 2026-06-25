import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, EyeOff, Eye, Loader, Upload, X } from 'lucide-react';
import { TableSkeleton } from '../../components/ui/Skeleton.jsx';
import toast from 'react-hot-toast';
import {
  adminGetAllCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
  adminRestoreCategory,
} from '../../services/adminService.js';

const EMPTY_FORM = { name: '', description: '', parent: '' };

const AdminCategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await adminGetAllCategories();
      setCategories(data);
    } catch {
      toast.error('Không tải được danh mục');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setImagePreview('');
    setShowForm(true);
  };

  const openEdit = (cat) => {
    setEditTarget(cat);
    setForm({
      name: cat.name || '',
      description: cat.description || '',
      parent: cat.parent?._id || cat.parent || '',
    });
    setImageFile(null);
    setImagePreview('');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditTarget(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Tên danh mục không được trống'); return; }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name.trim());
      fd.append('description', form.description.trim());
      fd.append('parent', form.parent || '');
      if (imageFile) fd.append('image', imageFile);

      if (editTarget) {
        await adminUpdateCategory(editTarget._id, fd);
        toast.success('Cập nhật danh mục thành công');
      } else {
        await adminCreateCategory(fd);
        toast.success('Tạo danh mục thành công');
      }
      closeForm();
      loadCategories();
    } catch (err) {
      toast.error(err.message || 'Thao tác thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (cat) => {
    try {
      if (cat.isActive) {
        await adminDeleteCategory(cat._id);
        toast.success('Đã ẩn danh mục');
      } else {
        await adminRestoreCategory(cat._id);
        toast.success('Đã hiện danh mục');
      }
      loadCategories();
    } catch {
      toast.error('Thao tác thất bại');
    }
  };

  const activeParents = categories.filter((c) => c.isActive && (!editTarget || c._id !== editTarget._id));
  const inputCls = 'w-full px-4 py-3 rounded-lg border border-surface-border bg-bg-raised text-text-primary focus:border-primary focus:outline-none text-sm';

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Quản lý danh mục</h1>
          <p className="text-text-muted">{categories.length} danh mục</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Thêm danh mục
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl font-bold">
                {editTarget ? `Chỉnh sửa: ${editTarget.name}` : 'Tạo danh mục mới'}
              </h3>
              <button onClick={closeForm} className="p-2 hover:bg-bg-raised rounded-lg transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div className="col-span-2 grid grid-cols-2 gap-4">
                <input
                  required
                  placeholder="Tên danh mục *"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputCls}
                />
                <select
                  value={form.parent}
                  onChange={(e) => setForm({ ...form, parent: e.target.value })}
                  className={inputCls}
                >
                  <option value="">-- Không có danh mục cha --</option>
                  {activeParents.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <textarea
                  rows={2}
                  placeholder="Mô tả (tuỳ chọn)"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={`${inputCls} resize-none`}
                />
              </div>

              {/* Image upload */}
              <div className="col-span-2">
                <label className="font-bold text-sm uppercase mb-2 block">Ảnh danh mục</label>
                <div className="flex items-start gap-4">
                  <div className="border-2 border-dashed border-surface-border rounded-xl p-4 text-center hover:border-primary transition cursor-pointer relative flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Upload className="w-7 h-7 text-primary mx-auto mb-1" />
                    <p className="text-xs text-text-muted">Click để chọn ảnh</p>
                  </div>
                  {(imagePreview || editTarget?.image?.url) && (
                    <div className="w-24 h-24 bg-bg-raised rounded-xl overflow-hidden flex-shrink-0 border border-surface-border">
                      <img
                        src={imagePreview || editTarget?.image?.url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="col-span-2 flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? <Loader className="w-5 h-5 animate-spin" /> : editTarget ? 'Cập nhật' : 'Tạo danh mục'}
                </button>
                <button type="button" onClick={closeForm} className="btn-outline">Hủy</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      {loading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : (
        <div className="bg-bg-elevated rounded-2xl border border-surface-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-bg-raised">
              <tr>
                <th className="text-left p-4 text-sm uppercase font-bold">Danh mục</th>
                <th className="text-left p-4 text-sm uppercase font-bold">Slug</th>
                <th className="text-left p-4 text-sm uppercase font-bold">Cha</th>
                <th className="text-left p-4 text-sm uppercase font-bold">Trạng thái</th>
                <th className="text-right p-4 text-sm uppercase font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat._id} className={`border-t border-surface-border hover:bg-bg-raised/50 ${!cat.isActive ? 'opacity-50' : ''}`}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {cat.image?.url ? (
                        <img src={cat.image.url} alt="" loading="lazy" decoding="async" className="w-10 h-10 rounded-lg object-cover bg-bg-raised" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-bg-raised flex items-center justify-center text-text-muted text-xs font-bold uppercase">
                          {cat.name[0]}
                        </div>
                      )}
                      <span className="font-semibold">{cat.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-text-muted font-mono">{cat.slug}</td>
                  <td className="p-4 text-sm">{cat.parent?.name || <span className="text-text-muted">—</span>}</td>
                  <td className="p-4">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                      cat.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
                    }`}>
                      {cat.isActive ? 'Hiện' : 'Ẩn'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(cat)}
                        className="text-primary hover:bg-primary/10 p-2 rounded-lg transition"
                        title="Chỉnh sửa"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleActive(cat)}
                        className={`p-2 rounded-lg transition ${
                          cat.isActive
                            ? 'text-amber-600 hover:bg-amber-50'
                            : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={cat.isActive ? 'Ẩn danh mục' : 'Hiện danh mục'}
                      >
                        {cat.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-text-muted">
                    Chưa có danh mục nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminCategoryManagement;
