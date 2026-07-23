import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { PublicPortrait } from "@/lib/types";
import { SiteHeader } from "@/components/site-header";
import { SelectionBar } from "@/components/selection-bar";
import { PortraitDetailActions } from "@/components/portrait-detail-actions";

export const revalidate = 60;

async function getPortrait(id: string): Promise<PublicPortrait | null> {
  const { data } = await supabase
    .from("portraits")
    .select("id, title, image_url, tags, created_at")
    .eq("id", id)
    .maybeSingle();
  return data ?? null;
}

export default async function PortraitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const portrait = await getPortrait(id);
  if (!portrait) notFound();

  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 pb-32 pt-6 sm:px-6">
        <Link
          href="/"
          className="mb-5 inline-flex items-center gap-1.5 text-sm text-ink-soft transition-colors hover:text-energy"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back to gallery
        </Link>

        <PortraitDetailActions portrait={portrait} />
      </main>
      <SelectionBar />
    </div>
  );
}
