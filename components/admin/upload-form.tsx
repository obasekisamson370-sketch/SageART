"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createPortrait } from "@/app/admin/actions";

const field =
  "w-full rounded-xl border border-hairline bg-void px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-energy";

export function UploadForm() {
  const [state, action, pending] = useActionState(
    createPortrait,
    null as { error?: string; ok?: boolean } | null,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      setPreview(null);
    }
  }, [state?.ok]);

  return (
    <form
      ref={formRef}
      action={action}
      className="hud-frame space-y-3 rounded-card border border-hairline bg-surface p-5"
    >
      <label className="block">
        <span className="mb-1 block text-xs text-ink-soft">Image</span>
        <input
          type="file"
          name="image"
          accept="image/*"
          required
          onChange={(e) => {
            const f = e.target.files?.[0];
            setPreview(f ? URL.createObjectURL(f) : null);
          }}
          className="block w-full text-sm text-ink-soft file:mr-3 file:rounded-lg file:border-0 file:bg-energy/15 file:px-3 file:py-2 file:text-sm file:font-medium file:text-energy"
        />
      </label>

      {preview && (
        <div className="relative aspect-[4/5] w-28 overflow-hidden rounded-md border border-hairline">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Preview" className="h-full w-full object-cover" />
        </div>
      )}

      <label className="block">
        <span className="mb-1 block text-xs text-ink-soft">Title</span>
        <input name="title" required placeholder="e.g. Excalibur Umbra" className={field} />
      </label>

      <label className="block">
        <span className="mb-1 block text-xs text-ink-soft">Tags (comma-separated, optional)</span>
        <input name="tags" placeholder="warframe, prime, ink" className={field} />
      </label>

      <label className="block">
        <span className="mb-1 block text-xs text-ink-soft">Price (optional, seller-only)</span>
        <input name="price" type="number" min="0" step="any" placeholder="20000" className={field} />
      </label>

      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      {state?.ok && <p className="text-sm text-energy">Added ✓</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-energy px-4 py-2.5 font-display text-sm font-semibold text-void transition-transform active:scale-95 disabled:opacity-60"
      >
        {pending ? "Uploading…" : "Add portrait"}
      </button>
    </form>
  );
}
