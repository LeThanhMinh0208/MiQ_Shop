import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Loader, ArrowLeft, Zap, CheckCircle2 } from 'lucide-react';
import api from '../services/api.js';

const ForgotPassword = () => {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError('Vui lòng nhập email của bạn'); return; }
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: email.trim() });
      setSent(true);
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mb-10">
          <Zap className="w-7 h-7 text-primary fill-primary" />
          <span className="font-display text-2xl font-bold text-text-primary tracking-wider">MiQ SPORT</span>
        </Link>

        {sent ? (
          /* ── Success state ─────────────────────────────────────────────── */
          <div className="text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}>
              <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-5" />
            </motion.div>
            <h1 className="font-display text-3xl font-bold text-text-primary mb-3">Kiểm tra email</h1>
            <p className="text-text-muted leading-relaxed mb-2">
              Nếu email <span className="text-text-primary font-semibold">{email}</span> tồn tại trong hệ thống, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu.
            </p>
            <p className="text-sm text-text-muted mb-8">
              Liên kết có hiệu lực trong <span className="text-primary font-semibold">15 phút</span>. Kiểm tra thư mục spam nếu không thấy email.
            </p>
            <Link to="/login" className="btn-primary inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Quay lại đăng nhập
            </Link>
          </div>
        ) : (
          /* ── Request form ──────────────────────────────────────────────── */
          <>
            <div className="mb-8">
              <h1 className="font-display text-4xl font-bold text-text-primary mb-2">QUÊN MẬT KHẨU</h1>
              <p className="text-text-muted">Nhập email của bạn và chúng tôi sẽ gửi liên kết đặt lại mật khẩu.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    placeholder="ten@email.com"
                    autoComplete="email"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-bg-raised text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all ${
                      error ? 'border-red-400' : 'border-surface-border focus:border-primary'
                    }`}
                  />
                </div>
                {error && <p className="text-red-400 text-xs mt-1.5" role="alert">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary hover:bg-emerald-400 text-white font-bold text-sm tracking-wide transition-all shadow-button-primary hover:shadow-button-primary-hover disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? <><Loader className="w-4 h-4 animate-spin" /> Đang gửi...</> : 'Gửi hướng dẫn'}
              </button>
            </form>

            <p className="text-center text-sm text-text-muted mt-6">
              <Link to="/login" className="text-primary font-bold hover:underline flex items-center justify-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Quay lại đăng nhập
              </Link>
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
