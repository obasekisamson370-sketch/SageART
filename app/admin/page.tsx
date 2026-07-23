import Image from "next/image";
import { createAdminClient } from "@/lib/supabase-admin";
import type { Portrait } from "@/lib/types";
import { Logo } from "@/components/logo";
import { logout } from "./actions";
import { UploadForm } from "@/components/admin/upload-form";
import { PortraitRow } from "@/components/admin/portrait-row";

export const dynamic = "force-dynamic";

async function getAll(): Promise<Portrait[]> {
  const admin = createAdminClient();
  const { data } = await admin.from("portraits").select("*").order("created_at", { ascending: false });
  return (data as Portrait[]) ?? [];
}

export default async function AdminPage() {
  const portraits = await getAll();

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-hairline bg-void/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="rounded-full border border-hairline px-2 py-0.5 text-xs text-ink-faint">admin</span>
          </div>
          <form action={logout}>
            <button className="rounded-full border border-hairline px-3 py-1.5 text-sm text-ink-soft transition-colors hover:border-danger hover:text-danger">
              Log out
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
          <section>
            <h2 className="mb-3 font-display text-lg font-semibold text-ink">Add a portrait</h2>
            <UploadForm />
          </section>

          <section>
            <h2 className="mb-3 font-display text-lg font-semibold text-ink">
              Portraits <span className="text-ink-faint">({portraits.length})</span>
            </h2>
            {portraits.length === 0 ? (
              <p className="rounded-card border border-dashed border-hairline p-8 text-center text-sm text-ink-faint">
                No portraits yet. Add your first one on the left.
              </p>
            ) : (
              <ul className="space-y-3">
                {portraits.map((p) => (
                  <li key={p.id}>
                    <div className="flex gap-3 rounded-card border border-hairline bg-surface p-3">
                      <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-md bg-surface-2">
                        <Image src={p.image_url} alt={p.title} fill sizes="64px" className="object-cover" />
                      </div>
                      <PortraitRow portrait={p} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
