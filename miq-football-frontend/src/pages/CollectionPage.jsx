import { useState, useEffect, useLayoutEffect, useRef, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Bounds, Environment } from '@react-three/drei';
import { fetchProducts } from '../services/productService.js';
import { getCollectionBySlug } from '../services/collectionService.js';
import ProductCard from '../components/product/ProductCard.jsx';
import { PageSpinner } from '../components/ui/Skeleton.jsx';

// ── Fallback data when collection not yet in DB ───────────────────────────────
const BRAND_FALLBACK = {
  miq:           { displayName: 'MiQ Sport',    brand: 'MiQ',         tagline: 'Thương hiệu thể thao Việt Nam — Chất lượng không biên giới', description: 'MiQ Sport được sinh ra từ tình yêu bóng đá Việt Nam. Chúng tôi mang đến những sản phẩm cao cấp với thiết kế độc quyền, phù hợp từ sân phủi đến giải chuyên nghiệp.', accentColor: '#E8590C', modelPhotos: [{ url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80', title: 'MiQ Predator Series', desc: 'Kiểm soát tuyệt đối' }] },
  adidas:        { displayName: 'Adidas',        brand: 'Adidas',      tagline: 'Impossible Is Nothing', description: 'Adidas — thương hiệu thể thao hàng đầu thế giới với những đôi giày mang công nghệ tiên tiến nhất.', accentColor: '#000000', modelPhotos: [{ url: 'https://images.unsplash.com/photo-1584735175315-9d5df23be620?w=800&q=80', title: 'Predator Elite', desc: 'Kiểm soát đỉnh cao' }] },
  nike:          { displayName: 'Nike',          brand: 'Nike',        tagline: 'Just Do It', description: 'Nike Football — từ Phantom GX2 đến Mercurial Vapor, những đôi giày được các ngôi sao hàng đầu thế giới tin chọn.', accentColor: '#FF6B00', modelPhotos: [{ url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80', title: 'Mercurial Vapor', desc: 'Tốc độ không ai sánh bằng' }] },
  puma:          { displayName: 'Puma',          brand: 'Puma',        tagline: 'Forever Faster', description: 'Puma Football — thương hiệu của tốc độ. Ultra, Future và King là những dòng giày được thiết kế để vượt giới hạn.', accentColor: '#FFD700', modelPhotos: [{ url: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&q=80', title: 'King Pro', desc: 'Di sản bóng đá' }] },
  'new-balance': { displayName: 'New Balance',  brand: 'New Balance', tagline: 'Fearlessly Independent', description: 'New Balance Football — kết hợp hoàn hảo giữa công nghệ hiện đại và tính thẩm mỹ cao.', accentColor: '#C8102E', modelPhotos: [{ url: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800&q=80', title: 'Tekela V4', desc: 'Phong cách riêng' }] },
  mizuno:        { displayName: 'Mizuno',        brand: 'Mizuno',      tagline: 'Running is a feeling', description: 'Mizuno Football — thương hiệu Nhật Bản nổi tiếng với chất lượng thủ công và cảm giác bóng chân thực nhất.', accentColor: '#003087', modelPhotos: [{ url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', title: 'Wave Cup Legend', desc: 'Thủ công Nhật Bản' }] },
  umbro:         { displayName: 'Umbro',         brand: 'Umbro',       tagline: 'The Game Lives Here', description: 'Umbro — thương hiệu Anh quốc với lịch sử lâu đời trong bóng đá. Những chiếc áo đấu huyền thoại.', accentColor: '#E30613', modelPhotos: [{ url: 'https://images.unsplash.com/photo-1516478177764-9fe5bd7e9717?w=800&q=80', title: 'Umbro Team Kit', desc: 'Đồng phục thi đấu' }] },
};

// ── Built-in GLB fallback models ─────────────────────────────────────────────
const MODEL_LABELS = {
  'ball.glb':  'Quả bóng',
  'boot1.glb': 'Giày đá bóng 1',
  'boot2.glb': 'Giày đá bóng 2',
  'boot3.glb': 'Giày đá bóng 3',
};
const BUILTIN_MODELS = ['ball.glb', 'boot1.glb', 'boot2.glb', 'boot3.glb'];

// Kick off all built-in GLB downloads when this module is imported
BUILTIN_MODELS.forEach(m => useGLTF.preload('/models/' + m));

// Resolve the ordered model list for a collection.
// New data: col.models3d[] = [{url, name, _id}].
// Legacy data: col.model3d = 'boot1.glb' or full URL.
const resolveModels = (col) => {
  if (col.models3d?.length) return col.models3d;
  const m = col.model3d || 'boot1.glb';
  return [{ _id: 'legacy', url: m, name: MODEL_LABELS[m] || m }];
};

// Per-model Y rotation so a nice side-profile faces the camera initially.
// Camera at [0, 0.5, 3.5] + PI/4 rotation ≈ 45° 3/4 hero-shot view.
// Adjust per model if the default orientation differs visually.
const MODEL_INIT_ROT = {
  'ball.glb':  [0, 0,              0],
  'boot1.glb': [0, Math.PI / 4,   0],
  'boot2.glb': [0, Math.PI / 4,   0],
  'boot3.glb': [0, Math.PI / 4,   0],
};

// ── Inner model component — Bounds handles camera centering ───────────────
const ModelMesh = ({ url }) => {
  const { scene } = useGLTF(url);
  // For built-in models use the known initial rotation; for uploaded URLs default to 45°.
  const filename = url.startsWith('http') ? null : url.replace('/models/', '');
  const rot      = filename ? (MODEL_INIT_ROT[filename] || [0, 0, 0]) : [0, Math.PI / 4, 0];
  return <primitive object={scene} rotation={rot} />;
};

// ── Camera resetter — fires on every model switch, before Bounds.fit ──────
// Resets to a neutral angle so Bounds always fits from the same starting
// direction (prevents camera drift from user interaction showing the sole).
const CameraResetter = ({ url }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    camera.position.set(0, 0.5, 3.5);
    camera.lookAt(0, 0, 0);
  }, [url]);
  return null;
};

// ── Orbit carousel role helpers ───────────────────────────────────────────────
// Works for any N >= 1. center → right → back(s) → left → center.
const getRole = (idx, activeIdx, n) => {
  if (idx === activeIdx)               return 'center';
  if (idx === (activeIdx + 1) % n)     return 'right';
  if (n >= 3 && idx === (activeIdx - 1 + n) % n) return 'left';
  return 'back';
};

const ROLE_STYLE = {
  center: { transform: 'translateX(0) scale(1)',       opacity: 1,    zIndex: 10, cursor: 'default', pointerEvents: 'auto' },
  left:   { transform: 'translateX(-56%) scale(0.54)', opacity: 0.45, zIndex: 5,  cursor: 'pointer', pointerEvents: 'auto' },
  right:  { transform: 'translateX(56%) scale(0.54)',  opacity: 0.45, zIndex: 5,  cursor: 'pointer', pointerEvents: 'auto' },
  back:   { transform: 'translateX(0) scale(0.28)',    opacity: 0.12, zIndex: 1,  cursor: 'default', pointerEvents: 'none' },
};

// ── Side-slot thumbnail — PNG preview for built-ins, label for custom URLs ────
const ModelSideCard = ({ model }) => {
  // model = { url, name, _id }
  const isBuiltin = !model.url.startsWith('http');
  const thumbSrc  = isBuiltin ? '/models/thumbnails/' + model.url.replace('.glb', '') + '.png' : null;
  const label     = model.name || (isBuiltin ? (MODEL_LABELS[model.url] || model.url) : '3D Model');

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden flex items-center justify-center select-none">
      {thumbSrc ? (
        <>
          <img
            src={thumbSrc}
            alt={label}
            draggable={false}
            className="w-full h-full object-contain"
            onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
          />
          <span className="text-white/40 text-[11px] font-bold uppercase tracking-[0.2em] text-center px-6 leading-relaxed" style={{ display: 'none' }}>
            {label}
          </span>
        </>
      ) : (
        <span className="text-white/40 text-[11px] font-bold uppercase tracking-[0.2em] text-center px-6 leading-relaxed">
          {label}
        </span>
      )}
    </div>
  );
};

// ── Single persistent 3D canvas — lifted above the orbit map, never remounts ──
// One WebGL context total for the collection page; model switches via Bounds key.
// dpr cap + antialias:false keep GPU load low.
const LiveCanvas = ({ file, reducedMotion }) => {
  // file may be a built-in filename ('boot1.glb') or a full Cloudinary URL.
  const url = file.startsWith('http') ? file : '/models/' + file;
  return (
    <Canvas
      dpr={[1, 1.5]}
      style={{ width: '100%', height: '100%' }}
      camera={{ position: [0, 0.5, 3.5], fov: 48 }}
      gl={{ antialias: false, alpha: true }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener('webglcontextlost', (e) => { e.preventDefault(); });
      }}
    >
      {/* Reset camera to neutral angle on every model switch (before Bounds.fit) */}
      <CameraResetter url={url} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 8, 5]} intensity={2.5} />
      <directionalLight position={[-4, -2, -3]} intensity={0.6} />
      <hemisphereLight args={['#c8d8f0', '#0c0810', 0.55]} />
      <Suspense fallback={null}>
        <Environment preset="studio" background={false} />
      </Suspense>
      <Suspense fallback={null}>
        <Bounds key={url} fit clip observe damping={0} margin={1.2}>
          <ModelMesh url={url} />
        </Bounds>
      </Suspense>
      <OrbitControls
        key={url}
        enablePan={false}
        enableZoom={false}
        autoRotate={!reducedMotion}
        autoRotateSpeed={1.5}
        minPolarAngle={Math.PI * 0.25}
        maxPolarAngle={Math.PI * 0.65}
      />
    </Canvas>
  );
};

// ── Orbit carousel — section 1 of the collection page ─────────────────────────
// models = [{url, name, _id}, ...] — may be 1 to N items.
const Model3DViewer = ({ models, brandName, accentColor }) => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' && window.innerWidth < 640
  );
  const reducedMotion = useRef(
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ).current;

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  const n          = models.length;
  const [activeIdx, setActiveIdx] = useState(0);

  const select    = (i) => { if (i !== activeIdx) setActiveIdx(i); };
  const prevModel = () => select((activeIdx - 1 + n) % n);
  const nextModel = () => select((activeIdx + 1) % n);

  const stageH = isMobile ? 420 : 560;
  const itemW  = isMobile ? 300 : 500;
  const itemH  = isMobile ? 360 : 520;

  const activeModel = models[activeIdx] || models[0];

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: stageH + 'px' }}
    >
      {/* Ghost brand text */}
      <div
        className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none"
        aria-hidden="true"
        style={{ zIndex: 0 }}
      >
        <span
          className="font-display font-black uppercase text-white select-none"
          style={{ fontSize: isMobile ? '30vw' : '21vw', opacity: 0.042, letterSpacing: '-0.02em', lineHeight: 1 }}
        >
          {brandName}
        </span>
      </div>

      {/* Radial accent glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 0, background: 'radial-gradient(ellipse 60% 50% at 50% 52%, ' + accentColor + '18 0%, transparent 70%)' }}
      />

      {/* Orbit items — side thumbnails only; center slot is blank (covered by Canvas) */}
      {models.map((model, i) => {
        const role   = getRole(i, activeIdx, n);
        const center = role === 'center';
        return (
          <div
            key={model._id || i}
            onClick={() => { if (!center) select(i); }}
            onKeyDown={(e) => { if (!center && (e.key === 'Enter' || e.key === ' ')) select(i); }}
            role={center ? undefined : 'button'}
            tabIndex={center ? undefined : 0}
            aria-label={center ? undefined : (model.name || model.url)}
            style={{
              position:   'absolute',
              top:        '50%',
              left:       '50%',
              width:      itemW + 'px',
              height:     itemH + 'px',
              marginLeft: -(itemW / 2) + 'px',
              marginTop:  -(itemH / 2) + 'px',
              transition: 'transform 650ms cubic-bezier(0.34,1.1,0.64,1), opacity 550ms ease',
              willChange: 'transform, opacity',
              ...ROLE_STYLE[role],
            }}
          >
            {center ? null : <ModelSideCard model={model} />}
          </div>
        );
      })}

      {/* Single persistent Canvas — fixed at center, above orbit items (z=11).
          Never unmounts on model switch → one WebGL context for the whole page. */}
      <div
        style={{
          position:   'absolute',
          top:        '50%',
          left:       '50%',
          width:      itemW + 'px',
          height:     itemH + 'px',
          marginLeft: -(itemW / 2) + 'px',
          marginTop:  -(itemH / 2) + 'px',
          zIndex:     11,
        }}
      >
        <LiveCanvas file={activeModel.url} reducedMotion={reducedMotion} />
      </div>

      {/* Brand label + active model name — top left, above orbit */}
      <div className="absolute top-5 left-5 md:left-10" style={{ zIndex: 20 }}>
        <span
          className="font-display text-[10px] font-bold uppercase tracking-[0.22em]"
          style={{ color: accentColor }}
        >
          {brandName} Collection
        </span>
        <div className="text-white/45 text-[10px] mt-0.5 tracking-wide">
          {activeModel.name || MODEL_LABELS[activeModel.url] || activeModel.url}
        </div>
      </div>

      {/* Prev / Next arrows — only shown when there are multiple models */}
      {n > 1 && (
        <>
          <button
            onClick={prevModel}
            aria-label="Mô hình trước"
            className="absolute top-1/2 left-3 md:left-5 flex items-center justify-center rounded-full hover:bg-black/65"
            style={{ transform: 'translateY(-50%)', zIndex: 30, width: 40, height: 40, background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)', cursor: 'pointer' }}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={nextModel}
            aria-label="Mô hình tiếp theo"
            className="absolute top-1/2 right-3 md:right-5 flex items-center justify-center rounded-full hover:bg-black/65"
            style={{ transform: 'translateY(-50%)', zIndex: 30, width: 40, height: 40, background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)', cursor: 'pointer' }}
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Drag hint */}
      <div
        className="absolute left-1/2 pointer-events-none select-none"
        style={{ bottom: 16, transform: 'translateX(-50%)', zIndex: 20 }}
      >
        <span className="text-white/30 text-[10px] uppercase tracking-widest">Kéo để xoay</span>
      </div>
    </div>
  );
};

// ── Model photo card (section 2) — unchanged ─────────────────────────────────
const ModelPhotoCard = ({ photo, brandName, brandParam, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
    className="relative group overflow-hidden rounded-2xl aspect-[3/4] cursor-pointer"
  >
    <img
      src={photo.url}
      alt={photo.title}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
      loading="lazy"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
    <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
      <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">{brandName}</p>
      {photo.title && <h3 className="text-white font-display text-lg font-bold mb-1">{photo.title}</h3>}
      {photo.desc  && <p className="text-white/70 text-sm mb-3">{photo.desc}</p>}
      <Link
        to={'/products?brand=' + encodeURIComponent(brandParam)}
        className="inline-flex items-center gap-2 text-xs font-bold text-white bg-white/15 backdrop-blur-sm border border-white/25 px-4 py-2 rounded-full hover:bg-white/25 transition"
      >
        Xem sản phẩm <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  </motion.div>
);

// ── Main page ─────────────────────────────────────────────────────────────────
const CollectionPage = () => {
  const { slug } = useParams();

  const { data: dbCollection, isLoading: colLoading } = useQuery({
    queryKey: ['collection', slug],
    queryFn: () => getCollectionBySlug(slug),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const fb  = BRAND_FALLBACK[slug] || BRAND_FALLBACK.miq;
  const col = dbCollection || fb;

  const displayName = col.name        || fb.displayName;
  const brand       = col.brand       || fb.brand;
  const tagline     = col.tagline     || fb.tagline;
  const description = col.description || fb.description;
  const accentColor = col.accentColor || fb.accentColor;
  const modelPhotos = (col.modelPhotos && col.modelPhotos.length ? col.modelPhotos : fb.modelPhotos) || [];
  const models3d    = resolveModels(col);

  const { data: productsData, isLoading: prodLoading } = useQuery({
    queryKey: ['collection-products', brand],
    queryFn: () => fetchProducts({ brand, limit: 8 }),
    staleTime: 5 * 60 * 1000,
    enabled: !!brand,
  });

  const products = productsData && productsData.products ? productsData.products : [];

  if (colLoading) return <PageSpinner />;

  return (
    <div className="bg-bg-base min-h-screen">

      {/* ── Section 1: 3D model viewer ────────────────────────────────────── */}
      <Model3DViewer
        models={models3d}
        brandName={brand}
        accentColor={accentColor}
      />

      {/* ── Brand header ──────────────────────────────────────────────────── */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-14"
        >
          <div
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.25em] px-4 py-1.5 rounded-full mb-4 border"
            style={{ color: accentColor, borderColor: accentColor + '40', backgroundColor: accentColor + '10' }}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Bộ sưu tập chính thức
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-black text-text-primary uppercase mb-3">
            {displayName}
          </h1>
          {tagline && (
            <p className="font-display text-lg font-bold mb-4" style={{ color: accentColor }}>
              {tagline}
            </p>
          )}
          {description && (
            <p className="text-text-muted text-base max-w-2xl mx-auto leading-relaxed">
              {description}
            </p>
          )}
        </motion.div>

        {/* ── Section 2: Editorial / model photos ───────────────────────── */}
        {modelPhotos.length > 0 && (
          <section className="mb-20">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="font-display text-3xl md:text-4xl font-bold text-text-primary uppercase mb-8"
            >
              Ảnh Editorial
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {modelPhotos.map((photo, i) => (
                <ModelPhotoCard
                  key={photo._id || i}
                  photo={photo}
                  brandName={displayName}
                  brandParam={brand}
                  delay={i * 0.12}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── Section 3: Products grid ───────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="font-display text-3xl md:text-4xl font-bold text-text-primary uppercase"
            >
              Sản phẩm {displayName}
            </motion.h2>
            <Link
              to={'/products?brand=' + encodeURIComponent(brand)}
              className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition"
            >
              Xem tất cả <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {prodLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-surface rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-text-muted">
              <ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="font-display text-xl font-bold mb-2">Chưa có sản phẩm</p>
              <p className="text-sm">Sản phẩm {displayName} đang được cập nhật.</p>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 mt-6 bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition"
              >
                Xem tất cả sản phẩm <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {products.map((product, i) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="flex justify-center mt-10"
              >
                <Link
                  to={'/products?brand=' + encodeURIComponent(brand)}
                  className="inline-flex items-center gap-2 bg-primary text-white font-bold px-8 py-3.5 rounded-full hover:bg-primary/90 transition shadow-lg"
                >
                  Xem tất cả {displayName} <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default CollectionPage;
