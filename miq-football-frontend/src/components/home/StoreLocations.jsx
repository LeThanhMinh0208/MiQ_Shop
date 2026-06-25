import { motion } from 'framer-motion';
import { MapPin, Phone, Clock, ExternalLink } from 'lucide-react';
import { useLanguageStore } from '../../store/languageStore.js';

const STORES = [
  {
    id: 1,
    name: 'MiQ Sport - Flagship Store',
    address: '123 Nguyễn Huệ, P. Bến Nghé, Q.1, TP.HCM',
    phone: '028.1234.5678',
    hours: 'Thứ 2 – Chủ nhật: 08:00 – 21:00',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
    mapLink: '#',
    badge: 'Flagship',
    badgeColor: 'bg-primary',
  },
  {
    id: 2,
    name: 'MiQ Sport - Hà Nội',
    address: '45 Đinh Tiên Hoàng, P. Hàng Bài, Hoàn Kiếm, Hà Nội',
    phone: '024.8765.4321',
    hours: 'Thứ 2 – Chủ nhật: 08:30 – 21:00',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&q=80',
    mapLink: '#',
    badge: 'New',
    badgeColor: 'bg-orange-500',
  },
  {
    id: 3,
    name: 'MiQ Sport - Đà Nẵng',
    address: '88 Bạch Đằng, P. Hải Châu 1, Q. Hải Châu, Đà Nẵng',
    phone: '0236.3456.789',
    hours: 'Thứ 2 – Chủ nhật: 08:00 – 20:30',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80',
    mapLink: '#',
    badge: null,
    badgeColor: '',
  },
];

const ViewMapLink = ({ mapLink }) => {
  const t = useLanguageStore((s) => s.t);
  return (
    <a
      href={mapLink}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider hover:gap-2.5 transition-all"
    >
      {t('viewMap')} <ExternalLink className="w-3.5 h-3.5" />
    </a>
  );
};

const StoreCard = ({ store, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    className="bg-surface border border-surface-border rounded-3xl overflow-hidden group hover:border-primary/30 hover:shadow-[0_16px_48px_rgba(0,0,0,0.4)] transition-all duration-300"
  >
    <div className="relative aspect-[16/9] overflow-hidden">
      <img
        src={store.image}
        alt={store.name}
        loading="lazy"
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      {store.badge && (
        <span className={`absolute top-3 left-3 ${store.badgeColor} text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full`}>
          {store.badge}
        </span>
      )}
    </div>
    <div className="p-5">
      <h3 className="font-display text-lg font-bold text-text-primary mb-3">{store.name}</h3>
      <div className="space-y-2">
        <div className="flex items-start gap-2.5 text-sm text-text-secondary">
          <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <span>{store.address}</span>
        </div>
        <div className="flex items-center gap-2.5 text-sm text-text-secondary">
          <Phone className="w-4 h-4 text-primary flex-shrink-0" />
          <a href={`tel:${store.phone}`} className="hover:text-primary transition">{store.phone}</a>
        </div>
        <div className="flex items-center gap-2.5 text-sm text-text-secondary">
          <Clock className="w-4 h-4 text-primary flex-shrink-0" />
          <span>{store.hours}</span>
        </div>
      </div>
      <ViewMapLink mapLink={store.mapLink} />
    </div>
  </motion.div>
);

const StoreLocations = () => {
  const t = useLanguageStore((s) => s.t);
  return (
    <section className="py-10 lg:py-12 bg-bg-base">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-8"
        >
          <div>
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-[0.22em] px-3.5 py-1.5 rounded-full mb-4">
              <MapPin className="w-3 h-3" />
              {t('storeLocationsBadge')}
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-text-primary">{t('storeTitle')}</h2>
            <p className="text-text-muted text-sm mt-2">{t('storeLocationsDesc')}</p>
          </div>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STORES.map((store, i) => (
            <StoreCard key={store.id} store={store} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StoreLocations;
