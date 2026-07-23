"use client";

import { useActionState } from "react";
import { login } from "../actions";
import { Logo } from "@/components/logo";

export default function AdminLoginPage() {
  const [state, action, pending] = useActionState(login, null as { error?: string } | null);

  return (
    <div className="grid min-h-dvh place-items-center px-4">
      <div className="hud-frame w-full max-w-sm rounded-card border border-hairline bg-surface p-8">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <h1 className="text-center font-display text-xl font-semibold text-ink">Artist login</h1>
        <p className="mt-1 text-center text-sm text-ink-faint">Enter your password to manage the gallery.</p>

        <form action={action} className="mt-6 space-y-3">
          <input
            type="password"
            name="password"
            required
            autoFocus
            autoComplete="current-password"
            placeholder="Password"
            className="w-full rounded-xl border border-hairline bg-void px-4 py-3 text-ink placeholder:text-ink-faint focus:border-energy"
          />
          {state?.error && <p className="text-sm text-danger">{state.error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-energy px-4 py-3 font-display text-sm font-semibold text-void transition-transform active:scale-95 disabled:opacity-60"
          >
            {pending ? "Checking…" : "Enter"}
          </button>
        </form>
      </div>
    </div>
  );
}
