export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl px-5 pb-32 pt-24 sm:px-6">
      <div className="grid grid-cols-2 gap-x-6 gap-y-9 sm:gap-x-10 sm:gap-y-12">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col">
            <div className="aspect-[4/5] w-full animate-pulse rounded-[4px] bg-surface-2" />
            <div className="mt-3 h-4 w-2/3 animate-pulse rounded bg-surface-2" />
          </div>
        ))}
      </div>
    </div>
  );
}
