"use client";

import { useSelection } from "./selection-provider";
import { waLink } from "@/lib/whatsapp";

export function SelectionBar() {
  const { items, ids, clear, hydrated } = useSelection();

  if (!hydrated || items.length === 0) return null;

  function buildWhatsAppLink() {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const shareUrl = `${origin}/share?ids=${ids.join(",")}`;
    const titles = items.map((i) => `• ${i.title}`).join("\n");
    const message = `Hi! I'm interested in these SageART portraits:\n${titles}\n\nView them here: ${shareUrl}`;
    return waLink(message);
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pb-[calc(env(safe-area-inset-bottom,0)+1rem)]">
      <div className="animate-rise pointer-events-auto mx-auto flex max-w-2xl items-center gap-3 rounded-2xl border border-energy/40 bg-surface/95 p-3 pl-4 shadow-[0_16px_50px_-12px_rgba(0,0,0,0.7)] backdrop-blur-xl">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-energy/15 font-display text-sm font-bold text-energy">
            {items.length}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">
              {items.length} portrait{items.length > 1 ? "s" : ""} selected
            </p>
            <button onClick={clear} className="text-xs text-ink-faint underline-offset-2 hover:text-ink-soft hover:underline">
              Clear
            </button>
          </div>
        </div>
        <a
          href={buildWhatsAppLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-energy px-4 py-2.5 font-display text-sm font-semibold text-void transition-transform active:scale-95"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.5 14.4c-.3-.2-1.7-.8-2-.9-.3-.1-.5-.2-.7.2-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-1.7-.9-2.9-1.6-4-3.6-.3-.5.3-.5.8-1.6.1-.2 0-.4 0-.5 0-.2-.7-1.6-.9-2.2-.2-.5-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1 2.9 1.2 3.1c.2.2 2 3.1 5 4.3 1.9.7 2.6.8 3.5.7.6-.1 1.7-.7 1.9-1.4.2-.6.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3Z" />
            <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.1-1.3A10 10 0 1 0 12 2Zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20Z" />
          </svg>
          Send to seller
        </a>
      </div>
    </div>
  );
}
