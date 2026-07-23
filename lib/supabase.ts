import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. Copy them into .env.local.",
  );
}

/**
 * Anon client — safe to use anywhere (browser or server). Only reads what the
 * public RLS SELECT policy allows. Never trust it for writes.
 */
export const supabase = createClient(url, anonKey, {
  auth: { persistSession: false },
});

export const STORAGE_BUCKET = "portraits";
