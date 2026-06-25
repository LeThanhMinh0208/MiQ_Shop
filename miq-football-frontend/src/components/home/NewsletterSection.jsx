import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Mail, CheckCircle, ArrowRight, Shield, Zap, Gift } from 'lucide-react';
import { useLanguageStore } from '../../store/languageStore.js';

const BENEFITS = [
  { icon: Gift,   text: 'Ưu đãi độc quyền 10% cho đơn đầu tiên' },
  { icon: Zap,    text: 'Thông báo sớm sản phẩm ra mắt mới' },
  { icon: Shield, text: 'Miễn phí vận chuyển cho thành viên VIP' },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};
const itemVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

const NewsletterSection = () => {
  const t = useLanguageStore((s) => s.t);
  const [email, setEmail]       = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused]   = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  };

  return (
    <section className="py-8 lg:py-10 bg-bg-base relative overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-3xl overflow-hidden border border-primary/10"
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #111827 55%, #0a0f1a 100%)',
            boxShadow: '0 20px 80px rgba(16,185,129,0.12), 0 4px 20px rgba(0,0,0,0.4)',
          }}
        >
          {/* Glow orbs */}
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 65%)' }} />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.12) 0%, transparent 65%)' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none opacity-30"
            style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 60%)' }} />

          {/* Sparkle dots decoration */}
          {[
            { top: '12%', left: '8%',  size: 4, delay: 0 },
            { top: '25%', right: '12%', size: 3, delay: 0.5 },
            { top: '70%', left: '15%', size: 5, delay: 1.0 },
            { top: '80%', right: '8%', size: 3, delay: 1.5 },
            { top: '45%', left: '40%', size: 2, delay: 0.8 },
          ].map((dot, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-primary pointer-events-none"
              style={{ top: dot.top, left: dot.left, right: dot.right, width: dot.size, height: dot.size }}
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.3, 0.8] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: dot.delay, ease: 'easeInOut' }}
            />
          ))}

          {/* Content grid */}
          <div className="relative z-10 grid md:grid-cols-2 gap-6 lg:gap-12 p-6 md:p-8 lg:p-10 items-center">

            {/* Left: Text content */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {/* Badge */}
              <motion.div variants={itemVariants} className="mb-3">
                <span className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 text-primary text-[11px] font-bold uppercase tracking-widest px-4 py-2 rounded-full">
                  <Sparkles className="w-3.5 h-3.5 fill-primary/60" />
                  THÀNH VIÊN VIP
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h2
                variants={itemVariants}
                className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-[1.05] mb-4"
              >
                NHẬN ƯU ĐÃI{' '}
                <span style={{
                  background: 'linear-gradient(135deg, #10B981 0%, #34D399 60%, #059669 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  10% OFF
                </span>
                <br />NGAY HÔM NAY
              </motion.h2>

              <motion.p variants={itemVariants} className="text-white/50 text-sm leading-relaxed mb-5 max-w-sm">
                Đăng ký nhận bản tin MiQ Sport để không bỏ lỡ bất kỳ ưu đãi hay sản phẩm mới nào.
              </motion.p>

              {/* Benefits list */}
              <motion.ul variants={containerVariants} className="space-y-3">
                {BENEFITS.map(({ icon: Icon, text }) => (
                  <motion.li key={text} variants={itemVariants} className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-3.5 h-3.5 text-primary" />
                    </span>
                    <span className="text-white/70 text-sm font-medium">{text}</span>
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>

            {/* Right: Form card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <div
                className="rounded-2xl p-6 md:p-8 border border-white/10"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
                }}
              >
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center text-center py-8 gap-4"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}
                      className="w-16 h-16 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center"
                    >
                      <CheckCircle className="w-8 h-8 text-primary" />
                    </motion.div>
                    <h3 className="font-display text-xl font-bold text-white">Đã đăng ký!</h3>
                    <p className="text-white/60 text-sm max-w-xs">
                      Cảm ơn bạn! Mã giảm giá 10% sẽ được gửi đến email của bạn trong vài phút.
                    </p>
                  </motion.div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{t('newsletter')}</p>
                        <p className="text-white/40 text-xs">Không spam. Hủy bất cứ lúc nào.</p>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-white/60 text-xs font-semibold uppercase tracking-wider">
                          Địa chỉ email
                        </label>
                        <div className={`relative rounded-xl border transition-all duration-200 ${
                          focused ? 'border-primary shadow-[0_0_0_3px_rgba(16,185,129,0.15)]' : 'border-white/15'
                        }`}>
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onFocus={() => setFocused(true)}
                            onBlur={() => setFocused(false)}
                            placeholder="ten@email.com"
                            className="w-full bg-transparent px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none rounded-xl"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-emerald-500 text-white font-bold uppercase tracking-wider py-3.5 rounded-xl hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] transition-all duration-300 group"
                      >
                        {t('subscribe')}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </form>

                    <p className="text-center text-white/25 text-[10px] mt-4 leading-relaxed">
                      Bằng cách đăng ký, bạn đồng ý với{' '}
                      <span className="text-primary/60 cursor-pointer hover:text-primary transition">
                        Điều khoản dịch vụ
                      </span>
                      {' '}của chúng tôi.
                    </p>
                  </>
                )}
              </div>

              {/* Social proof */}
              <div className="mt-4 flex items-center justify-center gap-2">
                <div className="flex -space-x-2">
                  {['10B981','059669','34D399'].map((c, i) => (
                    <div key={i} className="w-7 h-7 rounded-full border-2 border-[#111827] flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: `#${c}` }}>
                      {['M','T','N'][i]}
                    </div>
                  ))}
                </div>
                <p className="text-white/40 text-xs">
                  <span className="text-white/70 font-bold">12.000+</span> thành viên đã đăng ký
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default NewsletterSection;
