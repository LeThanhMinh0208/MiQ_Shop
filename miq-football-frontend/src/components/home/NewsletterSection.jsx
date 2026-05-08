import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const NewsletterSection = () => {
  return (
    <section className="py-16 bg-cream relative overflow-hidden">
      {/* Decorative sparkles */}
      <Sparkles className="absolute bottom-10 right-10 w-12 h-12 text-primary/40" />

      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-primary via-primary to-primary-dark rounded-3xl p-10 md:p-14 text-center relative overflow-hidden shadow-2xl shadow-primary/30"
        >
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute top-4 right-4">
            <Sparkles className="w-6 h-6 text-white/60" />
          </div>

          <h2 className="relative font-display text-3xl md:text-5xl font-bold text-white mb-6">
            SUBSCRIBE FOR 10% OFF
          </h2>

          <form className="relative flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <input
              type="email"
              placeholder="Enter email"
              className="flex-1 px-5 py-3 rounded-full text-ink focus:outline-none focus:ring-4 focus:ring-white/30"
            />
            <button
              type="submit"
              className="bg-white text-primary font-bold uppercase tracking-wider px-8 py-3 rounded-full hover:bg-ink hover:text-white transition shadow-lg"
            >
              Subscribe
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default NewsletterSection;