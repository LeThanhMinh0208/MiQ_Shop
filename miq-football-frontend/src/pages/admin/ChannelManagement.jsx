import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Pencil, Trash2, X, PlayCircle, ExternalLink,
  Loader, Search, ChevronDown, GripVertical,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ── Mock videos (mirrors MiqChannel.jsx VIDEOS array) ────────────────────────
const INITIAL_VIDEOS = [
  { id: 1, youtubeId: 'dQw4w9WgXcQ', title: 'MiQ Sport | BST 2025/26 Ra Mắt Chính Thức',             views: '12K lượt xem',   order: 1 },
  { id: 2, youtubeId: 'ScMzIvxBSi4', title: 'Review Giày Adidas Predator Elite FG | MiQ Sport',       views: '8.5K lượt xem',  order: 2 },
  { id: 3, youtubeId: 'kJQP7kiw5Fk', title: 'Áo Đấu Man United 2025/26 - Unboxing & Review',          views: '15K lượt xem',   order: 3 },
  { id: 4, youtubeId: 'JGwWNGJdvx8', title: 'Nike Phantom GX Elite - Đánh Giá Chi Tiết 2025',         views: '6.2K lượt xem',  order: 4 },
  { id: 5, youtubeId: '9bZkp7q19f0', title: 'Sự Kiện MiQ Sport Day 2025 - Highlights',                views: '20K lượt xem',   order: 5 },
  { id: 6, youtubeId: 'CevxZvSJLk8', title: 'Hướng Dẫn Chọn Giày Đá Bóng Phù Hợp | MiQ Sport',      views: '9.8K lượt xem',  order: 6 },
];

// ── Extract YouTube ID from URL or raw ID ────────────────────────────────────
const parseYoutubeId = (input) => {
  const raw = input.trim();
  // Full URL: https://www.youtube.com/watch?v=xxxxx or https://youtu.be/xxxxx
  const match = raw.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
  );
  if (match) return match[1];
  // Raw 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) return raw;
  return null;
};

const thumbUrl = (youtubeId) =>
  `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;

// ── Video Form Modal ──────────────────────────────────────────────────────────
const VideoFormModal = ({ video, onClose, onSave }) => {
  const isEdit = !!video;
  const [form, setForm] = useState({
    youtubeInput: video?.youtubeId || '',
    title: video?.title || '',
    views: video?.views || '',
    order: video?.order ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [thumbPreview, setThumbPreview] = useState(
    video?.youtubeId ? thumbUrl(video.youtubeId) : ''
  );

  const handleField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleYoutubeChange = (v) => {
    handleField('youtubeInput', v);
    const parsed = parseYoutubeId(v);
    setThumbPreview(parsed ? thumbUrl(parsed) : '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const youtubeId = parseYoutubeId(form.youtubeInput);
    if (!youtubeId) { toast.error('URL hoặc ID YouTube không hợp lệ'); return; }
    if (!form.title.trim()) { toast.error('Vui lòng nhập tiêu đề video'); return; }
    setSaving(true);
    try {
      await onSave({
        ...video,
        id: video?.id ?? Date.now(),
        youtubeId,
        title: form.title.trim(),
        views: form.views.trim() || '0 lượt xem',
        order: Number(form.order) || 99,
      });
      toast.success(isEdit ? 'Cập nhật video thành công!' : 'Thêm video thành công!');
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
        className="relative bg-bg-elevated border border-surface-border rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border flex-shrink-0">
          <h2 className="font-display text-xl font-bold text-text-primary">
            {isEdit ? 'Chỉnh sửa video' : 'Thêm video'}
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
          {/* YouTube URL / ID */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
              URL hoặc ID YouTube *
            </label>
            <input
              type="text"
              value={form.youtubeInput}
              onChange={(e) => handleYoutubeChange(e.target.value)}
              placeholder="https://youtube.com/watch?v=... hoặc ID (11 ký tự)"
              className="w-full px-4 py-2.5 rounded-xl border border-surface-border bg-bg-raised text-text-primary focus:border-primary focus:outline-none text-sm"
            />
          </div>

          {/* Thumbnail preview */}
          {thumbPreview && (
            <div className="rounded-xl overflow-hidden border border-surface-border">
              <img
                src={thumbPreview}
                alt="Thumbnail preview"
                className="w-full h-36 object-cover"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
              Tiêu đề video *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleField('title', e.target.value)}
              placeholder="Nhập tiêu đề video..."
              className="w-full px-4 py-2.5 rounded-xl border border-surface-border bg-bg-raised text-text-primary focus:border-primary focus:outline-none text-sm"
            />
          </div>

          {/* Views + Order row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                Lượt xem
              </label>
              <input
                type="text"
                value={form.views}
                onChange={(e) => handleField('views', e.target.value)}
                placeholder="12K lượt xem"
                className="w-full px-4 py-2.5 rounded-xl border border-surface-border bg-bg-raised text-text-primary focus:border-primary focus:outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                Thứ tự hiển thị
              </label>
              <input
                type="number"
                min={1}
                value={form.order}
                onChange={(e) => handleField('order', e.target.value)}
                placeholder="1"
                className="w-full px-4 py-2.5 rounded-xl border border-surface-border bg-bg-raised text-text-primary focus:border-primary focus:outline-none text-sm"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
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
            {isEdit ? 'Cập nhật' : 'Thêm video'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── Delete Confirm ────────────────────────────────────────────────────────────
const DeleteConfirm = ({ video, onClose, onConfirm }) => (
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
      <h3 className="font-bold text-text-primary text-lg mb-2">Xóa video?</h3>
      <p className="text-text-muted text-sm mb-5">
        Video <span className="font-bold text-text-primary">"{video.title}"</span> sẽ bị xóa khỏi danh sách.
      </p>
      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-surface-border text-text-secondary hover:text-text-primary transition font-semibold text-sm">Hủy</button>
        <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition">Xóa</button>
      </div>
    </motion.div>
  </motion.div>
);

// ── Video Card ────────────────────────────────────────────────────────────────
const VideoCard = ({ video, onEdit, onDelete }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className="group bg-surface rounded-2xl border border-surface-border overflow-hidden hover:border-primary/30 transition"
  >
    {/* Thumbnail */}
    <div className="relative aspect-video bg-bg-raised overflow-hidden">
      <img
        src={thumbUrl(video.youtubeId)}
        alt={video.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        onError={(e) => {
          e.currentTarget.src = `https://placehold.co/320x180/1F2937/ffffff?text=Video`;
        }}
      />
      {/* Play overlay */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center">
          <PlayCircle className="w-6 h-6 text-white" />
        </div>
      </div>
      {/* Order badge */}
      <div className="absolute top-2 left-2 w-7 h-7 rounded-lg bg-black/70 text-white text-xs font-bold flex items-center justify-center">
        {video.order}
      </div>
    </div>

    {/* Info */}
    <div className="p-4">
      <p className="font-semibold text-text-primary text-sm line-clamp-2 mb-1 leading-snug">
        {video.title}
      </p>
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-text-muted">{video.views}</span>
        <div className="flex items-center gap-1">
          <a
            href={`https://youtube.com/watch?v=${video.youtubeId}`}
            target="_blank"
            rel="noreferrer"
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-bg-raised hover:bg-primary/10 hover:text-primary text-text-muted transition"
            aria-label="Xem trên YouTube"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={() => onEdit(video)}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-bg-raised hover:bg-primary/10 hover:text-primary text-text-muted transition"
            aria-label="Chỉnh sửa"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(video)}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-bg-raised hover:bg-red-500/10 hover:text-red-500 text-text-muted transition"
            aria-label="Xóa"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  </motion.div>
);

// ── Main ──────────────────────────────────────────────────────────────────────
const ChannelManagement = () => {
  const [videos, setVideos]       = useState(INITIAL_VIDEOS);
  const [modalMode, setModalMode] = useState(null); // 'add' | 'edit' | 'delete'
  const [selected, setSelected]   = useState(null);
  const [search, setSearch]       = useState('');
  const [view, setView]           = useState('grid'); // 'grid' | 'table'

  const filtered = videos
    .filter((v) => v.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.order - b.order);

  const handleSave = (video) => {
    setVideos((prev) =>
      prev.find((v) => v.id === video.id)
        ? prev.map((v) => (v.id === video.id ? video : v))
        : [...prev, video]
    );
  };

  const handleDelete = () => {
    setVideos((prev) => prev.filter((v) => v.id !== selected?.id));
    toast.success('Đã xóa video');
    setModalMode(null);
    setSelected(null);
  };

  const openEdit   = (v) => { setSelected(v); setModalMode('edit'); };
  const openDelete = (v) => { setSelected(v); setModalMode('delete'); };

  return (
    <div className="min-h-screen bg-bg-base">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <PlayCircle className="w-6 h-6 text-primary" />
            <h1 className="font-display text-3xl font-bold text-text-primary">MiQ Channel</h1>
          </div>
          <p className="text-text-muted text-sm">{videos.length} video</p>
        </div>
        <button
          onClick={() => { setSelected(null); setModalMode('add'); }}
          className="flex items-center gap-2 bg-primary text-white font-bold px-5 py-2.5 rounded-xl hover:bg-primary/90 transition shadow-md"
        >
          <Plus className="w-4 h-4" />
          Thêm video
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm video..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-border bg-surface text-text-primary focus:border-primary focus:outline-none text-sm"
          />
        </div>
        {/* View toggle */}
        <div className="flex items-center gap-1 bg-bg-raised border border-surface-border rounded-xl p-1">
          {['grid', 'table'].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                view === v
                  ? 'bg-primary text-white'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {v === 'grid' ? 'Lưới' : 'Danh sách'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-text-muted">
          <PlayCircle className="w-16 h-16 opacity-20 mb-3" />
          <p>Không tìm thấy video</p>
        </div>
      ) : view === 'grid' ? (
        <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {filtered.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onEdit={openEdit}
                onDelete={openDelete}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="bg-surface rounded-2xl border border-surface-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-bg-raised border-b border-surface-border text-text-muted text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 text-left w-8">#</th>
                  <th className="px-4 py-3 text-left">Video</th>
                  <th className="px-4 py-3 text-left">YouTube ID</th>
                  <th className="px-4 py-3 text-left">Lượt xem</th>
                  <th className="px-4 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((video) => (
                  <tr key={video.id} className="border-b border-surface-border hover:bg-bg-raised/40 transition">
                    <td className="px-4 py-3">
                      <GripVertical className="w-4 h-4 text-text-muted cursor-grab" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={thumbUrl(video.youtubeId)}
                          alt=""
                          className="w-16 h-10 rounded-lg object-cover flex-shrink-0"
                          onError={(e) => { e.currentTarget.src = `https://placehold.co/64x40/1F2937/fff?text=V`; }}
                        />
                        <p className="font-semibold text-text-primary line-clamp-2 max-w-xs">{video.title}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`https://youtube.com/watch?v=${video.youtubeId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline text-xs font-mono"
                      >
                        {video.youtubeId}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td className="px-4 py-3 text-text-muted">{video.views}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(video)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-bg-raised hover:bg-primary/10 hover:text-primary text-text-muted transition"
                          aria-label="Chỉnh sửa"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openDelete(video)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-bg-raised hover:bg-red-500/10 hover:text-red-500 text-text-muted transition"
                          aria-label="Xóa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {(modalMode === 'add' || modalMode === 'edit') && (
          <VideoFormModal
            video={modalMode === 'edit' ? selected : null}
            onClose={() => { setModalMode(null); setSelected(null); }}
            onSave={handleSave}
          />
        )}
        {modalMode === 'delete' && selected && (
          <DeleteConfirm
            video={selected}
            onClose={() => { setModalMode(null); setSelected(null); }}
            onConfirm={handleDelete}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChannelManagement;
