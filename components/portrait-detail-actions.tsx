"use client";

import { useEffect, useState } from "react";
import type { PublicPortrait } from "@/lib/types";
import { useSelection } from "./selection-provider";
import { ArPreview } from "./ar-preview";
import { FramedImage } from "./framed-image";
import {
  DEFAULT_OPTIONS,
  FRAME_COLORS,
  SIZES,
  frameStyle,
  type FrameOptions,
} from "@/lib/frame-options";

export function PortraitDetailActions({ portrait }: { portrait: PublicPortrait }) {
  const { get, has, addOrUpdate, setOptions, remove } = useSelection();
  const [arOpen, setArOpen] = useState(false);
  const [opts, setOpts] = useState<FrameOptions>(DEFAULT_OPTIONS);
  const selected = has(portrait.id);

  // if already selected, load its saved options
  useEffect(() => {
    const existing = get(portrait.id);
    if (existing) setOpts(existing.options);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function update(next: Partial<FrameOptions>) {
    const merged = { ...opts, ...next };
    setOpts(merged);
    if (selected) setOptions(portrait.id, merged); // live-sync if already in cart
  }

  return (
    <div className="grid gap-8 md:grid-cols-[1.1fr_1fr]">
      {/* live framed preview on a wall */}
      <div className="rounded-card border border-hairline bg-[radial-gradient(120%_90%_at_50%_0%,#23252f,#141519_72%)] p-6 sm:p-8">
        <div className="mx-auto w-[86%] drop-shadow-[0_26px_34px_rgba(0,0,0,.6)]">
          <FramedImage
            src={portrait.image_url}
            alt={portrait.title}
            frame={opts.frame}
            glass={opts.glass}
            priority
            sizes="(max-width: 768px) 90vw, 480px"
          />
        </div>
      </div>

      {/* configurator */}
      <div className="flex flex-col">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink">{portrait.title}</h1>
        {portrait.tags?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {portrait.tags.map((t) => (
              <span key={t} className="rounded-full border border-hairline px-2.5 py-1 text-xs text-ink-soft">
                {t}
              </span>
            ))}
          </div>
        )}

        {/* frame colour */}
        <Section label="Frame">
          <div className="flex flex-wrap gap-2.5">
            {FRAME_COLORS.map((f) => {
              const active = opts.frame === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => update({ frame: f.id })}
                  aria-pressed={active}
                  className={`flex items-center gap-2 rounded-xl border px-2 py-1.5 pr-3 transition-all ${
                    active ? "border-energy" : "border-hairline hover:border-ink-faint"
                  }`}
                >
                  <span
                    className="h-7 w-7 rounded-md ring-1 ring-black/40"
                    style={{ background: f.surface, boxShadow: f.bevel }}
                  />
                  <span className={`text-xs ${active ? "text-ink" : "text-ink-soft"}`}>{f.label}</span>
                </button>
              );
            })}
          </div>
        </Section>

        {/* size */}
        <Section label="Size">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {SIZES.map((s) => {
              const active = opts.size === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => update({ size: s.id })}
                  aria-pressed={active}
                  className={`rounded-xl border px-2 py-2 text-center transition-all ${
                    active ? "border-energy bg-energy/10" : "border-hairline hover:border-ink-faint"
                  }`}
                >
                  <span className="block font-display text-sm text-ink">{s.label}</span>
                  <span className="block text-[10px] text-ink-faint">{s.cm}</span>
                </button>
              );
            })}
          </div>
        </Section>

        {/* glass */}
        <Section label="Glass">
          <div className="grid grid-cols-2 gap-2">
            {[
              { v: true, label: "With glass", hint: "Protective, subtle sheen" },
              { v: false, label: "No glass", hint: "Matte, no reflection" },
            ].map((g) => {
              const active = opts.glass === g.v;
              return (
                <button
                  key={String(g.v)}
                  type="button"
                  onClick={() => update({ glass: g.v })}
                  aria-pressed={active}
                  className={`rounded-xl border px-3 py-2 text-left transition-all ${
                    active ? "border-energy bg-energy/10" : "border-hairline hover:border-ink-faint"
                  }`}
                >
                  <span className="block text-sm text-ink">{g.label}</span>
                  <span className="block text-[10px] text-ink-faint">{g.hint}</span>
                </button>
              );
            })}
          </div>
        </Section>

        {/* actions */}
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() =>
              selected ? remove(portrait.id) : addOrUpdate({ id: portrait.id, title: portrait.title, options: opts })
            }
            aria-pressed={selected}
            className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 font-display text-sm font-semibold transition-all active:scale-95 ${
              selected ? "border-energy bg-energy/15 text-energy" : "border-hairline bg-surface text-ink hover:border-energy hover:text-energy"
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={selected ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
              <path d="M12 21s-7.5-4.6-10-9.3C.4 8.4 2 5 5.3 5c2 0 3.4 1.1 4.2 2.4L12 10l2.5-2.6C15.3 6.1 16.7 5 18.7 5 22 5 23.6 8.4 22 11.7 19.5 16.4 12 21 12 21Z" />
            </svg>
            {selected ? "Added ✓" : "Add to selection"}
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
        <p className="mt-3 text-xs text-ink-faint">
          Your size, frame ({frameStyle(opts.frame).label.toLowerCase()}) and glass choice are sent to the artist automatically.
        </p>
      </div>

      {arOpen && <ArPreview portrait={portrait} options={opts} onClose={() => setArOpen(false)} />}
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <p className="mb-2 font-display text-xs font-semibold uppercase tracking-[0.2em] text-ink-faint">{label}</p>
      {children}
    </div>
  );
}
