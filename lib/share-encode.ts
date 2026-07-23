import { isUuid } from "./uuid";
import { isFrameColorId, isSizeId, normalizeOptions, type FrameOptions } from "./frame-options";

/**
 * Encodes a selection (with per-item frame options) into a compact, URL-safe
 * `sel` param:  `uuid_size_frame_glass` per item, `,`-separated.
 * Example: `abcd..._16x20_wood_1,ef01..._8x10_black_0`
 */
export type ShareItem = { id: string; options: FrameOptions };

export function encodeSelection(items: { id: string; options: FrameOptions }[]): string {
  return items
    .map((i) => `${i.id}_${i.options.size}_${i.options.frame}_${i.options.glass ? 1 : 0}`)
    .join(",");
}

/**
 * Parses the `sel` param safely: validates the UUID, size, and frame; drops
 * anything malformed; de-dupes; caps the count (PRD §6.4 hardening).
 */
export function decodeSelection(raw: string | undefined, cap = 30): ShareItem[] {
  if (!raw) return [];
  const seen = new Map<string, ShareItem>();
  for (const part of raw.split(",")) {
    const [id, size, frame, glass] = part.split("_");
    if (!id || !isUuid(id.toLowerCase())) continue;
    const options = normalizeOptions({
      size: size && isSizeId(size) ? size : undefined,
      frame: frame && isFrameColorId(frame) ? frame : undefined,
      glass: glass === "1" ? true : glass === "0" ? false : undefined,
    });
    seen.set(id.toLowerCase(), { id: id.toLowerCase(), options });
    if (seen.size >= cap) break;
  }
  return [...seen.values()];
}
