import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Loader, Eye, EyeOff, Zap, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api.js';

const ResetPassword = () => {
  const { token }  = useParams();
  const navigate   = useNavigate();
  const [form, setForm]       = useState({ password: '', confirm: '' });
  const [showPass, setShowPass]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});

  const validate = () => {
    const e = {};
    if (!form.password)              e.password = 'Vui lòng nhập mật khẩu mới';
    else if (form.password.length < 8) e.password = 'Mật khẩu phải có ít nhất 8 ký tự';
    if (form.password !== form.confirm) e.confirm = 'Mật khẩu xác nhận không khớp';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password: form.password });
      toast.success('Đặt lại mật khẩu thành công!');
      navigate('/login', { replace: true });
    } catch (err) {
      setErrors({ submit: err.message || 'Liên kết không hợp lệ hoặc đã hết hạn' });
    } finally {
      setLoading(false);
    }
  };

  const field = (key) => ({
    value: form[key],
    onChange: (e) => { setForm((f) => ({ ...f, [key]: e.target.value })); setErrors((er) => ({ ...er, [key]: '' })); },
  });

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

        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold text-text-primary mb-2">ĐẶT LẠI MẬT KHẨU</h1>
          <p className="text-text-muted">Tạo mật khẩu mới cho tài khoản của bạn.</p>
        </div>

        {errors.submit && (
          <div className="mb-5 bg-red-500/10 border border-red-500/30 rounded-xl p-4" role="alert">
            <p className="text-red-400 text-sm font-medium">{errors.submit}</p>
            <Link to="/forgot-password" className="text-primary text-xs font-semibold hover:underline mt-1 inline-block">
              Yêu cầu liên kết mới
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* New password */}
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1.5">Mật khẩu mới</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none" />
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Tối thiểu 8 ký tự"
                autoComplete="new-password"
                {...field('password')}
                className={`w-full pl-10 pr-11 py-3 rounded-xl border bg-bg-raised text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all ${
                  errors.password ? 'border-red-400' : 'border-surface-border focus:border-primary'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition"
              >
                {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && <p className="text-red-400 text-xs mt-1.5" role="alert">{errors.password}</p>}
          </div>

          {/* Confirm */}
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1.5">Xác nhận mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none" />
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Nhập lại mật khẩu"
                autoComplete="new-password"
                {...field('confirm')}
                className={`w-full pl-10 pr-11 py-3 rounded-xl border bg-bg-raised text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all ${
                  errors.confirm ? 'border-red-400' : 'border-surface-border focus:border-primary'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition"
              >
                {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.confirm && <p className="text-red-400 text-xs mt-1.5" role="alert">{errors.confirm}</p>}
          </div>

          {/* Password match indicator */}
          {form.password && form.confirm && form.password === form.confirm && (
            <p className="text-emerald-500 text-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Mật khẩu khớp
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary hover:bg-emerald-400 text-white font-bold text-sm tracking-wide transition-all shadow-button-primary hover:shadow-button-primary-hover disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? <><Loader className="w-4 h-4 animate-spin" /> Đang lưu...</> : 'Đặt lại mật khẩu'}
          </button>
        </form>

        <p className="text-center text-sm text-text-muted mt-6">
          <Link to="/login" className="text-primary font-bold hover:underline">Quay lại đăng nhập</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
