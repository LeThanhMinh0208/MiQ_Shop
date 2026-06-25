import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Loader, Eye, EyeOff, Zap, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore.js';
import { useLanguageStore } from '../store/languageStore.js';

const PasswordStrength = ({ password, t }) => {
  const checks = [
    { label: 'Min. 8 chars', ok: password.length >= 8 },
    { label: 'Uppercase',    ok: /[A-Z]/.test(password) },
    { label: 'Number',       ok: /\d/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const bar = ['', 'bg-red-400', 'bg-amber-400', 'bg-emerald-500'][score] || '';
  const label = ['', t('weak'), t('medium'), t('strong')][score] || '';

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < score ? bar : 'bg-surface-border'}`} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          {checks.map((c) => (
            <span key={c.label} className={`text-[10px] flex items-center gap-1 ${c.ok ? 'text-emerald-500' : 'text-text-muted'}`}>
              <CheckCircle2 className="w-3 h-3" /> {c.label}
            </span>
          ))}
        </div>
        <span className={`text-[10px] font-bold ${bar.replace('bg-', 'text-')}`}>{label}</span>
      </div>
    </div>
  );
};


const Register = () => {
  const navigate = useNavigate();
  const { register, loading } = useAuthStore();
  const t = useLanguageStore((s) => s.t);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [agreed, setAgreed] = useState(false);
  const [debouncedPassword, setDebouncedPassword] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedPassword(form.password), 300);
    return () => clearTimeout(timer);
  }, [form.password]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = t('fullNameLabel') + ' required';
    else if (form.name.trim().length < 2) e.name = 'Min. 2 characters';
    if (!form.email) e.email = t('email') + ' required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = t('error') + ': ' + t('email');
    if (!form.password) e.password = t('password') + ' required';
    else if (form.password.length < 8) e.password = t('weak') + ' — min. 8 chars';
    if (!form.confirm) e.confirm = t('confirmPassword') + ' required';
    else if (form.confirm !== form.password) e.confirm = t('error') + ': password mismatch';
    if (!agreed) e.agreed = t('agreeTerms');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const result = await register(form.name.trim(), form.email, form.password);
    if (result.success) {
      toast.success(t('success') + '! ' + t('welcomeBack') + '!');
      navigate('/');
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
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[45%] relative overflow-hidden items-center justify-center bg-gray-950">
        <img
          src="https://images.unsplash.com/photo-1587329310686-91414b8e3cb7?w=1200&q=80"
          alt="Football"
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950/85 via-emerald-950/60 to-gray-950" />
        <div className="relative z-10 p-12 max-w-sm">
          <div className="flex items-center gap-2 mb-8">
            <Zap className="w-8 h-8 text-primary fill-primary" />
            <span className="font-display text-3xl font-bold text-white tracking-wider">MiQ SPORT</span>
          </div>

          <div className="space-y-5">
            {[
              { icon: '🏆', title: '100% ' + t('instock'), desc: t('heroTagline1') },
              { icon: '🚚', title: t('freeShipping') + ' 500K', desc: '24-48h HCM & Hanoi' },
              { icon: '🔄', title: t('tradeIn') + ' 30 days', desc: t('sizeGuide') },
              { icon: '💎', title: 'MiQ Member', desc: t('tradeInSub') },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <span className="text-2xl mt-0.5">{item.icon}</span>
                <div>
                  <p className="font-bold text-white text-sm">{item.title}</p>
                  <p className="text-white/50 text-xs">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-8 bg-bg-base overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <Zap className="w-7 h-7 text-primary fill-primary" />
            <span className="font-display text-2xl font-bold text-text-primary tracking-wider">MiQ SPORT</span>
          </div>

          <div className="mb-6">
            <h1 className="font-display text-4xl font-bold text-text-primary mb-2">{t('signUp').toUpperCase()}</h1>
            <p className="text-text-muted">{t('registerSubtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-1.5">{t('fullNameLabel')}</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none" />
                <input
                  type="text"
                  placeholder="John Doe"
                  autoComplete="name"
                  {...field('name')}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-bg-raised text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all ${
                    errors.name ? 'border-red-400' : 'border-surface-border focus:border-primary'
                  }`}
                />
              </div>
              {errors.name && <p className="text-red-400 text-xs mt-1.5">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-1.5">{t('email')}</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none" />
                <input
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
              <label className="block text-sm font-semibold text-text-secondary mb-1.5">{t('password')}</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none" />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
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
              {errors.password && <p className="text-red-400 text-xs mt-1.5">{errors.password}</p>}
              <PasswordStrength password={debouncedPassword} t={t} />
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-1.5">{t('confirmPassword')}</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  {...field('confirm')}
                  className={`w-full pl-10 pr-11 py-3 rounded-xl border bg-bg-raised text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all ${
                    errors.confirm ? 'border-red-400'
                    : form.confirm && form.confirm === form.password ? 'border-emerald-400'
                    : 'border-surface-border focus:border-primary'
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
              {errors.confirm && <p className="text-red-400 text-xs mt-1.5">{errors.confirm}</p>}
              {form.confirm && form.confirm === form.password && !errors.confirm && (
                <p className="text-emerald-500 text-xs mt-1.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> {t('confirmPassword')} ✓
                </p>
              )}
            </div>

            {/* Terms */}
            <div>
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => { setAgreed(e.target.checked); if (errors.agreed) setErrors((er) => ({ ...er, agreed: '' })); }}
                  className="w-4 h-4 rounded accent-primary cursor-pointer mt-0.5 flex-shrink-0"
                />
                <span className="text-sm text-text-secondary leading-snug">
                  {t('agreeTerms')}{' — '}
                  <Link to="/terms" className="text-primary hover:underline">{t('terms')}</Link>{' & '}
                  <Link to="/privacy" className="text-primary hover:underline">{t('privacyPolicy')}</Link>
                </span>
              </label>
              {errors.agreed && <p className="text-red-400 text-xs mt-1.5">{errors.agreed}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary hover:bg-emerald-400 text-white font-bold text-sm tracking-wide transition-all shadow-button-primary hover:shadow-button-primary-hover disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><Loader className="w-4 h-4 animate-spin" /> {t('loading')}</>
              ) : (
                t('createAccount').toUpperCase()
              )}
            </button>
          </form>

          <p className="text-center text-sm text-text-muted mt-5">
            {t('hasAccount')}{' '}
            <Link to="/login" className="text-primary font-bold hover:underline">
              {t('signIn')}
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
