"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { PublicPortrait } from "@/lib/types";

type CamState = "loading" | "live" | "fallback";

export function ArPreview({ portrait, onClose }: { portrait: PublicPortrait; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cam, setCam] = useState<CamState>("loading");

  // frame position (center, in px relative to stage) + width
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [width, setWidth] = useState(220);
  const drag = useRef<null | { mode: "move" | "resize"; startX: number; startY: number; ox: number; oy: number; ow: number }>(null);

  // start camera
  useEffect(() => {
    let cancelled = false;
    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCam("fallback");
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setCam("live");
      } catch {
        // permission denied, no camera, or insecure context (http:// on LAN)
        setCam("fallback");
      }
    }
    start();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // center the frame once the stage is measured
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos({ x: r.width / 2, y: r.height / 2 });
    setWidth(Math.min(240, r.width * 0.6));
  }, []);

  // esc to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const onPointerDown = useCallback(
    (mode: "move" | "resize") => (e: React.PointerEvent) => {
      e.preventDefault();
      (e.target as Element).setPointerCapture?.(e.pointerId);
      drag.current = { mode, startX: e.clientX, startY: e.clientY, ox: pos.x, oy: pos.y, ow: width };
    },
    [pos, width],
  );

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (d.mode === "move") {
      const stage = stageRef.current?.getBoundingClientRect();
      const nx = d.ox + dx;
      const ny = d.oy + dy;
      setPos({
        x: stage ? Math.max(0, Math.min(stage.width, nx)) : nx,
        y: stage ? Math.max(0, Math.min(stage.height, ny)) : ny,
      });
    } else {
      setWidth(Math.max(90, Math.min(560, d.ow + dx)));
    }
  }, []);

  const endDrag = useCallback((e: React.PointerEvent) => {
    (e.target as Element).releasePointerCapture?.(e.pointerId);
    drag.current = null;
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-void">
      {/* stage */}
      <div ref={stageRef} className="relative flex-1 overflow-hidden touch-none select-none">
        {/* background: live camera or fallback wall */}
        {cam === "fallback" ? (
          <FallbackWall />
        ) : (
          <video ref={videoRef} playsInline muted className="absolute inset-0 h-full w-full object-cover" />
        )}
        {cam === "loading" && (
          <div className="absolute inset-0 grid place-items-center bg-void/70 text-sm text-ink-soft">
            Starting camera…
          </div>
        )}

        {/* draggable portrait frame */}
        <div
          onPointerDown={onPointerDown("move")}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          className="absolute cursor-grab active:cursor-grabbing"
          style={{ left: pos.x, top: pos.y, width, transform: "translate(-50%, -50%)" }}
        >
          <div className="hud-frame relative aspect-[4/5] w-full overflow-hidden rounded-sm border border-white/70 shadow-[0_10px_40px_rgba(0,0,0,0.6)] ring-1 ring-black/20">
            <Image src={portrait.image_url} alt={portrait.title} fill sizes="560px" className="object-cover" draggable={false} />
          </div>
          {/* resize handle */}
          <button
            aria-label="Resize"
            onPointerDown={onPointerDown("resize")}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            className="absolute -bottom-3 -right-3 grid h-9 w-9 cursor-se-resize place-items-center rounded-full border border-energy bg-void/80 text-energy backdrop-blur"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v6h-6M9 3H3v6M3 3l7 7M21 21l-7-7" />
            </svg>
          </button>
        </div>

        {/* hint */}
        <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center px-4">
          <p className="rounded-full bg-void/70 px-3 py-1.5 text-center text-xs text-ink-soft backdrop-blur">
            {cam === "fallback"
              ? "Camera unavailable — previewing on a sample wall. Drag & resize the frame."
              : "Drag to move · use the corner handle to resize"}
          </p>
        </div>
      </div>

      {/* controls */}
      <div className="flex items-center justify-between gap-3 border-t border-hairline bg-surface px-4 py-3 pb-[calc(env(safe-area-inset-bottom,0)+0.75rem)]">
        <p className="truncate font-display text-sm font-medium text-ink">{portrait.title}</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWidth((w) => Math.max(90, w - 30))}
            aria-label="Smaller"
            className="grid h-10 w-10 place-items-center rounded-lg border border-hairline text-ink-soft active:scale-90"
          >
            −
          </button>
          <button
            onClick={() => setWidth((w) => Math.min(560, w + 30))}
            aria-label="Larger"
            className="grid h-10 w-10 place-items-center rounded-lg border border-hairline text-ink-soft active:scale-90"
          >
            +
          </button>
          <button
            onClick={onClose}
            className="rounded-lg bg-energy px-4 py-2.5 font-display text-sm font-semibold text-void active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function FallbackWall() {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-gradient-to-b from-[#2a2d36] via-[#20222b] to-[#14151b]" />
      {/* floor line */}
      <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-b from-[#191b22] to-[#0e0f13]" />
      <div className="absolute inset-x-0 bottom-1/4 h-px bg-black/50" />
    </div>
  );
}
