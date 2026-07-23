/**
 * Frame customization options — shared by the gallery preview (CSS), the AR
 * preview (3D), the WhatsApp message, and the /share page encoding.
 */

export type FrameColorId = "wood" | "white" | "black" | "walnut";
export type SizeId = "8x10" | "12x15" | "16x20" | "20x25";

export type FrameOptions = {
  size: SizeId;
  frame: FrameColorId;
  glass: boolean;
};

export const DEFAULT_OPTIONS: FrameOptions = { size: "16x20", frame: "wood", glass: true };

/** All 4:5 aspect — matches the portrait crop used across the app. */
export const SIZES: { id: SizeId; label: string; cm: string; w: number; h: number }[] = [
  { id: "8x10", label: '8×10″', cm: "20×25 cm", w: 0.203, h: 0.254 },
  { id: "12x15", label: '12×15″', cm: "30×38 cm", w: 0.305, h: 0.381 },
  { id: "16x20", label: '16×20″', cm: "41×51 cm", w: 0.406, h: 0.508 },
  { id: "20x25", label: '20×25″', cm: "51×64 cm", w: 0.508, h: 0.635 },
];

type FrameStyle = {
  id: FrameColorId;
  label: string;
  /** CSS gradient for the frame surface */
  surface: string;
  /** grain/texture overlay */
  grain: string;
  grainOpacity: number;
  /** bevel + drop shadows */
  bevel: string;
  /** solid colors for the 3D AR frame */
  hex: number;
  hexDark: string;
  hexLight: string;
  base: string;
};

export const FRAME_COLORS: FrameStyle[] = [
  {
    id: "wood",
    label: "Wooden",
    surface:
      "linear-gradient(135deg,#8a5a24 0%,#b07f3e 16%,#8f6128 34%,#c99a55 52%,#8a5a24 70%,#a97e41 86%,#7d5220 100%)",
    grain:
      "repeating-linear-gradient(135deg, rgba(60,35,10,.30) 0 1.5px, transparent 1.5px 5px, rgba(255,220,160,.14) 5px 6px, transparent 6px 12px)",
    grainOpacity: 0.85,
    bevel:
      "inset 2px 2px 3px rgba(255,235,200,.35), inset -2px -2px 4px rgba(30,15,0,.55), 0 16px 34px -14px rgba(0,0,0,.75)",
    hex: 0xa3722f,
    base: "#a3722f",
    hexDark: "#6e4718",
    hexLight: "#cf9f5c",
  },
  {
    id: "white",
    label: "White",
    surface: "linear-gradient(135deg,#ffffff 0%,#e9e7e1 38%,#f8f7f3 62%,#d9d6cf 100%)",
    grain:
      "repeating-linear-gradient(135deg, rgba(120,115,105,.10) 0 1px, transparent 1px 6px)",
    grainOpacity: 0.7,
    bevel:
      "inset 2px 2px 3px rgba(255,255,255,.9), inset -2px -2px 4px rgba(90,85,75,.45), 0 16px 34px -14px rgba(0,0,0,.7)",
    hex: 0xf2f1ed,
    base: "#f2f1ed",
    hexDark: "#d5d2ca",
    hexLight: "#ffffff",
  },
  {
    id: "black",
    label: "Black",
    surface: "linear-gradient(135deg,#2e2e33 0%,#101013 42%,#28282d 72%,#0b0b0e 100%)",
    grain:
      "repeating-linear-gradient(135deg, rgba(255,255,255,.05) 0 1px, transparent 1px 6px)",
    grainOpacity: 0.8,
    bevel:
      "inset 2px 2px 3px rgba(255,255,255,.14), inset -2px -2px 4px rgba(0,0,0,.85), 0 16px 34px -14px rgba(0,0,0,.8)",
    hex: 0x1a1a1e,
    base: "#1a1a1e",
    hexDark: "#0a0a0c",
    hexLight: "#3a3a40",
  },
  {
    id: "walnut",
    label: "Dark Brown",
    surface:
      "linear-gradient(135deg,#3e2415 0%,#5a3820 28%,#33200f 54%,#63432a 78%,#2b1a0c 100%)",
    grain:
      "repeating-linear-gradient(135deg, rgba(20,10,2,.35) 0 1.5px, transparent 1.5px 5px, rgba(150,105,65,.16) 5px 6px, transparent 6px 11px)",
    grainOpacity: 0.9,
    bevel:
      "inset 2px 2px 3px rgba(190,140,95,.30), inset -2px -2px 4px rgba(10,5,0,.7), 0 16px 34px -14px rgba(0,0,0,.8)",
    hex: 0x4a2e1a,
    base: "#4a2e1a",
    hexDark: "#2b1a0c",
    hexLight: "#6f4c2e",
  },
];

export function frameStyle(id: FrameColorId): FrameStyle {
  return FRAME_COLORS.find((f) => f.id === id) ?? FRAME_COLORS[0];
}

export function sizeSpec(id: SizeId) {
  return SIZES.find((s) => s.id === id) ?? SIZES[2];
}

export function isSizeId(v: string): v is SizeId {
  return SIZES.some((s) => s.id === v);
}

export function isFrameColorId(v: string): v is FrameColorId {
  return FRAME_COLORS.some((f) => f.id === v);
}

export function normalizeOptions(o: Partial<FrameOptions> | undefined): FrameOptions {
  return {
    size: o?.size && isSizeId(o.size) ? o.size : DEFAULT_OPTIONS.size,
    frame: o?.frame && isFrameColorId(o.frame) ? o.frame : DEFAULT_OPTIONS.frame,
    glass: typeof o?.glass === "boolean" ? o.glass : DEFAULT_OPTIONS.glass,
  };
}

/** Human-readable summary used in the WhatsApp message and /share page. */
export function describeOptions(o: FrameOptions): string {
  return `${sizeSpec(o.size).label} · ${frameStyle(o.frame).label} frame · ${o.glass ? "with glass" : "no glass"}`;
}
