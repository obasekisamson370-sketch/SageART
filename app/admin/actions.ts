"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  SESSION_COOKIE,
  createSessionToken,
  sessionCookieOptions,
  verifyPassword,
  verifySessionToken,
} from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-admin";
import { STORAGE_BUCKET } from "@/lib/supabase";

/** Defence-in-depth: every write re-checks the session, not just middleware. */
async function assertSession() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!(await verifySessionToken(token))) redirect("/admin/login");
}

export async function login(_prev: unknown, formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (!(await verifyPassword(password))) {
    return { error: "Incorrect password." };
  }
  const token = await createSessionToken();
  (await cookies()).set(SESSION_COOKIE, token, sessionCookieOptions);
  redirect("/admin");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}

function parseTags(raw: string): string[] {
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 12);
}

function parsePrice(raw: string): number | null {
  const n = Number(raw);
  return raw.trim() !== "" && Number.isFinite(n) && n >= 0 ? n : null;
}

export async function createPortrait(_prev: unknown, formData: FormData) {
  await assertSession();

  const title = String(formData.get("title") ?? "").trim();
  const file = formData.get("image");
  const tags = parseTags(String(formData.get("tags") ?? ""));
  const price = parsePrice(String(formData.get("price") ?? ""));

  if (!title) return { error: "Title is required." };
  if (!(file instanceof File) || file.size === 0) return { error: "Please choose an image." };
  if (!file.type.startsWith("image/")) return { error: "File must be an image." };
  if (file.size > 8 * 1024 * 1024) return { error: "Image must be under 8 MB." };

  const admin = createAdminClient();
  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${crypto.randomUUID()}.${ext || "jpg"}`;

  const { error: upErr } = await admin.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (upErr) return { error: `Upload failed: ${upErr.message}` };

  const { data: pub } = admin.storage.from(STORAGE_BUCKET).getPublicUrl(path);

  const { error: insErr } = await admin
    .from("portraits")
    .insert({ title, image_url: pub.publicUrl, tags, price });
  if (insErr) {
    // roll back the orphaned upload
    await admin.storage.from(STORAGE_BUCKET).remove([path]);
    return { error: `Save failed: ${insErr.message}` };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return { ok: true };
}

export async function updatePortrait(_prev: unknown, formData: FormData) {
  await assertSession();
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const tags = parseTags(String(formData.get("tags") ?? ""));
  const price = parsePrice(String(formData.get("price") ?? ""));
  if (!id || !title) return { error: "Title is required." };

  const admin = createAdminClient();
  const { error } = await admin.from("portraits").update({ title, tags, price }).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/portrait/${id}`);
  return { ok: true };
}

export async function deletePortrait(formData: FormData) {
  await assertSession();
  const id = String(formData.get("id") ?? "");
  const imageUrl = String(formData.get("image_url") ?? "");
  if (!id) return;

  const admin = createAdminClient();
  await admin.from("portraits").delete().eq("id", id);

  // best-effort remove the storage object
  const marker = `/${STORAGE_BUCKET}/`;
  const idx = imageUrl.indexOf(marker);
  if (idx !== -1) {
    const path = imageUrl.slice(idx + marker.length);
    if (path) await admin.storage.from(STORAGE_BUCKET).remove([path]);
  }

  revalidatePath("/");
  revalidatePath("/admin");
}
