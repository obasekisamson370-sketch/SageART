export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg width="26" height="26" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path
          d="M16 2 L28 9 V23 L16 30 L4 23 V9 Z"
          stroke="var(--color-energy)"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path d="M16 8 L22 16 L16 24 L10 16 Z" fill="var(--color-energy)" fillOpacity="0.9" />
      </svg>
      <span className="font-display text-lg font-bold tracking-[0.18em] text-ink">
        SAGE<span className="text-energy">ART</span>
      </span>
    </span>
  );
}
