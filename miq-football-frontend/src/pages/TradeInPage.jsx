import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, RefreshCw, ArrowLeft, Send, Upload, X, Image } from 'lucide-react';
import { submitTradeIn, uploadImageToCloudinary } from '../services/tradeInService.js';
import toast from 'react-hot-toast';

const CONDITIONS = [
  { id: 'nhu_moi',    label: 'Như mới (95%+)' },
  { id: 'tot',        label: 'Tốt (80–95%)' },
  { id: 'trung_binh', label: 'Trung bình (60–80%)' },
  { id: 'cu',         label: 'Cũ (dưới 60%)' },
];

const INITIAL = { name: '', phone: '', productType: '', condition: '', description: '' };

const TradeInPage = () => {
  const [form, setForm]         = useState(INITIAL);
  const [images, setImages]     = useState([]);   // [{ url, publicId, preview }]
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleFiles = async (files) => {
    if (images.length >= 3) { toast.error('Tối đa 3 ảnh'); return; }
    const remaining = 3 - images.length;
    const toUpload  = Array.from(files).slice(0, remaining);
    setUploading(true);
    try {
      const results = await Promise.all(
        toUpload.map(async (file) => {
          const preview = URL.createObjectURL(file);
          const { url, publicId } = await uploadImageToCloudinary(file);
          return { url, publicId, preview };
        }),
      );
      setImages((prev) => [...prev, ...results]);
    } catch {
      toast.error('Upload ảnh thất bại, vui lòng thử lại');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (idx) => setImages((prev) => prev.filter((_, i) => i !== idx));

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.productType || !form.condition) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }
    setLoading(true);
    try {
      await submitTradeIn({
        name:        form.name,
        phone:       form.phone,
        productType: form.productType,
        condition:   form.condition,
        description: form.description,
        images:      images.map(({ url, publicId }) => ({ url, publicId })),
      });
      setSubmitted(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const inputCls  = 'w-full bg-surface border border-surface-border rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition text-sm';
  const labelCls  = 'block text-xs font-bold uppercase tracking-widest text-text-muted mb-1.5';

  if (submitted) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-primary" />
          </div>
          <h2 className="font-display text-3xl font-bold text-text-primary mb-3">
            Yêu cầu đã được gửi!
          </h2>
          <p className="text-text-secondary text-base mb-2">
            Cảm ơn <strong className="text-text-primary">{form.name}</strong>! Yêu cầu định giá đã được gửi, chúng tôi sẽ báo giá sớm.
          </p>
          <p className="text-text-muted text-sm mb-8">
            Đội ngũ MiQ sẽ liên hệ qua số <strong>{form.phone}</strong> trong vòng 24 giờ.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              to="/"
              className="flex items-center gap-2 border-2 border-surface-border text-text-primary font-bold px-6 py-3 rounded-xl hover:border-primary hover:text-primary transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Trang chủ
            </Link>
            <Link
              to="/products"
              className="flex items-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-xl hover:shadow-neon transition"
            >
              Xem sản phẩm
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">

        <Link to="/" className="inline-flex items-center gap-2 text-text-muted hover:text-primary text-sm font-semibold mb-8 transition">
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-[0.22em] px-3.5 py-1.5 rounded-full mb-4">
            <RefreshCw className="w-3 h-3" />
            Thu Cũ Đổi Mới
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-text-primary mb-3">
            ĐĂNG KÝ THU ĐỔI
          </h1>
          <p className="text-text-secondary">
            Gửi thông tin và ảnh sản phẩm — đội ngũ MiQ sẽ định giá và liên hệ trong 24h.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="space-y-5 bg-surface border border-surface-border rounded-3xl p-7 shadow-[0_8px_40px_rgba(0,0,0,0.3)]"
        >
          {/* Name + phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Họ và tên *</label>
              <input required value={form.name} onChange={set('name')} placeholder="Nguyễn Văn A" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Số điện thoại *</label>
              <input required type="tel" value={form.phone} onChange={set('phone')} placeholder="0912 345 678" className={inputCls} />
            </div>
          </div>

          {/* Product type */}
          <div>
            <label className={labelCls}>Sản phẩm cần thu đổi *</label>
            <input
              required
              value={form.productType}
              onChange={set('productType')}
              placeholder="VD: Giày Nike Mercurial Vapor 15, Áo đấu MiQ Pro..."
              className={inputCls}
            />
          </div>

          {/* Condition */}
          <div>
            <label className={labelCls}>Tình trạng *</label>
            <select required value={form.condition} onChange={set('condition')} className={inputCls}>
              <option value="">-- Chọn tình trạng --</option>
              {CONDITIONS.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className={labelCls}>Mô tả thêm</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={set('description')}
              placeholder="Kích cỡ, màu sắc, lý do đổi, v.v."
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* Image upload */}
          <div>
            <label className={labelCls}>Ảnh sản phẩm (tối đa 3 ảnh)</label>

            {/* Drop zone */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => images.length < 3 && fileRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition cursor-pointer ${
                images.length >= 3
                  ? 'border-surface-border opacity-50 cursor-not-allowed'
                  : 'border-surface-border hover:border-primary/50 hover:bg-primary/5'
              }`}
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-2 text-text-muted">
                  <div className="w-7 h-7 border-2 border-surface-border border-t-primary rounded-full animate-spin" />
                  <span className="text-sm">Đang tải ảnh...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-text-muted">
                  <Upload className="w-8 h-8 opacity-40" />
                  <span className="text-sm font-medium">
                    {images.length >= 3 ? 'Đã đủ 3 ảnh' : 'Nhấn hoặc kéo thả ảnh vào đây'}
                  </span>
                  <span className="text-xs opacity-60">JPEG, PNG, WebP — tối đa 5MB mỗi ảnh</span>
                </div>
              )}
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />

            {/* Previews */}
            <AnimatePresence>
              {images.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 flex gap-3 flex-wrap"
                >
                  {images.map((img, idx) => (
                    <motion.div
                      key={img.url}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="relative w-24 h-24 rounded-xl overflow-hidden border border-surface-border group"
                    >
                      <img src={img.preview || img.url} alt={`Ảnh ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.div>
                  ))}
                  {images.length < 3 && (
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="w-24 h-24 rounded-xl border-2 border-dashed border-surface-border hover:border-primary/50 flex flex-col items-center justify-center gap-1 text-text-muted hover:text-primary transition"
                    >
                      <Image className="w-5 h-5 opacity-50" />
                      <span className="text-[10px]">Thêm ảnh</span>
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            type="submit"
            disabled={loading || uploading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold uppercase tracking-wider py-4 rounded-2xl hover:shadow-neon transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                Gửi yêu cầu định giá
              </>
            )}
          </motion.button>
        </motion.form>
      </div>
    </div>
  );
};

export default TradeInPage;
