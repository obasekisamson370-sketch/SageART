import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { PublicPortrait } from "@/lib/types";
import { parseIdList } from "@/lib/uuid";
import { decodeSelection } from "@/lib/share-encode";
import { describeOptions, DEFAULT_OPTIONS, type FrameOptions } from "@/lib/frame-options";
import { SiteHeader } from "@/components/site-header";
import { FramedImage } from "@/components/framed-image";

export const dynamic = "force-dynamic";

async function getPortraits(ids: string[]): Promise<PublicPortrait[]> {
  if (ids.length === 0) return [];
  const { data } = await supabase
    .from("portraits")
    .select("id, title, image_url, tags, created_at")
    .in("id", ids);
  return data ?? [];
}

export default async function SharePage({
  searchParams,
}: {
  searchParams: Promise<{ sel?: string; ids?: string }>;
}) {
  const { sel, ids: legacyIds } = await searchParams;

  // Prefer the new `sel` (carries frame options); fall back to legacy `ids`.
  const selection = sel
    ? decodeSelection(sel)
    : parseIdList(legacyIds).map((id) => ({ id, options: DEFAULT_OPTIONS as FrameOptions }));

  const orderedIds = selection.map((s) => s.id);
  const optionsById = new Map(selection.map((s) => [s.id, s.options]));
  const rows = await getPortraits(orderedIds);
  const portraits = orderedIds
    .map((id) => rows.find((r) => r.id === id))
    .filter((p): p is PublicPortrait => Boolean(p));

  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 pb-24 pt-8 sm:px-6">
        <p className="font-display text-xs font-semibold uppercase tracking-[0.32em] text-energy">
          Customer order
        </p>
        <h1 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
          {portraits.length > 0
            ? `${portraits.length} portrait${portraits.length > 1 ? "s" : ""} requested`
            : "No portraits to show"}
        </h1>

        {portraits.length === 0 ? (
          <p className="mt-4 text-ink-soft">
            This link doesn&apos;t reference any available portraits.{" "}
            <Link href="/" className="text-energy underline-offset-2 hover:underline">
              Browse the gallery
            </Link>
            .
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {portraits.map((p) => {
              const opts = optionsById.get(p.id) ?? DEFAULT_OPTIONS;
              return (
                <div key={p.id} className="rounded-card border border-hairline bg-surface p-4">
                  <div className="bg-[radial-gradient(120%_90%_at_50%_0%,#20222b,#131418_72%)] rounded-lg p-5">
                    <div className="mx-auto w-[78%] drop-shadow-[0_18px_24px_rgba(0,0,0,.55)]">
                      <FramedImage src={p.image_url} alt={p.title} frame={opts.frame} glass={opts.glass} sizes="300px" />
                    </div>
                  </div>
                  <p className="mt-3 font-display text-sm font-semibold text-ink">{p.title}</p>
                  <p className="text-xs text-energy">{describeOptions(opts)}</p>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
