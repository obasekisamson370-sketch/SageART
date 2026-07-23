import { supabase } from "@/lib/supabase";
import type { PublicPortrait } from "@/lib/types";
import { SiteHeader } from "@/components/site-header";
import { PortraitCard } from "@/components/portrait-card";
import { SelectionBar } from "@/components/selection-bar";

export const revalidate = 60;

async function getPortraits(): Promise<PublicPortrait[]> {
  const { data, error } = await supabase
    .from("portraits")
    .select("id, title, image_url, tags, created_at")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Failed to load portraits:", error.message);
    return [];
  }
  return data ?? [];
}

export default async function GalleryPage() {
  const portraits = await getPortraits();

  return (
    <div className="min-h-dvh">
      <SiteHeader />

      <section className="mx-auto max-w-6xl px-4 pb-6 pt-12 sm:px-6 sm:pt-16">
        <p className="mb-3 font-display text-xs font-semibold uppercase tracking-[0.32em] text-energy">
          Warframe Portrait Art
        </p>
        <h1 className="max-w-2xl font-display text-4xl font-bold leading-[1.05] tracking-tight text-ink sm:text-5xl">
          Bring the Origin System <span className="text-energy">to your wall.</span>
        </h1>
        <p className="mt-4 max-w-xl text-ink-soft">
          Hand-crafted portraits of your favourite Warframes. Tap the heart on the pieces you love,
          preview one on your own wall, then send your picks straight to the artist.
        </p>
      </section>

      <main className="mx-auto max-w-3xl px-5 pb-32 sm:px-6">
        {portraits.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-2 gap-x-6 gap-y-9 sm:gap-x-10 sm:gap-y-12">
            {portraits.map((p, i) => (
              <PortraitCard key={p.id} portrait={p} priority={i < 4} />
            ))}
          </div>
        )}
      </main>

      <SelectionBar />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="hud-frame mx-auto mt-8 max-w-md rounded-card border border-hairline bg-surface p-10 text-center">
      <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full border border-hairline text-energy">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="m3 15 5-5 4 4 3-3 6 6" />
          <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      </div>
      <h2 className="font-display text-lg font-semibold text-ink">No portraits yet</h2>
      <p className="mt-1 text-sm text-ink-soft">
        The artist hasn&apos;t uploaded any pieces yet. Check back soon.
      </p>
    </div>
  );
}
