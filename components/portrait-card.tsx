"use client";

import Link from "next/link";
import type { PublicPortrait } from "@/lib/types";
import { useSelection } from "./selection-provider";
import { HeartButton } from "./heart-button";
import { FramedImage } from "./framed-image";
import { DEFAULT_OPTIONS } from "@/lib/frame-options";

export function PortraitCard({ portrait, priority = false }: { portrait: PublicPortrait; priority?: boolean }) {
  const { has, toggle } = useSelection();
  const selected = has(portrait.id);

  return (
    <div
      className={`group relative overflow-hidden rounded-card border transition-all duration-300 ${
        selected
          ? "border-energy shadow-[0_0_0_1px_var(--color-energy),0_10px_40px_-12px_var(--color-energy-glow)]"
          : "border-hairline"
      }`}
    >
      {/* gallery-wall backdrop */}
      <div className="bg-[radial-gradient(120%_90%_at_50%_0%,#20222b,#131418_70%)] p-4 sm:p-5">
        <Link href={`/portrait/${portrait.id}`} aria-label={`View ${portrait.title}`} className="block">
          <div className="mx-auto w-[82%] transition-transform duration-500 ease-out group-hover:-translate-y-1 group-hover:scale-[1.02] drop-shadow-[0_18px_24px_rgba(0,0,0,.55)]">
            <FramedImage
              src={portrait.image_url}
              alt={portrait.title}
              frame={DEFAULT_OPTIONS.frame}
              glass={DEFAULT_OPTIONS.glass}
              priority={priority}
              sizes="(max-width: 640px) 40vw, (max-width: 1024px) 28vw, 220px"
            />
          </div>
        </Link>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-hairline bg-surface px-3 py-2.5">
        <div className="min-w-0">
          <h3 className="truncate font-display text-sm font-medium text-ink">{portrait.title}</h3>
          {portrait.tags?.length > 0 && (
            <p className="truncate text-xs text-ink-faint">{portrait.tags.slice(0, 2).join(" · ")}</p>
          )}
        </div>
        <HeartButton
          selected={selected}
          onClick={() => toggle({ id: portrait.id, title: portrait.title })}
          label={portrait.title}
        />
      </div>
    </div>
  );
}
