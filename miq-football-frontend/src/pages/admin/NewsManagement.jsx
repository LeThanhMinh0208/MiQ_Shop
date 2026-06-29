// Cloudinary unsigned upload:
// 1. Create upload preset in Cloudinary Dashboard → Settings → Upload → Add upload preset
// 2. Set preset to "Unsigned" mode
// 3. Add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_PRESET to .env file
// 4. The upload function posts FormData to the Cloudinary API URL

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Pencil, Trash2, X, Image, Loader, Newspaper,
  Search, ChevronDown,
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

// ── Mock data ────────────────────────────────────────────────────────────────
const MOCK_ARTICLES = [
  {
    id: 1,
    title: 'Ra mắt BST áo đấu 2025/26',
    category: 'Sản phẩm mới',
    date: '2025-06-01',
    status: 'published',
    image: 'https://placehold.co/400x200/27272A/A1A1AA?text=BST+2025',
    content: 'Bộ sưu tập áo đấu mùa giải 2025/26 chính thức ra mắt với thiết kế đột phá...',
  },
  {
    id: 2,
    title: 'Flash Sale tháng 6 – Giảm đến 50%',
    category: 'Khuyến mãi',
    date: '2025-06-10',
    status: 'published',
    image: 'https://placehold.co/400x200/EF4444/ffffff?text=Flash+Sale',
    content: 'Chương trình Flash Sale tháng 6 với hàng trăm sản phẩm giảm giá sâu...',
  },
  {
    id: 3,
    title: 'Hướng dẫn chọn giày đá bóng phù hợp',
    category: 'Cẩm nang',
    date: '2025-06-15',
    status: 'draft',
    image: 'https://placehold.co/400x200/3B82F6/ffffff?text=Guide',
    content: 'Chọn giày đá bóng phù hợp với mặt sân và phong cách thi đấu...',
  },
];

const CATEGORIES = ['Sản phẩm mới', 'Khuyến mãi', 'Cẩm nang', 'Tin tức', 'Sự kiện'];

// ── Cloudinary upload helper ──────────────────────────────────────────────────
const uploadToCloudinary = async (file) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const preset    = import.meta.env.VITE_CLOUDINARY_PRESET;
  if (!cloudName || !preset) {
    throw new Error('Chưa cấu hình VITE_CLOUDINARY_CLOUD_NAME hoặc VITE_CLOUDINARY_PRESET trong .env');
  }
  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', preset);
  const res = await axios.post(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    form,
  );
  return res.data.secure_url;
};

// ── Status badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => (
  <span
    className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
      status === 'published'
        ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
        : 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
    }`}
  >
    {status === 'published' ? 'Đã đăng' : 'Nháp'}
  </span>
);

// ── Article Form Modal ────────────────────────────────────────────────────────
const ArticleFormModal = ({ article, onClose, onSave }) => {
  const isEdit = !!article;
  const [form, setForm] = useState({
    title:    article?.title    || '',
    content:  article?.content  || '',
    category: article?.category || CATEGORIES[0],
    status:   article?.status   || 'draft',
    image:    article?.image    || '',
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving]       = useState(false);

  const handleField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      handleField('image', url);
      toast.success('Tải ảnh lên thành công!');
    } catch (err) {
      toast.error(err.message || 'Lỗi khi tải ảnh');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Vui lòng nhập tiêu đề'); return; }
    setSaving(true);
    try {
      await onSave({ ...article, ...form, id: article?.id ?? Date.now() });
      toast.success(isEdit ? 'Cập nhật thành công!' : 'Thêm bài viết thành công!');
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-bg-elevated border border-surface-border rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border flex-shrink-0">
          <h2 className="font-display text-xl font-bold text-text-primary">
            {isEdit ? 'Chỉnh sửa bài viết' : 'Thêm bài viết'}
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-bg-raised hover:bg-bg-overlay flex items-center justify-center transition"
          >
            <X className="w-4 h-4 text-text-muted" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
              Tiêu đề *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleField('title', e.target.value)}
              placeholder="Nhập tiêu đề bài viết..."
              className="w-full px-4 py-2.5 rounded-xl border border-surface-border bg-bg-raised text-text-primary focus:border-primary focus:outline-none text-sm"
              required
            />
          </div>

          {/* Category + Status row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                Danh mục
              </label>
              <div className="relative">
                <select
                  value={form.category}
                  onChange={(e) => handleField('category', e.target.value)}
                  className="w-full appearance-none px-4 py-2.5 rounded-xl border border-surface-border bg-bg-raised text-text-primary focus:border-primary focus:outline-none text-sm pr-9"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                Trạng thái
              </label>
              <div className="relative">
                <select
                  value={form.status}
                  onChange={(e) => handleField('status', e.target.value)}
                  className="w-full appearance-none px-4 py-2.5 rounded-xl border border-surface-border bg-bg-raised text-text-primary focus:border-primary focus:outline-none text-sm pr-9"
                >
                  <option value="draft">Nháp</option>
                  <option value="published">Đã đăng</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Image upload */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
              Ảnh bìa
            </label>
            <div className="flex gap-3 items-start">
              <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-surface-border text-text-muted hover:border-primary hover:text-primary cursor-pointer transition text-sm flex-shrink-0">
                {uploading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Image className="w-4 h-4" />
                )}
                {uploading ? 'Đang tải...' : 'Chọn ảnh'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
              </label>
              {form.image && (
                <div className="relative flex-1">
                  <img
                    src={form.image}
                    alt="Preview"
                    className="h-20 w-full object-cover rounded-xl border border-surface-border"
                  />
                  <button
                    type="button"
                    onClick={() => handleField('image', '')}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
            <input
              type="text"
              value={form.image}
              onChange={(e) => handleField('image', e.target.value)}
              placeholder="Hoặc nhập URL ảnh..."
              className="w-full mt-2 px-4 py-2.5 rounded-xl border border-surface-border bg-bg-raised text-text-primary focus:border-primary focus:outline-none text-sm"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
              Nội dung
            </label>
            <textarea
              value={form.content}
              onChange={(e) => handleField('content', e.target.value)}
              placeholder="Nhập nội dung bài viết..."
              rows={6}
              className="w-full px-4 py-3 rounded-xl border border-surface-border bg-bg-raised text-text-primary focus:border-primary focus:outline-none text-sm resize-none"
            />
          </div>
        </form>

        {/* Footer buttons */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-surface-border flex-shrink-0 bg-bg-elevated">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-surface-border text-text-secondary hover:text-text-primary hover:border-primary/40 transition text-sm font-semibold"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition disabled:opacity-50"
          >
            {saving && <Loader className="w-4 h-4 animate-spin" />}
            {isEdit ? 'Cập nhật' : 'Thêm bài viết'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── Delete Confirm ────────────────────────────────────────────────────────────
const DeleteConfirm = ({ article, onClose, onConfirm }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[999] flex items-center justify-center p-4"
    onClick={onClose}
  >
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.18 }}
      onClick={(e) => e.stopPropagation()}
      className="relative bg-bg-elevated border border-surface-border rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center"
    >
      <div className="w-14 h-14 rounded-full bg-red-500/15 flex items-center justify-center mx-auto mb-4">
        <Trash2 className="w-6 h-6 text-red-500" />
      </div>
      <h3 className="font-bold text-text-primary text-lg mb-2">Xóa bài viết?</h3>
      <p className="text-text-muted text-sm mb-5">
        Bài viết <span className="font-bold text-text-primary">"{article.title}"</span> sẽ bị xóa vĩnh viễn.
      </p>
      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-surface-border text-text-secondary hover:text-text-primary transition font-semibold text-sm">Hủy</button>
        <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition">Xóa</button>
      </div>
    </motion.div>
  </motion.div>
);

// ── Main ──────────────────────────────────────────────────────────────────────
const NewsManagement = () => {
  const [articles, setArticles]     = useState(MOCK_ARTICLES);
  const [modalMode, setModalMode]   = useState(null); // 'add' | 'edit' | 'delete'
  const [selected, setSelected]     = useState(null);
  const [search, setSearch]         = useState('');

  const filtered = articles.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = (article) => {
    setArticles((prev) =>
      prev.find((a) => a.id === article.id)
        ? prev.map((a) => (a.id === article.id ? article : a))
        : [article, ...prev]
    );
  };

  const handleDelete = () => {
    setArticles((prev) => prev.filter((a) => a.id !== selected?.id));
    toast.success('Đã xóa bài viết');
    setModalMode(null);
    setSelected(null);
  };

  return (
    <div className="min-h-screen bg-bg-base">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Newspaper className="w-6 h-6 text-primary" />
            <h1 className="font-display text-3xl font-bold text-text-primary">Quản lý Tin tức</h1>
          </div>
          <p className="text-text-muted text-sm">{articles.length} bài viết</p>
        </div>
        <button
          onClick={() => { setSelected(null); setModalMode('add'); }}
          className="flex items-center gap-2 bg-primary text-white font-bold px-5 py-2.5 rounded-xl hover:bg-primary/90 transition shadow-md"
        >
          <Plus className="w-4 h-4" />
          Thêm bài viết
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm kiếm bài viết..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-border bg-surface text-text-primary focus:border-primary focus:outline-none text-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-surface rounded-2xl border border-surface-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-bg-raised border-b border-surface-border text-text-muted text-xs uppercase tracking-wider">
                <th className="px-4 py-3 text-left">Bài viết</th>
                <th className="px-4 py-3 text-left">Danh mục</th>
                <th className="px-4 py-3 text-left">Ngày đăng</th>
                <th className="px-4 py-3 text-left">Trạng thái</th>
                <th className="px-4 py-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-text-muted">
                    Không tìm thấy bài viết
                  </td>
                </tr>
              ) : (
                filtered.map((article) => (
                  <tr key={article.id} className="border-b border-surface-border hover:bg-bg-raised/40 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {article.image ? (
                          <img
                            src={article.image}
                            alt=""
                            className="w-12 h-10 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-10 rounded-lg bg-bg-raised flex items-center justify-center flex-shrink-0">
                            <Newspaper className="w-5 h-5 text-text-muted" />
                          </div>
                        )}
                        <p className="font-semibold text-text-primary line-clamp-2 max-w-xs">
                          {article.title}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                        {article.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-muted whitespace-nowrap">{article.date}</td>
                    <td className="px-4 py-3"><StatusBadge status={article.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setSelected(article); setModalMode('edit'); }}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-bg-raised hover:bg-primary/10 hover:text-primary text-text-muted transition"
                          aria-label="Chỉnh sửa"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => { setSelected(article); setModalMode('delete'); }}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-bg-raised hover:bg-red-500/10 hover:text-red-500 text-text-muted transition"
                          aria-label="Xóa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {(modalMode === 'add' || modalMode === 'edit') && (
          <ArticleFormModal
            article={modalMode === 'edit' ? selected : null}
            onClose={() => { setModalMode(null); setSelected(null); }}
            onSave={handleSave}
          />
        )}
        {modalMode === 'delete' && selected && (
          <DeleteConfirm
            article={selected}
            onClose={() => { setModalMode(null); setSelected(null); }}
            onConfirm={handleDelete}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default NewsManagement;
