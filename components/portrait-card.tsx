"use client";

import Image from "next/image";
import Link from "next/link";
import type { PublicPortrait } from "@/lib/types";
import { useSelection } from "./selection-provider";
import { HeartButton } from "./heart-button";

export function PortraitCard({ portrait, priority = false }: { portrait: PublicPortrait; priority?: boolean }) {
  const { has, toggle } = useSelection();
  const selected = has(portrait.id);

  return (
    <div
      className={`group relative overflow-hidden rounded-card border bg-surface transition-all duration-300 ${
        selected ? "border-energy shadow-[0_0_0_1px_var(--color-energy),0_10px_40px_-12px_var(--color-energy-glow)]" : "border-hairline hover:border-hairline"
      }`}
    >
      <Link href={`/portrait/${portrait.id}`} className="block" aria-label={`View ${portrait.title}`}>
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface-2">
          <Image
            src={portrait.image_url}
            alt={portrait.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
            priority={priority}
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void/85 via-transparent to-transparent opacity-70" />
        </div>
      </Link>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
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
