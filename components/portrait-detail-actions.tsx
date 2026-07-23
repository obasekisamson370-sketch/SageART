"use client";

import { useState } from "react";
import type { PublicPortrait } from "@/lib/types";
import { useSelection } from "./selection-provider";
import { ArPreview } from "./ar-preview";

export function PortraitDetailActions({ portrait }: { portrait: PublicPortrait }) {
  const { has, toggle } = useSelection();
  const [arOpen, setArOpen] = useState(false);
  const selected = has(portrait.id);

  return (
    <>
      <div className="mt-auto grid gap-3 pt-8 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => toggle({ id: portrait.id, title: portrait.title })}
          aria-pressed={selected}
          className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 font-display text-sm font-semibold transition-all active:scale-95 ${
            selected
              ? "border-energy bg-energy/15 text-energy"
              : "border-hairline bg-surface text-ink hover:border-energy hover:text-energy"
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={selected ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
            <path d="M12 21s-7.5-4.6-10-9.3C.4 8.4 2 5 5.3 5c2 0 3.4 1.1 4.2 2.4L12 10l2.5-2.6C15.3 6.1 16.7 5 18.7 5 22 5 23.6 8.4 22 11.7 19.5 16.4 12 21 12 21Z" />
          </svg>
          {selected ? "Selected" : "Select"}
        </button>

        <button
          type="button"
          onClick={() => setArOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-energy px-4 py-3 font-display text-sm font-semibold text-void transition-transform active:scale-95"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 2 3 7v10l9 5 9-5V7l-9-5Z" />
            <path d="m3 7 9 5 9-5M12 12v10" />
          </svg>
          View on your wall
        </button>
      </div>

      {arOpen && <ArPreview portrait={portrait} onClose={() => setArOpen(false)} />}
    </>
  );
}
