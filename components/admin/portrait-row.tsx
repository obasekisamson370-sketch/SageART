"use client";

import { useActionState, useState } from "react";
import type { Portrait } from "@/lib/types";
import { deletePortrait, updatePortrait } from "@/app/admin/actions";

const field =
  "w-full rounded-lg border border-hairline bg-void px-2.5 py-1.5 text-sm text-ink placeholder:text-ink-faint focus:border-energy";

export function PortraitRow({ portrait }: { portrait: Portrait }) {
  const [editing, setEditing] = useState(false);
  const [state, action, pending] = useActionState(
    updatePortrait,
    null as { error?: string; ok?: boolean } | null,
  );

  if (state?.ok && editing) setEditing(false);

  if (!editing) {
    return (
      <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-medium text-ink">{portrait.title}</p>
          <p className="truncate text-xs text-ink-faint">
            {portrait.tags?.length ? portrait.tags.join(", ") : "no tags"}
            {portrait.price != null && ` · ₦${portrait.price.toLocaleString()}`}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => setEditing(true)}
            className="rounded-lg border border-hairline px-2.5 py-1 text-xs text-ink-soft hover:border-energy hover:text-energy"
          >
            Edit
          </button>
          <form action={deletePortrait}>
            <input type="hidden" name="id" value={portrait.id} />
            <input type="hidden" name="image_url" value={portrait.image_url} />
            <button
              className="rounded-lg border border-hairline px-2.5 py-1 text-xs text-ink-soft hover:border-danger hover:text-danger"
              onClick={(e) => {
                if (!confirm(`Delete "${portrait.title}"? This can't be undone.`)) e.preventDefault();
              }}
            >
              Delete
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="min-w-0 flex-1 space-y-2">
      <input type="hidden" name="id" value={portrait.id} />
      <input name="title" defaultValue={portrait.title} required className={field} />
      <input name="tags" defaultValue={portrait.tags?.join(", ")} placeholder="tags" className={field} />
      <input
        name="price"
        type="number"
        min="0"
        step="any"
        defaultValue={portrait.price ?? ""}
        placeholder="price"
        className={field}
      />
      {state?.error && <p className="text-xs text-danger">{state.error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-energy px-3 py-1.5 text-xs font-semibold text-void disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="rounded-lg border border-hairline px-3 py-1.5 text-xs text-ink-soft"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
