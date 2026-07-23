"use client";

import Image from "next/image";
import { frameStyle, type FrameColorId } from "@/lib/frame-options";

/**
 * A portrait rendered inside a realistic picture frame:
 * outer moulding (bevel + grain) → white mat → inner lip → image → optional glass.
 */
export function FramedImage({
  src,
  alt,
  frame,
  glass = true,
  mat = true,
  priority = false,
  sizes,
  frameWidth = 7,
  className = "",
}: {
  src: string;
  alt: string;
  frame: FrameColorId;
  glass?: boolean;
  mat?: boolean;
  priority?: boolean;
  sizes?: string;
  /** frame thickness as a % of the container width */
  frameWidth?: number;
  className?: string;
}) {
  const f = frameStyle(frame);
  const fw = `${frameWidth}%`;
  const matPad = mat ? `${frameWidth * 0.9}%` : "0%";

  return (
    <div
      className={`relative aspect-[4/5] w-full ${className}`}
      style={{ background: f.surface, padding: fw, borderRadius: "3px", boxShadow: f.bevel }}
    >
      {/* wood/paint grain over the moulding */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: f.grain, opacity: f.grainOpacity, borderRadius: "3px", mixBlendMode: "overlay" }}
      />
      {/* mat board */}
      <div
        className="relative h-full w-full"
        style={{
          background: mat ? "linear-gradient(135deg,#fbfaf7,#eceae4)" : "transparent",
          padding: matPad,
          boxShadow: "inset 0 0 0 1px rgba(0,0,0,.10), inset 3px 3px 8px rgba(0,0,0,.18)",
        }}
      >
        <div className="relative h-full w-full overflow-hidden" style={{ boxShadow: "inset 0 0 0 1px rgba(0,0,0,.35)" }}>
          <Image src={src} alt={alt} fill sizes={sizes ?? "400px"} priority={priority} className="object-cover" draggable={false} />
          {glass && (
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(125deg, rgba(255,255,255,.28) 0%, rgba(255,255,255,.06) 18%, transparent 34%, transparent 66%, rgba(255,255,255,.05) 84%, rgba(255,255,255,.16) 100%)",
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
