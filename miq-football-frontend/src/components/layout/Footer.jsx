import { Link } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle } from 'lucide-react';
import Logo from '../ui/Logo.jsx';
import { useLanguageStore } from '../../store/languageStore.js';

// ── Inline social SVGs ─────────────────────────────────────────────────────
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4.5 h-4.5" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4.5 h-4.5" fill="currentColor">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
  </svg>
);
const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4.5 h-4.5" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.75a8.24 8.24 0 0 0 4.83 1.55V6.85a4.85 4.85 0 0 1-1.06-.16z" />
  </svg>
);

// ── Payment method badges (inline SVG — no external image dependencies) ─────
const PayVisa = () => (
  <svg viewBox="0 0 48 16" className="h-5 w-auto"><rect width="48" height="16" rx="3" fill="#1A1F71"/><text x="5" y="12" fontFamily="Arial,sans-serif" fontWeight="bold" fontSize="11" fill="#FFF">VISA</text></svg>
);
const PayMastercard = () => (
  <svg viewBox="0 0 48 30" className="h-5 w-auto"><rect width="48" height="30" rx="4" fill="#252525"/>
    <circle cx="18" cy="15" r="9" fill="#EB001B" opacity="0.9"/>
    <circle cx="30" cy="15" r="9" fill="#F79E1B" opacity="0.9"/>
    <ellipse cx="24" cy="15" rx="3" ry="9" fill="#FF5F00" opacity="0.9"/>
  </svg>
);
const PayMomo = () => (
  <svg viewBox="0 0 48 30" className="h-5 w-auto"><rect width="48" height="30" rx="4" fill="#AE2070"/><text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" fontFamily="Arial,sans-serif" fontWeight="bold" fontSize="10" fill="#FFF">MoMo</text></svg>
);
const PayZalo = () => (
  <svg viewBox="0 0 48 30" className="h-5 w-auto"><rect width="48" height="30" rx="4" fill="#0068FF"/><text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" fontFamily="Arial,sans-serif" fontWeight="bold" fontSize="9" fill="#FFF">ZaloPay</text></svg>
);
const PayVNPay = () => (
  <svg viewBox="0 0 48 30" className="h-5 w-auto"><rect width="48" height="30" rx="4" fill="#002B7F"/><text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" fontFamily="Arial,sans-serif" fontWeight="bold" fontSize="8.5" fill="#FFF">VNPAY</text></svg>
);
const PayCOD = () => (
  <svg viewBox="0 0 48 30" className="h-5 w-auto"><rect width="48" height="30" rx="4" fill="#1F2937"/><text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" fontFamily="Arial,sans-serif" fontWeight="bold" fontSize="9" fill="#10B981">COD</text></svg>
);
const PayBank = () => (
  <svg viewBox="0 0 48 30" className="h-5 w-auto"><rect width="48" height="30" rx="4" fill="#0F4C81"/><text x="50%" y="48%" textAnchor="middle" dominantBaseline="middle" fontFamily="Arial,sans-serif" fontWeight="bold" fontSize="7" fill="#FFF">Chuyển</text><text x="50%" y="72%" textAnchor="middle" dominantBaseline="middle" fontFamily="Arial,sans-serif" fontWeight="bold" fontSize="7" fill="#FFF">Khoản</text></svg>
);

// ── Data ──────────────────────────────────────────────────────────────────
const PAYMENT_METHODS = [
  { name: 'Visa',        Comp: PayVisa },
  { name: 'Mastercard',  Comp: PayMastercard },
  { name: 'Chuyển khoản',Comp: PayBank },
  { name: 'COD',         Comp: PayCOD },
];

// Keys for nav links — labels resolved via t() inside Footer
const SUPPORT_LINK_KEYS = [
  { key: 'faq',       to: '#' },
  { key: 'tradeIn',   to: '#' },
  { key: 'sizeGuide', to: '#' },
  { key: 'orders',    to: '#' },
  { key: 'myOrders',  to: '/profile' },
];

const QUICK_LINK_KEYS = [
  { key: 'home',        to: '/' },
  { key: 'boots',       to: '/products?category=football-boots' },
  { key: 'kits',        to: '/products?category=club-kits' },
  { key: 'apparel',     to: '/products?category=sports-apparel' },
  { key: 'accessories', to: '/products?category=accessories' },
];

const SOCIALS = [
  { Icon: FacebookIcon,  href: 'https://facebook.com/miqfootball',  label: 'Facebook trên MiQ Football',  glow: '#1877f2' },
  { Icon: InstagramIcon, href: 'https://instagram.com/miqfootball', label: 'Instagram trên MiQ Football', glow: '#e1306c' },
  { Icon: TikTokIcon,    href: 'https://tiktok.com/@miqfootball',   label: 'TikTok trên MiQ Football',    glow: '#010101' },
  { Icon: YoutubeIcon,   href: 'https://youtube.com/@miqfootball',  label: 'YouTube trên MiQ Football',   glow: '#ff0000' },
];

// ── Social button with glow ────────────────────────────────────────────────
const SocialBtn = ({ Icon, href, label, glow }) => (
  <motion.a
    href={href}
    aria-label={label}
    target="_blank"
    rel="noopener noreferrer"
    whileHover={{ scale: 1.12, y: -2 }}
    transition={{ duration: 0.18 }}
    className="relative w-10 h-10 rounded-2xl bg-white/8 text-gray-400 flex items-center justify-center transition-colors duration-200 overflow-hidden group"
    style={{ '--glow': glow }}
  >
    <span
      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-2xl"
      style={{ background: `radial-gradient(circle at center, ${glow}55 0%, transparent 70%)` }}
    />
    <span className="relative z-10 group-hover:text-white transition-colors duration-200">
      <Icon />
    </span>
  </motion.a>
);

// ── Nav link ───────────────────────────────────────────────────────────────
const NavLink = ({ to, label }) => (
  <li>
    <Link
      to={to}
      className="text-sm text-gray-400 hover:text-primary transition-colors duration-200 flex items-center gap-2 group"
    >
      <span className="w-1 h-1 rounded-full bg-primary/30 group-hover:bg-primary group-hover:w-2.5 transition-all duration-200 flex-shrink-0" />
      {label}
    </Link>
  </li>
);

// ── Footer ─────────────────────────────────────────────────────────────────
const Footer = () => {
  const t = useLanguageStore((s) => s.t);
  const [email, setEmail]         = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 5000);
  };

  return (
    <footer
      className="text-gray-300"
      style={{ background: 'linear-gradient(160deg, #0f172a 0%, #111827 55%, #0a0f1a 100%)' }}
    >
      {/* ── Payment bar ──────────────────────────────────────────────── */}
      <div className="border-b border-white/6 bg-white/2">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 py-4">
          <div className="flex flex-wrap items-center gap-3 justify-center lg:justify-start">
            <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mr-1">
              {t('paymentMethod')}:
            </span>
            {PAYMENT_METHODS.map(({ name, Comp }) => (
              <div
                key={name}
                title={name}
                className="flex items-center justify-center hover:scale-105 transition-transform"
              >
                <Comp />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main grid ────────────────────────────────────────────────── */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 py-16 lg:py-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-14">

          {/* ── Col 1: Brand ─────────────────────────────────────────── */}
          <div className="lg:col-span-1">
            <Logo size="lg" variant="full" white asLink={false} className="mb-3" />
            <p
              className="text-xs font-bold uppercase tracking-[0.2em] mb-5"
              style={{
                background: 'linear-gradient(90deg, #10B981, #6ee7b7, #10B981)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Modern Quality — Inspire The Game
            </p>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              {t('footerTagline')}
            </p>

            {/* Social buttons */}
            <div className="flex items-center gap-2.5">
              {SOCIALS.map((s) => <SocialBtn key={s.label} {...s} />)}
            </div>
          </div>

          {/* ── Col 2: Liên hệ ───────────────────────────────────────── */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.18em] text-white mb-6 flex items-center gap-2">
              <span className="w-5 h-px bg-primary" />
              {t('contactUs')}
            </h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="font-semibold text-gray-200 text-base">Lê Thanh Minh</li>
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <a href="tel:0378123395" className="hover:text-primary transition-colors">0378.123.395</a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <a href="mailto:lethanhminh@miqsports.vn" className="hover:text-primary transition-colors break-all">
                  lethanhminh@miqsports.vn
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>123 Nguyễn Văn Cừ, Quận 5,<br />TP. Hồ Chí Minh</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>{t('workingHours')}: 8:00 – 22:00</span>
              </li>
            </ul>
          </div>

          {/* ── Col 3: Hỗ trợ + Danh mục ────────────────────────────── */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.18em] text-white mb-6 flex items-center gap-2">
              <span className="w-5 h-px bg-primary" />
              {t('quickLinks')}
            </h4>
            <ul className="space-y-3 mb-8">
              {SUPPORT_LINK_KEYS.map((l) => <NavLink key={l.key} to={l.to} label={t(l.key) || l.key} />)}
            </ul>

            <h4 className="text-xs font-black uppercase tracking-[0.18em] text-white mb-5 flex items-center gap-2">
              <span className="w-5 h-px bg-primary" />
              {t('category')}
            </h4>
            <ul className="space-y-3">
              {QUICK_LINK_KEYS.map((l) => <NavLink key={l.key} to={l.to} label={t(l.key)} />)}
            </ul>
          </div>

          {/* ── Col 4: Newsletter ────────────────────────────────────── */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.18em] text-white mb-2 flex items-center gap-2">
              <span className="w-5 h-px bg-primary" />
              {t('newsletter')}
            </h4>
            <p className="text-sm text-gray-400 mb-5 leading-relaxed">
              {t('newsletterDesc')}
            </p>

            <motion.div
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-primary bg-primary/10 border border-primary/25 rounded-full px-3 py-1.5 mb-5"
            >
              🎁 {t('sale')} 10% {t('newArrivals').toLowerCase()}!
            </motion.div>

            {subscribed ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-primary/15 border border-primary/30 rounded-2xl px-4 py-4 flex items-center gap-3"
              >
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-primary">{t('success')}!</p>
                  <p className="text-xs text-gray-400 mt-0.5">{t('newsletterDesc')}</p>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col gap-2.5">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('yourEmail') + '...'}
                  required
                  className="w-full px-4 py-3 bg-white/7 border border-white/10 rounded-2xl text-sm text-white placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 transition"
                />
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-primary hover:bg-primary-600 text-white text-sm font-black rounded-2xl transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40"
                >
                  <Send className="w-4 h-4" />
                  {t('subscribe')}
                </button>
              </form>
            )}

            {/* Trust badges */}
            <div className="flex flex-wrap gap-2 mt-6">
              {['SSL', t('instock') || 'Authentic', t('tradeIn') + ' 30d'].map((badge) => (
                <span
                  key={badge}
                  className="text-[10px] font-bold text-gray-500 border border-white/8 rounded-full px-2.5 py-1"
                >
                  ✓ {badge}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Divider with glow ────────────────────────────────────────── */}
      <div className="h-px mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-12 xl:px-20">
        <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </div>

      {/* ── Bottom bar ───────────────────────────────────────────────── */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 py-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <span>© 2026 MiQ Football Store. {t('allRightsReserved')} — Lê Thanh Minh.</span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary/50" />
            MST: 0123456789
            <span className="w-1.5 h-1.5 rounded-full bg-primary/50" />
            <span className="text-gray-500 border border-white/8 rounded-full px-2 py-0.5">
              {t('terms')}
            </span>
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
