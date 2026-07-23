"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PublicPortrait } from "@/lib/types";
import { DEFAULT_OPTIONS, frameStyle, sizeSpec, type FrameOptions } from "@/lib/frame-options";

type CamState = "loading" | "live" | "fallback";

type OrientEvent = DeviceOrientationEvent & { webkitCompassHeading?: number };

/** normalize an angle delta into -180..180 */
function wrap(d: number) {
  return ((d + 540) % 360) - 180;
}

export function ArPreview({
  portrait,
  options = DEFAULT_OPTIONS,
  onClose,
}: {
  portrait: PublicPortrait;
  options?: FrameOptions;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cam, setCam] = useState<CamState>("loading");

  const [locked, setLocked] = useState(false);
  const [gyro, setGyro] = useState(false); // orientation actively driving position

  // placed frame: base screen position (px) + width (px)
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [width, setWidth] = useState(200);
  // live offset from gyro while locked
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const anchor = useRef<{ alpha: number; beta: number } | null>(null);
  const drag = useRef<null | { mode: "move" | "resize"; sx: number; sy: number; ox: number; oy: number; ow: number }>(null);

  const f = frameStyle(options.frame);

  // ---- camera ----
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!navigator.mediaDevices?.getUserMedia) return setCam("fallback");
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (cancelled) return stream.getTracks().forEach((t) => t.stop());
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setCam("live");
      } catch {
        setCam("fallback");
      }
    })();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // center the frame once measured, sized to the chosen real-world size
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos({ x: r.width / 2, y: r.height / 2 });
    // scale on-screen size loosely to the physical size, clamped to the stage
    const spec = sizeSpec(options.size);
    const rel = 0.42 + (spec.w - 0.203) * 0.9; // 0.42..~0.7
    setWidth(Math.min(r.width * rel, r.width * 0.8));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // ---- gyro wall-lock ----
  const handleOrient = useCallback((e: DeviceOrientationEvent) => {
    const ev = e as OrientEvent;
    const alpha = ev.webkitCompassHeading ?? ev.alpha ?? 0;
    const beta = ev.beta ?? 0;
    if (!anchor.current) {
      anchor.current = { alpha, beta };
      return;
    }
    const stage = stageRef.current?.getBoundingClientRect();
    const w = stage?.width ?? 360;
    const h = stage?.height ?? 640;
    const pxPerDegX = w / 60; // ~60° horizontal FOV
    const pxPerDegY = h / 90;
    const dYaw = wrap(alpha - anchor.current.alpha);
    const dPitch = beta - anchor.current.beta;
    // world stays fixed → frame shifts opposite to head rotation
    const ox = -dYaw * pxPerDegX * (ev.webkitCompassHeading != null ? 1 : -1);
    const oy = dPitch * pxPerDegY;
    setOffset({ x: ox, y: oy });
    setTilt({ x: Math.max(-10, Math.min(10, dPitch * 0.25)), y: Math.max(-12, Math.min(12, -dYaw * 0.3)) });
  }, []);

  async function lockToWall() {
    // iOS 13+ requires an explicit permission request from a user gesture
    const D = window.DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<"granted" | "denied">;
    };
    try {
      if (typeof D?.requestPermission === "function") {
        const res = await D.requestPermission();
        if (res !== "granted") {
          setLocked(true); // still lock, just without stabilization
          return;
        }
      }
      anchor.current = null;
      setOffset({ x: 0, y: 0 });
      window.addEventListener("deviceorientation", handleOrient, true);
      setGyro(true);
      setLocked(true);
    } catch {
      setLocked(true);
    }
  }

  function unlock() {
    window.removeEventListener("deviceorientation", handleOrient, true);
    anchor.current = null;
    setGyro(false);
    setLocked(false);
    setOffset({ x: 0, y: 0 });
    setTilt({ x: 0, y: 0 });
  }

  useEffect(() => () => window.removeEventListener("deviceorientation", handleOrient, true), [handleOrient]);

  // ---- drag / resize (only when not locked) ----
  const onDown = (mode: "move" | "resize") => (e: React.PointerEvent) => {
    if (locked) return;
    e.preventDefault();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    drag.current = { mode, sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y, ow: width };
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.sx;
    const dy = e.clientY - d.sy;
    if (d.mode === "move") {
      const st = stageRef.current?.getBoundingClientRect();
      setPos({
        x: st ? Math.max(0, Math.min(st.width, d.ox + dx)) : d.ox + dx,
        y: st ? Math.max(0, Math.min(st.height, d.oy + dy)) : d.oy + dy,
      });
    } else {
      setWidth(Math.max(90, Math.min(620, d.ow + dx)));
    }
  };
  const onUp = (e: React.PointerEvent) => {
    (e.target as Element).releasePointerCapture?.(e.pointerId);
    drag.current = null;
  };

  const depth = Math.max(8, width * 0.045); // frame thickness in px

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-void">
      <div ref={stageRef} className="relative flex-1 touch-none select-none overflow-hidden" style={{ perspective: 1200 }}>
        {cam === "fallback" ? (
          <FallbackWall />
        ) : (
          <video ref={videoRef} playsInline muted className="absolute inset-0 h-full w-full object-cover" />
        )}
        {cam === "loading" && (
          <div className="absolute inset-0 grid place-items-center bg-void/70 text-sm text-ink-soft">Starting camera…</div>
        )}

        {/* the 3D framed portrait */}
        <div
          onPointerDown={onDown("move")}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          className={locked ? "absolute" : "absolute cursor-grab active:cursor-grabbing"}
          style={{
            left: pos.x + offset.x,
            top: pos.y + offset.y,
            width,
            transform: `translate(-50%,-50%) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transformStyle: "preserve-3d",
            transition: gyro ? "transform 0.06s linear" : "none",
            willChange: "left, top, transform",
          }}
        >
          <Frame3D src={portrait.image_url} alt={portrait.title} f={f} glass={options.glass} depth={depth} tiltY={tilt.y} />

          {!locked && (
            <button
              aria-label="Resize"
              onPointerDown={onDown("resize")}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
              className="absolute -bottom-3 -right-3 grid h-9 w-9 cursor-se-resize place-items-center rounded-full border border-energy bg-void/80 text-energy backdrop-blur"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v6h-6M9 3H3v6M3 3l7 7M21 21l-7-7" />
              </svg>
            </button>
          )}
        </div>

        {/* hint */}
        <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center px-4">
          <p className="rounded-full bg-void/70 px-3 py-1.5 text-center text-xs text-ink-soft backdrop-blur">
            {cam === "fallback"
              ? "Camera unavailable — sample wall. Position, then Lock to wall."
              : locked
                ? gyro
                  ? "Locked — move your phone around, it stays on the wall"
                  : "Locked in place"
                : "Drag & resize to fit your wall, then Lock to wall"}
          </p>
        </div>
      </div>

      {/* controls */}
      <div className="flex items-center justify-between gap-3 border-t border-hairline bg-surface px-4 py-3 pb-[calc(env(safe-area-inset-bottom,0)+0.75rem)]">
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-medium text-ink">{portrait.title}</p>
          <p className="truncate text-xs text-ink-faint">
            {sizeSpec(options.size).label} · {f.label} · {options.glass ? "glass" : "no glass"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!locked ? (
            <button onClick={lockToWall} className="rounded-lg bg-energy px-4 py-2.5 font-display text-sm font-semibold text-void active:scale-95">
              Lock to wall
            </button>
          ) : (
            <button onClick={unlock} className="rounded-lg border border-hairline px-4 py-2.5 font-display text-sm font-medium text-ink-soft active:scale-95">
              Reposition
            </button>
          )}
          <button onClick={onClose} className="rounded-lg border border-hairline px-4 py-2.5 font-display text-sm font-medium text-ink active:scale-95">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

/** A picture frame with real depth: extruded side faces + recessed image + glass. */
function Frame3D({
  src,
  alt,
  f,
  glass,
  depth,
  tiltY,
}: {
  src: string;
  alt: string;
  f: ReturnType<typeof frameStyle>;
  glass: boolean;
  depth: number;
  tiltY: number;
}) {
  const border = Math.max(10, depth * 1.6);
  return (
    <div className="relative aspect-[4/5] w-full" style={{ transformStyle: "preserve-3d" }}>
      {/* extruded right/left side face to give thickness */}
      <div
        className="absolute inset-y-0"
        style={{
          width: depth,
          right: tiltY <= 0 ? 0 : "auto",
          left: tiltY > 0 ? 0 : "auto",
          background: f.hexDark,
          transform: `translateZ(-${depth}px)`,
          filter: "brightness(0.7)",
        }}
      />
      {/* frame moulding */}
      <div
        className="relative h-full w-full"
        style={{
          background: f.surface,
          padding: border,
          borderRadius: 3,
          boxShadow: `${f.bevel}, 0 26px 46px -12px rgba(0,0,0,.85)`,
        }}
      >
        <div className="pointer-events-none absolute inset-0" style={{ background: f.grain, opacity: f.grainOpacity, mixBlendMode: "overlay", borderRadius: 3 }} />
        {/* mat + recessed image */}
        <div
          className="relative h-full w-full"
          style={{ background: "linear-gradient(135deg,#fbfaf7,#eceae4)", padding: border * 0.7, boxShadow: "inset 3px 3px 10px rgba(0,0,0,.22)" }}
        >
          <div className="relative h-full w-full overflow-hidden" style={{ boxShadow: "inset 0 0 0 1px rgba(0,0,0,.4)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={alt} className="h-full w-full object-cover" draggable={false} />
            {glass && (
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background: `linear-gradient(${125 + tiltY * 2}deg, rgba(255,255,255,.30) 0%, rgba(255,255,255,.05) 20%, transparent 38%, transparent 64%, rgba(255,255,255,.06) 82%, rgba(255,255,255,.20) 100%)`,
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FallbackWall() {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-gradient-to-b from-[#2a2d36] via-[#20222b] to-[#14151b]" />
      <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-b from-[#191b22] to-[#0e0f13]" />
      <div className="absolute inset-x-0 bottom-1/4 h-px bg-black/50" />
    </div>
  );
}
