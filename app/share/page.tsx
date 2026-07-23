import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { PublicPortrait } from "@/lib/types";
import { parseIdList } from "@/lib/uuid";
import { SiteHeader } from "@/components/site-header";

export const dynamic = "force-dynamic";

async function getPortraits(ids: string[]): Promise<PublicPortrait[]> {
  if (ids.length === 0) return [];
  const { data } = await supabase
    .from("portraits")
    .select("id, title, image_url, tags, created_at")
    .in("id", ids);
  if (!data) return [];
  // preserve the order the seller received in the link
  const order = new Map(ids.map((id, i) => [id, i]));
  return [...data].sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
}

export default async function SharePage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const { ids: rawIds } = await searchParams;
  const ids = parseIdList(rawIds);
  const portraits = await getPortraits(ids);

  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 pb-24 pt-8 sm:px-6">
        <p className="font-display text-xs font-semibold uppercase tracking-[0.32em] text-energy">
          Customer selection
        </p>
        <h1 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
          {portraits.length > 0
            ? `${portraits.length} portrait${portraits.length > 1 ? "s" : ""} shortlisted`
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
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            {portraits.map((p) => (
              <Link
                key={p.id}
                href={`/portrait/${p.id}`}
                className="group overflow-hidden rounded-card border border-hairline bg-surface"
              >
                <div className="relative aspect-[4/5] w-full bg-surface-2">
                  <Image
                    src={p.image_url}
                    alt={p.title}
                    fill
                    sizes="(max-width: 640px) 50vw, 260px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <p className="truncate px-3 py-2 font-display text-sm text-ink">{p.title}</p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
