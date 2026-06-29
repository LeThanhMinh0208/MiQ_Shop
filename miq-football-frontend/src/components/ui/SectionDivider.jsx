const SectionDivider = ({ flip = false }) => (
  <div
    className={`w-full overflow-hidden pointer-events-none select-none ${flip ? 'rotate-180' : ''}`}
    style={{ height: 32, marginTop: -1, marginBottom: -1 }}
    aria-hidden="true"
  >
    <svg viewBox="0 0 1440 32" preserveAspectRatio="none" className="w-full h-full">
      <defs>
        <linearGradient id="divGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#E8590C" stopOpacity="0.12" />
          <stop offset="50%"  stopColor="#E8590C" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#E8590C" stopOpacity="0.10" />
        </linearGradient>
      </defs>
      <path d="M0 32 L1440 0 L1440 32 Z" fill="url(#divGrad)" />
    </svg>
  </div>
);

export default SectionDivider;
