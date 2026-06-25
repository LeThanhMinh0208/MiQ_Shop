// Reusable shimmer skeleton components

const Shimmer = ({ className = '' }) => (
  <div className={`relative overflow-hidden bg-surface-border ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent" />
  </div>
);

// ── Single product card skeleton ──────────────────────────────────────────────
export const ProductCardSkeleton = () => (
  <div className="bg-bg-elevated rounded-2xl overflow-hidden border border-surface-border">
    <Shimmer className="aspect-square rounded-none" />
    <div className="p-3 space-y-2">
      <Shimmer className="h-3.5 rounded-full w-3/4" />
      <Shimmer className="h-3 rounded-full w-1/2" />
      <Shimmer className="h-4 rounded-full w-2/5" />
    </div>
  </div>
);

// ── 12-card grid for ProductListing ──────────────────────────────────────────
export const ProductGridSkeleton = ({ count = 12 }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

// ── Two-column ProductDetail skeleton ────────────────────────────────────────
export const ProductDetailSkeleton = () => (
  <div className="min-h-screen bg-bg-base py-8">
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-20">
      <div className="grid lg:grid-cols-2 gap-10">
        {/* Left: image */}
        <div className="space-y-3">
          <Shimmer className="rounded-3xl aspect-square" />
          <div className="grid grid-cols-4 gap-2">
            {[0,1,2,3].map((i) => <Shimmer key={i} className="rounded-xl aspect-square" />)}
          </div>
        </div>
        {/* Right: info */}
        <div className="space-y-4 pt-2">
          <Shimmer className="h-4 rounded-full w-1/4" />
          <Shimmer className="h-8 rounded-full w-3/4" />
          <Shimmer className="h-8 rounded-full w-2/3" />
          <div className="flex gap-1">
            {[0,1,2,3,4].map((i) => <Shimmer key={i} className="w-5 h-5 rounded-full" />)}
          </div>
          <Shimmer className="h-10 rounded-full w-1/3" />
          <Shimmer className="h-4 rounded-full w-full" />
          <Shimmer className="h-4 rounded-full w-5/6" />
          <Shimmer className="h-4 rounded-full w-4/5" />
          <div className="flex gap-2 pt-2">
            {[0,1,2,3,4,5].map((i) => <Shimmer key={i} className="w-14 h-10 rounded-lg" />)}
          </div>
          <div className="flex gap-3 pt-4">
            <Shimmer className="flex-1 h-14 rounded-xl" />
            <Shimmer className="w-14 h-14 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ── Admin table skeleton ──────────────────────────────────────────────────────
export const TableSkeleton = ({ rows = 6, cols = 5 }) => (
  <div className="bg-bg-elevated rounded-2xl border border-surface-border overflow-hidden">
    {/* Header */}
    <div className="bg-bg-raised px-4 py-4 flex gap-4">
      {Array.from({ length: cols }).map((_, i) => (
        <Shimmer key={i} className="h-3 rounded-full flex-1" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} className="px-4 py-4 border-t border-surface-border flex items-center gap-4">
        {Array.from({ length: cols }).map((_, c) => (
          c === 0
            ? <div key={c} className="flex items-center gap-3 flex-1">
                <Shimmer className="w-10 h-10 rounded-lg flex-shrink-0" />
                <Shimmer className="h-3 rounded-full flex-1 max-w-[180px]" />
              </div>
            : <Shimmer key={c} className="h-3 rounded-full flex-1" />
        ))}
      </div>
    ))}
  </div>
);

// ── Order item skeleton for OrderSuccess ─────────────────────────────────────
export const OrderItemSkeleton = ({ rows = 3 }) => (
  <div className="border border-surface-border rounded-xl overflow-hidden">
    <div className="px-4 py-2 border-b border-surface-border bg-surface">
      <Shimmer className="h-3 rounded-full w-24" />
    </div>
    <div className="divide-y divide-surface-border">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <Shimmer className="w-10 h-10 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Shimmer className="h-3.5 rounded-full w-3/4" />
            <Shimmer className="h-3 rounded-full w-1/3" />
          </div>
          <Shimmer className="h-4 rounded-full w-16 flex-shrink-0" />
        </div>
      ))}
    </div>
    <div className="flex justify-between px-4 py-2 bg-surface border-t border-surface-border">
      <Shimmer className="h-3 rounded-full w-16" />
      <Shimmer className="h-4 rounded-full w-20" />
    </div>
  </div>
);

// ── Generic page-level spinner (Suspense fallback) ────────────────────────────
export const PageSpinner = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-10 h-10 rounded-full border-4 border-surface-border border-t-primary animate-spin" />
  </div>
);
