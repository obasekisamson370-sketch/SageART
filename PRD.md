# SageART — Product Requirements Document

## 1. Summary
SageART is a mobile-first web app for a Warframe-themed portrait artist (based in Nigeria) to showcase and sell his art. Customers browse a gallery, preview a portrait on their own wall using their phone camera, then send their chosen picks straight to the seller's WhatsApp to negotiate price/purchase manually.

**Out of scope for v1:** no in-app checkout/payment, no customer accounts/login, no automated WhatsApp image attachments (see §5).

## 2. Users
- **Seller (admin)** — the artist. Needs to upload new portraits, edit/remove old ones. Single user, password-gated — no need for full multi-user auth.
- **Customer (public)** — anonymous visitor. Browses, previews in AR, selects favorites, sends to WhatsApp. No login required.

## 3. Tech stack
- **Next.js 15** (App Router, TypeScript, Tailwind CSS)
- **Supabase** — Postgres (portraits table) + Storage (portrait images)
- Deploy target: Vercel
- PWA: installable (manifest + icons), mobile-first layout

## 4. Environment variables
See `.env.local` in this folder — already contains the real Supabase URL and anon key. Two values still need filling in locally (never commit them, never paste the service role key into chat with an AI):
- `SUPABASE_SERVICE_ROLE_KEY` — from Supabase dashboard → Settings → API → service_role secret. Used **server-side only** (route handlers/server actions), never exposed to the browser.
- `ADMIN_PASSWORD` — a password the seller uses to log into `/admin`. Must be changed from the `changeme` placeholder before any deploy.
- `ADMIN_SESSION_SECRET` — random 32-byte secret used to HMAC-sign the admin session cookie (see §6.1). Generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.

## 5. Data model
Table `portraits` (see `supabase/schema.sql` for exact SQL to run in the Supabase SQL editor):

| column | type | notes |
|---|---|---|
| id | uuid | primary key, default `gen_random_uuid()` |
| title | text | required |
| image_url | text | public URL from Supabase Storage |
| tags | text[] | optional, for future filtering |
| price | numeric | optional, informational only (no checkout) |
| created_at | timestamptz | default `now()` |

Row Level Security: public `SELECT` allowed on `portraits`. All `INSERT`/`UPDATE`/`DELETE` happen server-side using the service role key after the `/admin` password check — no public write policy needed.

Storage: public bucket `portraits` for images, public read policy.

## 6. Core flows

### 6.1 Seller admin (`/admin`)
- **Password gate, done safely:**
  - Compare the submitted password to `ADMIN_PASSWORD` in **constant time** (`crypto.timingSafeEqual` on equal-length buffers) to avoid timing leaks.
  - On success, set an **httpOnly, Secure, SameSite=Lax session cookie whose value is an HMAC-signed token** (e.g. `{ exp }` payload signed with `ADMIN_SESSION_SECRET`), **not** the raw password. Verify the signature on every admin request via middleware — a raw-password cookie would let anyone forge a session.
  - Give the token an expiry (e.g. 7 days) and provide a logout that clears the cookie.
- Form to upload an image + title (+ optional tags/price) → uploads to Supabase Storage `portraits` bucket, inserts a row via a server action using the service role key.
- List of existing portraits with edit/delete.

### 6.2 Public gallery (`/`)
- Grid of portrait thumbnails, newest first.
- Tap a portrait → detail page (`/portrait/[id]`) with full image, title, "Select" toggle, and "View on your wall" button.

### 6.3 AR wall preview
MVP approach — **camera overlay**, not true plane-anchored AR:
- Request camera access (`getUserMedia`), show the live feed full-screen.
- Overlay the portrait image on top; customer can drag to reposition and pinch/drag-handle to resize, approximating "hung on the wall."
- Desktop/no-camera fallback: show the portrait in a static mockup room/wall image instead of erroring out.
- **Upgrade path (not v1):** true AR via Google's `<model-viewer>` component (triggers iOS AR Quick Look / Android Scene Viewer) with a generated textured plane per image — revisit only if the overlay feels too flat in practice.

### 6.4 Selection → WhatsApp handoff
- Customer can select multiple portraits (heart/checkbox) across the gallery; a persistent "Send to seller" bar appears once ≥1 is selected.
- Tapping it opens `https://wa.me/<seller-number>?text=<encoded message>`:
  - Message lists the selected portrait titles and a link to `/share?ids=<uuid>,<uuid>,…` — a page rendering exactly those portraits with images, so the seller taps once and sees everything without needing files manually attached.
  - **`/share` must validate input:** ids are UUIDs (§5), not integers. Parse the comma-separated list, drop anything that isn't a valid UUID, de-duplicate, and **cap the count** (e.g. max 30) before querying, so a hand-crafted URL can't trigger an unbounded/expensive query.
  - **Known limitation:** `wa.me` links can only pre-fill text, not attach actual image files. This free approach is the intentional v1 choice (no WhatsApp Business API, no cost, no approval wait). Revisit only if the seller wants full automation later (requires Meta business verification + paid provider like Twilio/360dialog).
- Seller's WhatsApp number: `+2348064165252`.

## 7. Build phases
1. Scaffold Next.js + Supabase wiring, run `supabase/schema.sql`.
2. Seller admin: upload/edit/delete portraits.
3. Public gallery + detail view.
4. Selection + WhatsApp handoff + `/share` page.
5. AR camera-overlay preview.
6. Polish: PWA manifest/install prompt, loading/empty states, basic mobile QA.

**QA note on the AR preview:** `getUserMedia` requires a **secure context** — it works on `https://` (Vercel) and on `http://localhost`, but silently fails on a plain `http://` LAN IP (e.g. testing from your phone on `http://192.168.x.x:3000`). To test AR on a real phone during dev, use a tunnel that gives HTTPS (`vercel dev` + a preview deploy, or `ngrok http 3000`). Always keep the desktop/no-camera static-mockup fallback (§6.3) so the page never hard-errors.

## 8. Decisions locked (2026-07-23)
- **Theme:** Warframe sci-fi — near-black `#0A0B0F`, energy-teal accent `#3BE8D0`, HUD corner-bracket motifs, cinematic gallery-first layout.
- **Prices:** hidden from the public gallery. Stored on the row for the seller's reference and shown/edited in `/admin` only. All negotiation happens on WhatsApp.
- Still open: final logo artwork and PWA icon assets (placeholder wordmark + generated icons until supplied).
