import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save, RefreshCw, ImagePlay, Upload, Eye, EyeOff,
  Wand2, CheckCircle2, AlertTriangle, X, SplitSquareHorizontal,
} from 'lucide-react';
import toast from 'react-hot-toast';

const STORAGE_KEY   = 'miq-hero-config';
const CLOUD_NAME    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUD_PRESET  = import.meta.env.VITE_CLOUDINARY_PRESET;
const UPLOAD_URL    = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

const DEFAULT_CONFIG = {
  badge:        'Mùa giải mới 2024/25',
  eyebrow:      'Bước chân đầu tiên của giấc mơ',
  line1:        'BẮT ĐẦU',
  line2:        'TỪ ĐÂY',
  tagline1:     'Trang bị đẳng cấp — Thi đấu đỉnh cao',
  tagline2:     'Giày, áo đấu & phụ kiện bóng đá cao cấp nhất 2026',
  cta1Label:    'MUA NGAY',
  cta1Link:     '/products',
  cta2Label:    'Xem bộ sưu tập',
  cta2Link:     '/products',
  stat1Val:     500,
  stat1Label:   'Sản phẩm',
  stat2Val:     50,
  stat2Label:   'Khách hàng',
  stat3Val:     4.9,
  stat3Label:   'Đánh giá',
  shoeImageUrl: '',
  videoPoster:  'https://images.unsplash.com/photo-1522778526097-ce0a22ceb253?w=1920&q=80',
};

// Build Cloudinary background-removal URL from a normal upload URL
// e_background_removal: Cloudinary AI tách nền (25 lần/tháng free)
// f_png: bắt buộc PNG để giữ transparency
const buildBgRemovedUrl = (originalUrl) =>
  originalUrl
    .replace('/upload/', '/upload/e_background_removal,f_png/')
    .replace(/\.[^./?#]+(\?.*)?$/, '.png');

// Preload a URL — returns Promise<boolean> (true = loaded OK)
const probeImage = (url) =>
  new Promise((resolve) => {
    const img = new window.Image();
    img.onload  = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url + '?_t=' + Date.now(); // bypass cache on probe
  });

// ── Field ─────────────────────────────────────────────────────────────────────
const Field = ({ label, value, onChange, type = 'text', hint }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-bold uppercase tracking-wider text-text-muted">{label}</label>
    {type === 'textarea' ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        className="w-full rounded-xl border border-surface-border bg-bg-raised px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none transition"
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
        className="w-full rounded-xl border border-surface-border bg-bg-raised px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
      />
    )}
    {hint && <p className="text-[11px] text-text-muted">{hint}</p>}
  </div>
);

// ── ShoeImageUpload ───────────────────────────────────────────────────────────
// Chuyên biệt cho ảnh giày: upload → tách nền AI → before/after preview
const STAGES = {
  idle:       null,
  uploading:  'Đang tải ảnh lên Cloudinary...',
  removing:   'AI đang tách nền sản phẩm...',
  verifying:  'Đang xác nhận kết quả...',
  done:       'Hoàn thành!',
  error:      null,
};

const ShoeImageUpload = ({ value, onChange }) => {
  const [stage,       setStage]       = useState('idle');
  const [origUrl,     setOrigUrl]     = useState('');   // ảnh gốc
  const [bgUrl,       setBgUrl]       = useState('');   // ảnh đã tách nền
  const [bgFailed,    setBgFailed]    = useState(false);
  const [viewMode,    setViewMode]    = useState('split'); // 'split' | 'before' | 'after'
  const [sliderPct,   setSliderPct]   = useState(50);
  const sliderRef = useRef(null);

  const busy = stage !== 'idle' && stage !== 'done' && stage !== 'error';

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    // Reset state
    setOrigUrl(''); setBgUrl(''); setBgFailed(false);
    setStage('uploading');

    try {
      // ── 1. Upload gốc ──────────────────────────────────────────────────────
      const fd = new FormData();
      fd.append('file', file);
      fd.append('upload_preset', CLOUD_PRESET);
      fd.append('folder', 'miq-sport/hero');
      const res  = await fetch(UPLOAD_URL, { method: 'POST', body: fd });
      const data = await res.json();
      if (!data.secure_url) throw new Error(data.error?.message || 'Upload thất bại');

      const original = data.secure_url;
      setOrigUrl(original);

      // ── 2. Xây URL tách nền ────────────────────────────────────────────────
      setStage('removing');
      const bgRemoved = buildBgRemovedUrl(original);
      setBgUrl(bgRemoved);

      // ── 3. Probe để chắc chắn Cloudinary đã xử lý xong ──────────────────
      // Cloudinary xử lý đồng bộ nhưng có thể mất 2-8 giây
      setStage('verifying');
      let ok = false;
      for (let attempt = 0; attempt < 6; attempt++) {
        await new Promise((r) => setTimeout(r, attempt === 0 ? 2000 : 1500));
        ok = await probeImage(bgRemoved);
        if (ok) break;
      }

      if (ok) {
        // ── 4. Thành công → lưu URL đã tách nền ────────────────────────────
        onChange(bgRemoved);
        setStage('done');
        toast.success('Tách nền thành công! Đã cập nhật ảnh giày.');
      } else {
        // Cloudinary bg removal add-on chưa kích hoạt → dùng ảnh gốc
        setBgFailed(true);
        onChange(original);
        setStage('done');
        toast('Tách nền chưa khả dụng — đã dùng ảnh gốc. Kích hoạt Cloudinary Background Removal add-on để dùng tính năng này.', {
          icon: '⚠️', duration: 6000,
        });
      }
    } catch (err) {
      setStage('error');
      toast.error('Lỗi: ' + err.message);
    }
  };

  // Kéo thanh slider before/after
  const onSliderDrag = (e) => {
    const rect = sliderRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX ?? e.touches?.[0]?.clientX ?? 0) - rect.left;
    setSliderPct(Math.max(0, Math.min(100, (x / rect.width) * 100)));
  };

  const hasResult = stage === 'done' || (origUrl && bgUrl);

  return (
    <div className="space-y-4">
      {/* Label + upload button */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-text-muted">Ảnh sản phẩm (giày)</p>
          <p className="text-[11px] text-text-muted mt-0.5">Upload → AI tự động tách nền → nền trong suốt</p>
        </div>
        <label className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition select-none ${
          busy ? 'bg-bg-raised text-text-muted cursor-not-allowed' : 'bg-primary text-white hover:bg-primary/90 shadow-md shadow-primary/20'
        }`}>
          {busy ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Upload className="w-3.5 h-3.5" />
          )}
          {busy ? STAGES[stage] : 'Chọn ảnh & tách nền'}
          <input type="file" accept="image/*" className="sr-only" onChange={handleFile} disabled={busy} />
        </label>
      </div>

      {/* Progress bar */}
      <AnimatePresence>
        {busy && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-xl bg-primary/5 border border-primary/20 p-4"
          >
            <div className="flex items-center gap-3 mb-3">
              <Wand2 className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-sm font-semibold text-primary">{STAGES[stage]}</span>
            </div>
            <div className="h-1.5 bg-bg-raised rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: '5%' }}
                animate={{ width: stage === 'uploading' ? '35%' : stage === 'removing' ? '65%' : '90%' }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
            </div>
            <div className="flex gap-4 mt-3">
              {['uploading', 'removing', 'verifying'].map((s, i) => (
                <div key={s} className="flex items-center gap-1.5">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                    ['uploading', 'removing', 'verifying'].indexOf(stage) > i
                      ? 'bg-primary text-white'
                      : stage === s
                        ? 'bg-primary/20 text-primary ring-2 ring-primary/50'
                        : 'bg-bg-raised text-text-muted'
                  }`}>{i + 1}</div>
                  <span className={`text-[10px] font-semibold ${stage === s ? 'text-primary' : 'text-text-muted'}`}>
                    {s === 'uploading' ? 'Upload' : s === 'removing' ? 'Tách nền' : 'Xác nhận'}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Before / After preview */}
      <AnimatePresence>
        {hasResult && origUrl && bgUrl && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {/* Status banner */}
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold ${
              bgFailed
                ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                : 'bg-primary/8 text-primary border border-primary/20'
            }`}>
              {bgFailed
                ? <><AlertTriangle className="w-4 h-4" /> Tách nền chưa khả dụng — đang dùng ảnh gốc. Kích hoạt Cloudinary Background Removal add-on.</>
                : <><CheckCircle2 className="w-4 h-4" /> Tách nền thành công — nền đã trong suốt (PNG)</>
              }
            </div>

            {/* View mode tabs */}
            <div className="flex gap-1 p-1 bg-bg-raised rounded-xl w-fit border border-surface-border">
              {[
                { key: 'split',  icon: SplitSquareHorizontal, label: 'So sánh' },
                { key: 'before', icon: Eye,                    label: 'Gốc' },
                { key: 'after',  icon: Wand2,                  label: 'Đã tách nền' },
              ].map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  onClick={() => setViewMode(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    viewMode === key ? 'bg-bg-elevated text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" /> {label}
                </button>
              ))}
            </div>

            {/* Preview area */}
            <div
              ref={sliderRef}
              className="relative rounded-2xl overflow-hidden border border-surface-border select-none"
              style={{ height: 280, background: 'repeating-conic-gradient(#e5e7eb 0% 25%, white 0% 50%) 0 0 / 20px 20px' }}
              onMouseMove={viewMode === 'split' ? onSliderDrag : undefined}
              onTouchMove={viewMode === 'split' ? onSliderDrag : undefined}
            >
              {viewMode === 'before' && (
                <img src={origUrl} alt="Gốc" className="w-full h-full object-contain" />
              )}

              {viewMode === 'after' && (
                <img src={bgUrl} alt="Đã tách nền" className="w-full h-full object-contain" />
              )}

              {viewMode === 'split' && (
                <>
                  {/* Left: original */}
                  <div className="absolute inset-0">
                    <img src={origUrl} alt="Gốc" className="w-full h-full object-contain" />
                  </div>
                  {/* Right: bg removed (clipped) */}
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ clipPath: `inset(0 ${100 - sliderPct}% 0 0)` }}
                  >
                    <img src={bgUrl} alt="Đã tách nền" className="w-full h-full object-contain" />
                  </div>
                  {/* Divider */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10 cursor-col-resize"
                    style={{ left: `${sliderPct}%` }}
                  >
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 bg-white rounded-full shadow-depth-lg flex items-center justify-center">
                      <SplitSquareHorizontal className="w-3.5 h-3.5 text-gray-600" />
                    </div>
                  </div>
                  {/* Labels */}
                  <div className="absolute bottom-2 left-3 text-[10px] font-bold text-white bg-black/50 px-2 py-0.5 rounded-full pointer-events-none">Gốc</div>
                  <div className="absolute bottom-2 right-3 text-[10px] font-bold text-white bg-primary/80 px-2 py-0.5 rounded-full pointer-events-none">Đã tách nền</div>
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-white/70 pointer-events-none">← Kéo để so sánh →</div>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {!bgFailed && (
                <button
                  onClick={() => { onChange(bgUrl); toast.success('Đã dùng ảnh tách nền'); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary/90 transition"
                >
                  <Wand2 className="w-3.5 h-3.5" /> Dùng ảnh tách nền
                </button>
              )}
              <button
                onClick={() => { onChange(origUrl); toast('Đã dùng ảnh gốc'); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border border-surface-border text-text-secondary hover:bg-bg-raised transition"
              >
                <Eye className="w-3.5 h-3.5" /> Dùng ảnh gốc
              </button>
              <button
                onClick={() => { setOrigUrl(''); setBgUrl(''); setStage('idle'); onChange(''); }}
                className="ml-auto flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-500/10 transition"
              >
                <X className="w-3.5 h-3.5" /> Xóa
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current value (URL field) */}
      {!hasResult && (
        <div className="space-y-1.5">
          <label className="block text-[11px] text-text-muted">Hoặc dán URL trực tiếp</label>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://res.cloudinary.com/..."
            className="w-full rounded-xl border border-surface-border bg-bg-raised px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
          />
          {value && (
            <div className="rounded-xl border border-surface-border overflow-hidden h-40 flex items-center justify-center"
              style={{ background: 'repeating-conic-gradient(#e5e7eb 0% 25%, white 0% 50%) 0 0 / 20px 20px' }}>
              <img src={value} alt="preview" className="max-h-full max-w-full object-contain" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Generic image upload (poster / other) ─────────────────────────────────────
const ImageUploadField = ({ label, value, onChange, hint }) => {
  const [uploading, setUploading] = useState(false);
  const [preview,   setPreview]   = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('upload_preset', CLOUD_PRESET);
      const res  = await fetch(UPLOAD_URL, { method: 'POST', body: fd });
      const data = await res.json();
      if (!data.secure_url) throw new Error(data.error?.message || 'Upload failed');
      onChange(data.secure_url);
      toast.success('Ảnh đã tải lên');
    } catch (err) {
      toast.error('Tải ảnh thất bại: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold uppercase tracking-wider text-text-muted">{label}</label>
      <div className="flex gap-2 items-start">
        <div className="flex-1 space-y-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://..."
            className="w-full rounded-xl border border-surface-border bg-bg-raised px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
          />
          <label className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition ${uploading ? 'bg-surface text-text-muted' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}>
            {uploading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            {uploading ? 'Đang tải...' : 'Tải ảnh lên'}
            <input type="file" accept="image/*" className="sr-only" onChange={handleFile} disabled={uploading} />
          </label>
        </div>
        {value && (
          <button type="button" onClick={() => setPreview((v) => !v)}
            className="p-2 rounded-lg border border-surface-border text-text-muted hover:text-primary transition">
            {preview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {preview && value && (
        <div className="rounded-xl overflow-hidden border border-surface-border h-40 bg-bg-base flex items-center justify-center">
          <img src={value} alt="preview" className="max-h-full max-w-full object-contain" />
        </div>
      )}
      {hint && <p className="text-[11px] text-text-muted">{hint}</p>}
    </div>
  );
};

// ── Section wrapper ───────────────────────────────────────────────────────────
const Section = ({ title, children }) => (
  <div className="bg-bg-elevated rounded-2xl border border-surface-border p-6 space-y-4">
    <h2 className="font-display text-sm font-bold uppercase tracking-widest text-text-muted">{title}</h2>
    {children}
  </div>
);

// ── Main ──────────────────────────────────────────────────────────────────────
const HeroManagement = () => {
  const [config, setConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...DEFAULT_CONFIG, ...JSON.parse(saved) } : DEFAULT_CONFIG;
    } catch { return DEFAULT_CONFIG; }
  });
  const [dirty, setDirty] = useState(false);

  const set = (key, val) => { setConfig((c) => ({ ...c, [key]: val })); setDirty(true); };

  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      setDirty(false);
      toast.success('Đã lưu cấu hình Hero Section');
    } catch { toast.error('Lưu thất bại'); }
  };

  const handleReset = () => {
    if (!window.confirm('Đặt lại về mặc định?')) return;
    setConfig(DEFAULT_CONFIG);
    localStorage.removeItem(STORAGE_KEY);
    setDirty(false);
    toast.success('Đã đặt lại mặc định');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ImagePlay className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-text-primary">Hero Section</h1>
            <p className="text-xs text-text-muted">Tuỳ chỉnh nội dung trang chủ</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-text-muted hover:bg-bg-raised border border-surface-border transition">
            <RefreshCw className="w-4 h-4" /> Đặt lại
          </button>
          <button onClick={handleSave}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition ${
              dirty
                ? 'bg-primary text-white hover:bg-primary/90 shadow-md shadow-primary/30'
                : 'bg-bg-raised text-text-muted border border-surface-border'
            }`}>
            <Save className="w-4 h-4" /> Lưu thay đổi
            {dirty && <span className="w-2 h-2 rounded-full bg-amber-400 ml-1" />}
          </button>
        </div>
      </div>

      {/* Ảnh sản phẩm — tách nền AI */}
      <Section title="🪄 Ảnh sản phẩm — Tách nền tự động">
        <ShoeImageUpload
          value={config.shoeImageUrl}
          onChange={(v) => set('shoeImageUrl', v)}
        />
        <p className="text-[11px] text-text-muted">
          Để trống → dùng mô hình giày 3D xoay mặc định. Tải ảnh lên → AI tách nền → hiển thị sản phẩm nổi bật trên Hero.
        </p>
      </Section>

      {/* Badge & Eyebrow */}
      <Section title="Nhãn & Phụ đề">
        <Field label="Badge (nhãn nhỏ)" value={config.badge} onChange={(v) => set('badge', v)}
          hint="Ví dụ: Mùa giải mới 2025/26" />
        <Field label="Phụ đề eyebrow" value={config.eyebrow} onChange={(v) => set('eyebrow', v)}
          hint="Dòng chữ nhỏ bên dưới badge" />
      </Section>

      {/* Main headline */}
      <Section title="Tiêu đề chính">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Dòng 1 (gradient màu)" value={config.line1} onChange={(v) => set('line1', v)} />
          <Field label="Dòng 2 (màu chữ chính)" value={config.line2} onChange={(v) => set('line2', v)} />
        </div>
        <div className="p-4 rounded-xl bg-gray-900 text-center space-y-1">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Preview</p>
          <p className="font-black text-3xl" style={{
            background: 'linear-gradient(135deg,#C2410C,#EA580C,#D4AF37)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>{config.line1 || 'BẮT ĐẦU'}</p>
          <p className="font-black text-3xl text-white">{config.line2 || 'TỪ ĐÂY'}</p>
        </div>
      </Section>

      {/* Taglines */}
      <Section title="Tagline">
        <Field label="Dòng tagline 1 (chính)" value={config.tagline1} onChange={(v) => set('tagline1', v)} />
        <Field label="Dòng tagline 2 (phụ)"  value={config.tagline2} onChange={(v) => set('tagline2', v)} />
      </Section>

      {/* CTAs */}
      <Section title="Nút CTA">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nút chính — Label" value={config.cta1Label} onChange={(v) => set('cta1Label', v)} />
          <Field label="Nút chính — Link"  value={config.cta1Link}  onChange={(v) => set('cta1Link', v)} />
          <Field label="Nút phụ — Label"   value={config.cta2Label} onChange={(v) => set('cta2Label', v)} />
          <Field label="Nút phụ — Link"    value={config.cta2Link}  onChange={(v) => set('cta2Link', v)} />
        </div>
      </Section>

      {/* Stats */}
      <Section title="Số liệu thống kê">
        <div className="grid grid-cols-3 gap-4">
          {[
            { valKey: 'stat1Val', labelKey: 'stat1Label', suffix: '+' },
            { valKey: 'stat2Val', labelKey: 'stat2Label', suffix: 'K+' },
            { valKey: 'stat3Val', labelKey: 'stat3Label', suffix: '★' },
          ].map(({ valKey, labelKey, suffix }) => (
            <div key={valKey} className="space-y-2">
              <Field label={`Giá trị (${suffix})`} value={config[valKey]}    onChange={(v) => set(valKey, v)}    type="number" />
              <Field label="Nhãn"                   value={config[labelKey]} onChange={(v) => set(labelKey, v)} />
            </div>
          ))}
        </div>
      </Section>

      {/* Video poster */}
      <Section title="Video Background">
        <ImageUploadField
          label="Ảnh poster (fallback khi video chưa tải)"
          value={config.videoPoster}
          onChange={(v) => set('videoPoster', v)}
          hint="Hiển thị thay cho video hero khi mạng chậm hoặc chưa load xong."
        />
      </Section>

      <p className="text-xs text-text-muted text-center pb-4">
        Cấu hình lưu trong localStorage. Tích hợp API backend để lưu vĩnh viễn trên server.
      </p>
    </div>
  );
};

export default HeroManagement;
