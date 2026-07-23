/**
 * Admin session auth — Edge-safe (Web Crypto only, no node:crypto) so it can run
 * in both middleware (Edge runtime) and route handlers.
 *
 * Session cookie value is an HMAC-signed token, NOT the password:  `${exp}.${sig}`
 * where sig = HMAC-SHA256(ADMIN_SESSION_SECRET, exp). Forging it requires the secret.
 */

export const SESSION_COOKIE = "sa_admin";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const enc = new TextEncoder();

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmac(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return toHex(sig);
}

async function sha256Hex(value: string): Promise<string> {
  return toHex(await crypto.subtle.digest("SHA-256", enc.encode(value)));
}

/** Constant-time compare of two equal-length hex strings. */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Compare a submitted password to ADMIN_PASSWORD in constant time.
 * Both are SHA-256'd first so length differences don't leak and the compare
 * is always over fixed-size input.
 */
export async function verifyPassword(submitted: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const [a, b] = await Promise.all([sha256Hex(submitted), sha256Hex(expected)]);
  return constantTimeEqual(a, b);
}

function secret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s) throw new Error("ADMIN_SESSION_SECRET is not set — cannot sign admin sessions.");
  return s;
}

export async function createSessionToken(): Promise<string> {
  const exp = String(Date.now() + SESSION_TTL_MS);
  const sig = await hmac(secret(), exp);
  return `${exp}.${sig}`;
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const dot = token.indexOf(".");
  if (dot <= 0) return false;
  const exp = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!/^\d+$/.test(exp)) return false;
  if (Number(exp) < Date.now()) return false;
  const expected = await hmac(secret(), exp);
  return constantTimeEqual(sig, expected);
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: Math.floor(SESSION_TTL_MS / 1000),
};
