import { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader, Eye, EyeOff, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore.js';
import { useLanguageStore } from '../store/languageStore.js';


const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading } = useAuthStore();
  const t = useLanguageStore((s) => s.t);
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const emailRef = useRef(null);

  const from = location.state?.from?.pathname || '/';

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Vui lòng nhập email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email không hợp lệ';
    if (!form.password) e.password = 'Vui lòng nhập mật khẩu';
    setErrors(e);
    if (e.email) emailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const result = await login(form.email, form.password);
    if (result.success) {
      toast.success(t('success') + '!');
      navigate(from, { replace: true });
    } else {
      toast.error(result.message || t('error'));
    }
  };

  const field = (key) => ({
    value: form[key],
    onChange: (e) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
      if (errors[key]) setErrors((er) => ({ ...er, [key]: '' }));
    },
  });

  return (
    <div className="min-h-screen bg-bg-base flex">
      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden items-center justify-center bg-gray-950">
        <img
          src="https://images.unsplash.com/photo-1556816213-354f814c80d9?w=1200&q=80"
          alt="Football"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950/80 via-emerald-950/50 to-gray-950/90" />
        <div className="relative z-10 p-12 max-w-md">
          <div className="flex items-center gap-2 mb-8">
            <Zap className="w-8 h-8 text-primary fill-primary" />
            <span className="font-display text-3xl font-bold text-white tracking-wider">MiQ SPORT</span>
          </div>
          <h2 className="font-display text-5xl font-bold text-white leading-tight mb-4">
            {t('heroBig1')}<br />
            <span className="text-primary">{t('heroBig2')}</span>
          </h2>
          <p className="text-white/60 text-lg leading-relaxed">
            {t('heroTagline1')}
          </p>
          <div className="mt-10 flex items-center gap-4">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-9 h-9 rounded-full border-2 border-gray-900 overflow-hidden bg-gray-700">
                  <img src={`https://i.pravatar.cc/40?img=${i + 10}`} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div>
              <p className="text-white font-bold text-sm">50,000+ {t('heroStat2')}</p>
              <p className="text-white/50 text-xs">{t('heroTagline1')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-bg-base">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <Zap className="w-7 h-7 text-primary fill-primary" />
            <span className="font-display text-2xl font-bold text-text-primary tracking-wider">MiQ SPORT</span>
          </div>

          <div className="mb-8">
            <h1 className="font-display text-4xl font-bold text-text-primary mb-2">{t('signIn').toUpperCase()}</h1>
            <p className="text-text-muted">{t('welcomeBack')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-1.5">{t('email')}</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none" />
                <input
                  ref={emailRef}
                  data-testid="login-email"
                  type="email"
                  placeholder="ten@email.com"
                  autoComplete="email"
                  {...field('email')}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-bg-raised text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all ${
                    errors.email ? 'border-red-400' : 'border-surface-border focus:border-primary'
                  }`}
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1.5">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-text-secondary">{t('password')}</label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline font-medium">
                  {t('forgotPassword')}
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none" />
                <input
                  data-testid="login-password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
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
              {errors.password && <p className="text-red-400 text-xs mt-1.5">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary hover:bg-emerald-400 text-white font-bold text-sm tracking-wide transition-all shadow-button-primary hover:shadow-button-primary-hover disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><Loader className="w-4 h-4 animate-spin" /> {t('loading')}</>
              ) : (
                t('signIn').toUpperCase()
              )}
            </button>
          </form>

          <p className="text-center text-sm text-text-muted mt-6">
            {t('noAccount')}{' '}
            <Link to="/register" className="text-primary font-bold hover:underline">
              {t('signUp')}
            </Link>
          </p>

          <p className="text-center text-xs text-text-muted mt-6 leading-relaxed">
            {t('loginSubtitle')}{' — '}
            <Link to="/terms" className="text-primary hover:underline">{t('terms')}</Link>{' & '}
            <Link to="/privacy" className="text-primary hover:underline">{t('privacyPolicy')}</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
