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
    <div className="flex flex-col">
      <Link
        href={`/portrait/${portrait.id}`}
        aria-label={`View ${portrait.title}`}
        className="group block rounded-[4px]"
      >
        <div
          className={`transition-transform duration-500 ease-out group-hover:-translate-y-1 drop-shadow-[0_22px_28px_rgba(0,0,0,.6)] ${
            selected ? "ring-2 ring-energy ring-offset-4 ring-offset-void rounded-[4px]" : ""
          }`}
        >
          <FramedImage
            src={portrait.image_url}
            alt={portrait.title}
            frame={DEFAULT_OPTIONS.frame}
            glass={DEFAULT_OPTIONS.glass}
            priority={priority}
            sizes="(max-width: 640px) 45vw, 340px"
          />
        </div>
      </Link>

      <div className="mt-3 flex items-center justify-between gap-2">
        <h3 className="min-w-0 truncate font-display text-sm font-medium text-ink">{portrait.title}</h3>
        <HeartButton
          selected={selected}
          onClick={() => toggle({ id: portrait.id, title: portrait.title })}
          label={portrait.title}
        />
      </div>
    </div>
  );
}
