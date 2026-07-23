export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-32 pt-24 sm:px-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[4/5] animate-pulse rounded-card border border-hairline bg-surface"
          />
        ))}
      </div>
    </div>
  );
}
