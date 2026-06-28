import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Pencil, Trash2, X, Image, Loader, Layers3,
  ChevronDown, Upload, Star,
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCollections, createCollection, updateCollection, deleteCollection,
  addSlide, removeSlide, addModelPhoto, removeModelPhoto,
} from '../../services/collectionService.js';

// ── Cloudinary upload ─────────────────────────────────────────────────────────
const uploadToCloudinary = async (file) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const preset    = import.meta.env.VITE_CLOUDINARY_PRESET;
  if (!cloudName || !preset) throw new Error('Chưa cấu hình Cloudinary trong .env');
  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', preset);
  const res = await axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, form);
  return { url: res.data.secure_url, publicId: res.data.public_id };
};

const BRAND_OPTIONS = ['MiQ', 'Nike', 'Adidas', 'Puma', 'New Balance', 'Mizuno', 'Umbro'];

// ── Label + Input helpers ─────────────────────────────────────────────────────
const FieldLabel = ({ children }) => (
  <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
    {children}
  </label>
);
const TextInput = (props) => (
  <input
    {...props}
    className={`w-full px-4 py-2.5 rounded-xl border border-surface-border bg-bg-raised text-text-primary focus:border-primary focus:outline-none text-sm ${props.className || ''}`}
  />
);

// ── Delete Confirm ────────────────────────────────────────────────────────────
const DeleteConfirm = ({ name, onClose, onConfirm, loading }) => (
  <motion.div
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
    onClick={onClose}
  >
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.18 }}
      onClick={(e) => e.stopPropagation()}
      className="relative bg-bg-elevated border border-surface-border rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center"
    >
      <div className="w-14 h-14 rounded-full bg-red-500/15 flex items-center justify-center mx-auto mb-4">
        <Trash2 className="w-6 h-6 text-red-500" />
      </div>
      <h3 className="font-bold text-text-primary text-lg mb-2">Xóa bộ sưu tập?</h3>
      <p className="text-text-muted text-sm mb-5">
        <span className="font-bold text-text-primary">"{name}"</span> sẽ bị xóa vĩnh viễn.
      </p>
      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-surface-border text-text-secondary hover:text-text-primary transition font-semibold text-sm">Hủy</button>
        <button onClick={onConfirm} disabled={loading} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2">
          {loading && <Loader className="w-4 h-4 animate-spin" />}Xóa
        </button>
      </div>
    </motion.div>
  </motion.div>
);

// ── Tab: Slides ───────────────────────────────────────────────────────────────
const SlidesTab = ({ collection }) => {
  const qc = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption]     = useState('');

  const addMut = useMutation({
    mutationFn: ({ url, publicId, caption: c }) => addSlide(collection._id, { url, publicId, caption: c }),
    onSuccess: () => { qc.invalidateQueries(['collections-admin']); toast.success('Đã thêm slide'); setCaption(''); },
    onError: (e) => toast.error(e.message),
  });
  const removeMut = useMutation({
    mutationFn: (slideId) => removeSlide(collection._id, slideId),
    onSuccess: () => { qc.invalidateQueries(['collections-admin']); toast.success('Đã xóa slide'); },
    onError: (e) => toast.error(e.message),
  });

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url, publicId } = await uploadToCloudinary(file);
      addMut.mutate({ url, publicId, caption });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const slides = collection?.slides || [];

  return (
    <div className="space-y-4">
      {/* Upload row */}
      <div className="flex items-center gap-3 p-4 rounded-xl border border-dashed border-surface-border bg-bg-raised">
        <TextInput
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Caption (tuỳ chọn)..."
          className="flex-1"
        />
        <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-sm cursor-pointer hover:bg-primary/90 transition flex-shrink-0 disabled:opacity-50">
          {uploading ? <Loader className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? 'Đang tải...' : 'Tải lên'}
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      {slides.length === 0 ? (
        <p className="text-center text-text-muted text-sm py-8">Chưa có slide nào. Tải lên ảnh slideshow đầu tiên.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {slides.map((slide) => (
            <div key={slide._id} className="relative group rounded-xl overflow-hidden border border-surface-border">
              <img src={slide.url} alt={slide.caption} className="w-full aspect-video object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <button
                  onClick={() => removeMut.mutate(slide._id)}
                  disabled={removeMut.isPending}
                  className="w-9 h-9 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              {slide.caption && (
                <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-black/60 text-white text-xs truncate">
                  {slide.caption}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Tab: Model Photos ─────────────────────────────────────────────────────────
const ModelPhotosTab = ({ collection }) => {
  const qc = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [form, setForm]           = useState({ title: '', desc: '' });

  const addMut = useMutation({
    mutationFn: (photo) => addModelPhoto(collection._id, photo),
    onSuccess: () => { qc.invalidateQueries(['collections-admin']); toast.success('Đã thêm ảnh'); setForm({ title: '', desc: '' }); },
    onError: (e) => toast.error(e.message),
  });
  const removeMut = useMutation({
    mutationFn: (photoId) => removeModelPhoto(collection._id, photoId),
    onSuccess: () => { qc.invalidateQueries(['collections-admin']); toast.success('Đã xóa ảnh'); },
    onError: (e) => toast.error(e.message),
  });

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url, publicId } = await uploadToCloudinary(file);
      addMut.mutate({ url, publicId, title: form.title, desc: form.desc });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const photos = collection?.modelPhotos || [];

  return (
    <div className="space-y-4">
      {/* Upload row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-xl border border-dashed border-surface-border bg-bg-raised">
        <TextInput
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="Tiêu đề ảnh..."
        />
        <TextInput
          value={form.desc}
          onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
          placeholder="Mô tả ngắn..."
        />
        <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-sm cursor-pointer hover:bg-primary/90 transition">
          {uploading ? <Loader className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? 'Đang tải...' : 'Tải ảnh model'}
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      {photos.length === 0 ? (
        <p className="text-center text-text-muted text-sm py-8">Chưa có ảnh model nào.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {photos.map((photo) => (
            <div key={photo._id} className="relative group rounded-xl overflow-hidden border border-surface-border">
              <img src={photo.url} alt={photo.title} className="w-full aspect-[3/4] object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <button
                  onClick={() => removeMut.mutate(photo._id)}
                  disabled={removeMut.isPending}
                  className="w-9 h-9 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 bg-black/60">
                {photo.title && <p className="text-white text-xs font-bold truncate">{photo.title}</p>}
                {photo.desc  && <p className="text-white/70 text-[10px] truncate">{photo.desc}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Info Tab form ─────────────────────────────────────────────────────────────
const InfoTab = ({ form, setForm }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <FieldLabel>Tên bộ sưu tập *</FieldLabel>
        <TextInput
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="VD: Bộ sưu tập Nike 2025"
          required
        />
      </div>
      <div>
        <FieldLabel>Thương hiệu *</FieldLabel>
        <div className="relative">
          <select
            value={form.brand}
            onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
            className="w-full appearance-none px-4 py-2.5 rounded-xl border border-surface-border bg-bg-raised text-text-primary focus:border-primary focus:outline-none text-sm pr-9"
          >
            <option value="">-- Chọn thương hiệu --</option>
            {BRAND_OPTIONS.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
        </div>
      </div>
    </div>

    <div>
      <FieldLabel>Tagline</FieldLabel>
      <TextInput
        value={form.tagline}
        onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))}
        placeholder="VD: Just Do It"
      />
    </div>

    <div>
      <FieldLabel>Mô tả</FieldLabel>
      <textarea
        value={form.description}
        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        rows={3}
        placeholder="Mô tả bộ sưu tập..."
        className="w-full px-4 py-2.5 rounded-xl border border-surface-border bg-bg-raised text-text-primary focus:border-primary focus:outline-none text-sm resize-none"
      />
    </div>

    <div>
      <FieldLabel>Màu nhấn (hex)</FieldLabel>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={form.accentColor}
          onChange={(e) => setForm((f) => ({ ...f, accentColor: e.target.value }))}
          className="w-11 h-11 rounded-xl border border-surface-border cursor-pointer bg-transparent p-1"
        />
        <TextInput
          value={form.accentColor}
          onChange={(e) => setForm((f) => ({ ...f, accentColor: e.target.value }))}
          placeholder="#10B981"
          className="flex-1"
        />
      </div>
    </div>
  </div>
);

// ── Collection Modal (add & edit) ─────────────────────────────────────────────
const CollectionModal = ({ mode, collection, onClose }) => {
  const qc = useQueryClient();
  const isEdit = mode === 'edit';
  const [tab, setTab]   = useState('info');
  const [form, setForm] = useState({
    name:        collection?.name        || '',
    brand:       collection?.brand       || '',
    tagline:     collection?.tagline     || '',
    description: collection?.description || '',
    accentColor: collection?.accentColor || '#10B981',
  });
  const [saving, setSaving] = useState(false);

  const infoMut = useMutation({
    mutationFn: (body) => isEdit ? updateCollection(collection._id, body) : createCollection(body),
    onSuccess: (updated) => {
      qc.invalidateQueries(['collections-admin']);
      toast.success(isEdit ? 'Đã cập nhật thông tin' : 'Tạo bộ sưu tập thành công!');
      if (!isEdit) onClose();
      else {
        // Refresh collection in parent via query cache — stay open for image tabs
        setSaving(false);
      }
    },
    onError: (e) => { toast.error(e.message); setSaving(false); },
  });

  const handleSaveInfo = async (e) => {
    e?.preventDefault();
    if (!form.name.trim()) { toast.error('Vui lòng nhập tên bộ sưu tập'); return; }
    if (!form.brand)        { toast.error('Vui lòng chọn thương hiệu');    return; }
    setSaving(true);
    infoMut.mutate(form);
  };

  // Pull latest collection data from cache (updated after slide/photo mutations)
  const { data: collections = [] } = useQuery({ queryKey: ['collections-admin'], queryFn: () => getCollections(true) });
  const liveCollection = isEdit ? (collections.find((c) => c._id === collection._id) || collection) : null;

  const TABS = isEdit
    ? [
        { id: 'info',   label: 'Thông tin' },
        { id: 'slides', label: `Slideshow (${liveCollection?.slides?.length || 0})` },
        { id: 'photos', label: `Ảnh model (${liveCollection?.modelPhotos?.length || 0})` },
      ]
    : [{ id: 'info', label: 'Thông tin' }];

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        exit={{ opacity: 0, scale: 0.95,    y: 8  }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-bg-elevated border border-surface-border rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border flex-shrink-0">
          <h2 className="font-display text-xl font-bold text-text-primary">
            {isEdit ? `Chỉnh sửa: ${collection.name}` : 'Thêm bộ sưu tập'}
          </h2>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-bg-raised hover:bg-bg-overlay flex items-center justify-center transition">
            <X className="w-4 h-4 text-text-muted" />
          </button>
        </div>

        {/* Tabs (edit mode only shows all 3) */}
        {isEdit && (
          <div className="flex border-b border-surface-border px-6 gap-1 flex-shrink-0">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-3 text-sm font-semibold transition border-b-2 -mb-px ${
                  tab === t.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-muted hover:text-text-primary'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {tab === 'info' && <InfoTab form={form} setForm={setForm} />}
          {tab === 'slides' && isEdit && <SlidesTab collection={liveCollection} />}
          {tab === 'photos' && isEdit && <ModelPhotosTab collection={liveCollection} />}
        </div>

        {/* Footer — only for info tab */}
        {tab === 'info' && (
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-surface-border flex-shrink-0 bg-bg-elevated">
            <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-surface-border text-text-secondary hover:text-text-primary hover:border-primary/40 transition text-sm font-semibold">
              Hủy
            </button>
            <button
              onClick={handleSaveInfo}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition disabled:opacity-50"
            >
              {saving && <Loader className="w-4 h-4 animate-spin" />}
              {isEdit ? 'Lưu thông tin' : 'Tạo bộ sưu tập'}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
const CollectionManagement = () => {
  const qc = useQueryClient();
  const [modalMode, setModalMode] = useState(null);
  const [selected, setSelected]   = useState(null);

  const { data: collections = [], isLoading } = useQuery({
    queryKey: ['collections-admin'],
    queryFn: () => getCollections(true),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => deleteCollection(id),
    onSuccess: () => {
      qc.invalidateQueries(['collections-admin']);
      toast.success('Đã xóa bộ sưu tập');
      setModalMode(null);
      setSelected(null);
    },
    onError: (e) => toast.error(e.message),
  });

  const handleClose = () => { setModalMode(null); setSelected(null); };

  return (
    <div className="min-h-screen bg-bg-base">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Layers3 className="w-6 h-6 text-primary" />
            <h1 className="font-display text-3xl font-bold text-text-primary">Bộ sưu tập</h1>
          </div>
          <p className="text-text-muted text-sm">{collections.length} bộ sưu tập</p>
        </div>
        <button
          onClick={() => { setSelected(null); setModalMode('add'); }}
          className="flex items-center gap-2 bg-primary text-white font-bold px-5 py-2.5 rounded-xl hover:bg-primary/90 transition shadow-md"
        >
          <Plus className="w-4 h-4" />
          Thêm bộ sưu tập
        </button>
      </div>

      {/* Info notice */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6 text-sm text-text-muted">
        <Star className="w-4 h-4 text-primary inline mr-2" />
        Slug của bộ sưu tập được tự động tạo từ tên thương hiệu (VD: "Nike" → <code className="bg-bg-raised px-1 rounded">/collections/nike</code>). Đảm bảo slug khớp với các đường dẫn trong menu điều hướng.
      </div>

      {/* Table */}
      <div className="bg-surface rounded-2xl border border-surface-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-bg-raised border-b border-surface-border text-text-muted text-xs uppercase tracking-wider">
                <th className="px-4 py-3 text-left">Bộ sưu tập</th>
                <th className="px-4 py-3 text-left">Slug</th>
                <th className="px-4 py-3 text-center">Slides</th>
                <th className="px-4 py-3 text-center">Ảnh model</th>
                <th className="px-4 py-3 text-left">Trạng thái</th>
                <th className="px-4 py-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-text-muted">
                    <Loader className="w-6 h-6 animate-spin mx-auto mb-2" />Đang tải...
                  </td>
                </tr>
              ) : collections.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-text-muted">
                    <Layers3 className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="font-semibold mb-1">Chưa có bộ sưu tập nào</p>
                    <p className="text-xs">Nhấn "Thêm bộ sưu tập" để bắt đầu.</p>
                  </td>
                </tr>
              ) : (
                collections.map((col) => (
                  <tr key={col._id} className="border-b border-surface-border hover:bg-bg-raised/40 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {col.slides?.[0]?.url ? (
                          <img src={col.slides[0].url} alt="" className="w-12 h-9 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-12 h-9 rounded-lg bg-bg-raised flex items-center justify-center flex-shrink-0">
                            <Image className="w-4 h-4 text-text-muted" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-text-primary">{col.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                              className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: col.accentColor || '#10B981' }}
                            />
                            <p className="text-xs text-text-muted">{col.brand}</p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs bg-bg-raised border border-surface-border px-2 py-1 rounded text-text-muted">
                        {col.slug}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm font-semibold text-text-primary">{col.slides?.length || 0}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm font-semibold text-text-primary">{col.modelPhotos?.length || 0}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                        col.isActive
                          ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                          : 'bg-red-500/15 text-red-500 border border-red-500/30'
                      }`}>
                        {col.isActive ? 'Hiển thị' : 'Ẩn'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setSelected(col); setModalMode('edit'); }}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-bg-raised hover:bg-primary/10 hover:text-primary text-text-muted transition"
                          aria-label="Chỉnh sửa"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => { setSelected(col); setModalMode('delete'); }}
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
          <CollectionModal
            key={selected?._id || 'new'}
            mode={modalMode}
            collection={selected}
            onClose={handleClose}
          />
        )}
        {modalMode === 'delete' && selected && (
          <DeleteConfirm
            name={selected.name}
            loading={deleteMut.isPending}
            onClose={handleClose}
            onConfirm={() => deleteMut.mutate(selected._id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CollectionManagement;
