import { motion, useReducedMotion } from 'framer-motion';
import HeroSection           from '../components/home/HeroSection.jsx';
import NewArrivals           from '../components/home/NewArrivals.jsx';
import FlashSale             from '../components/home/FlashSale.jsx';
import TeamComboPackages     from '../components/home/TeamComboPackages.jsx';
import CategoriesShowcase    from '../components/home/CategoriesShowcase.jsx';
import ShopByClub            from '../components/home/ShopByClub.jsx';
import RecommendationSection from '../components/home/RecommendationSection.jsx';
import CustomJerseyPrinting  from '../components/home/CustomJerseyPrinting.jsx';
import TradeIn               from '../components/home/TradeIn.jsx';
import StoreLocations        from '../components/home/StoreLocations.jsx';
import MiqChannel            from '../components/home/MiqChannel.jsx';
import NewsSection           from '../components/home/NewsSection.jsx';
import TeamTestimonials      from '../components/home/TeamTestimonials.jsx';
import NewsletterSection     from '../components/home/NewsletterSection.jsx';

// ── Diverse scroll-in animations ─────────────────────────────────────────────
const SECTION_ANIMS = [
  // 0 fade up (default)
  { initial: { opacity: 0, y: 56 }, whileInView: { opacity: 1, y: 0 }, transition: { type: 'spring', stiffness: 180, damping: 24 } },
  // 1 slide from left
  { initial: { opacity: 0, x: -72 }, whileInView: { opacity: 1, x: 0 }, transition: { type: 'spring', stiffness: 160, damping: 26 } },
  // 2 slide from right
  { initial: { opacity: 0, x: 72 }, whileInView: { opacity: 1, x: 0 }, transition: { type: 'spring', stiffness: 160, damping: 26 } },
  // 3 zoom in
  { initial: { opacity: 0, scale: 0.88 }, whileInView: { opacity: 1, scale: 1 }, transition: { type: 'spring', stiffness: 200, damping: 22 } },
  // 4 fade down
  { initial: { opacity: 0, y: -40 }, whileInView: { opacity: 1, y: 0 }, transition: { type: 'spring', stiffness: 180, damping: 24 } },
  // 5 fade in only
  { initial: { opacity: 0 }, whileInView: { opacity: 1 }, transition: { duration: 0.6, ease: 'easeOut' } },
];

const Section = ({ children, anim = 0, className = '' }) => {
  const shouldReduce = useReducedMotion();
  const a = SECTION_ANIMS[anim % SECTION_ANIMS.length];
  if (shouldReduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      initial={a.initial}
      whileInView={a.whileInView}
      viewport={{ once: true, amount: 0.06 }}
      transition={a.transition}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const Home = () => (
  <div className="bg-bg-base">
    {/* Hero — full height, no animation wrapper so it renders immediately */}
    <HeroSection />

    <Section anim={0}><NewArrivals /></Section>
    <Section anim={1}><FlashSale /></Section>
    <Section anim={2}><TeamComboPackages /></Section>
    <Section anim={3}><CategoriesShowcase /></Section>
    <Section anim={5}><ShopByClub /></Section>
    <Section anim={1}><RecommendationSection /></Section>
    <Section anim={2}><CustomJerseyPrinting /></Section>
    <Section anim={3}><TradeIn /></Section>
    <Section anim={0}><StoreLocations /></Section>
    <Section anim={3}><MiqChannel /></Section>
    <Section anim={2}><NewsSection /></Section>
    <Section anim={5}><TeamTestimonials /></Section>
    <Section anim={4}><NewsletterSection /></Section>
  </div>
);

export default Home;
