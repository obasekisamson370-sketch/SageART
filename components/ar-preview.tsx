"use client";

import { createElement, useEffect, useRef, useState } from "react";
import type { PublicPortrait } from "@/lib/types";
import { DEFAULT_OPTIONS, describeOptions, type FrameOptions } from "@/lib/frame-options";
import { buildFramedModel, type FramedModel } from "@/lib/frame-model";
import { FramedImage } from "./framed-image";

type Status = "building" | "ready" | "error";

// minimal shape of the <model-viewer> element we use
type ModelViewerEl = HTMLElement & { canActivateAR?: boolean; activateAR?: () => void };

export function ArPreview({
  portrait,
  options = DEFAULT_OPTIONS,
  onClose,
}: {
  portrait: PublicPortrait;
  options?: FrameOptions;
  onClose: () => void;
}) {
  const [status, setStatus] = useState<Status>("building");
  const [model, setModel] = useState<FramedModel | null>(null);
  const [canAR, setCanAR] = useState<boolean | null>(null);
  const mvRef = useRef<ModelViewerEl | null>(null);
  const modelRef = useRef<FramedModel | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await import("@google/model-viewer"); // registers <model-viewer>
        const built = await buildFramedModel(portrait.image_url, options);
        if (cancelled) return built.cleanup();
        modelRef.current = built;
        setModel(built);
        setStatus("ready");
      } catch (e) {
        console.error("AR model build failed:", e);
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
      modelRef.current?.cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function onViewerLoad() {
    setCanAR(Boolean(mvRef.current?.canActivateAR));
  }

  function launchAR() {
    mvRef.current?.activateAR?.();
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-void">
      <div className="relative flex-1 overflow-hidden">
        {status === "ready" && model
          ? createElement("model-viewer", {
              ref: (el: ModelViewerEl | null) => {
                mvRef.current = el;
              },
              src: model.glb,
              "ios-src": model.usdz,
              alt: portrait.title,
              ar: true,
              "ar-modes": "webxr scene-viewer quick-look",
              "ar-placement": "wall",
              "ar-scale": "fixed",
              "camera-controls": true,
              "touch-action": "pan-y",
              "shadow-intensity": "1",
              "environment-image": "neutral",
              exposure: "1.05",
              "interaction-prompt": "none",
              onLoad: onViewerLoad,
              style: { width: "100%", height: "100%", backgroundColor: "#0a0b0f" },
            } as Record<string, unknown>)
          : null}

        {status === "building" && (
          <div className="absolute inset-0 grid place-items-center">
            <div className="flex flex-col items-center gap-3 text-ink-soft">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-hairline border-t-energy" />
              <p className="text-sm">Building your 3D frame…</p>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="absolute inset-0 grid place-items-center p-8">
            <div className="max-w-xs text-center">
              <div className="mx-auto mb-4 w-40">
                <FramedImage src={portrait.image_url} alt={portrait.title} frame={options.frame} glass={options.glass} sizes="200px" />
              </div>
              <p className="text-sm text-ink-soft">
                Couldn&apos;t build the 3D model on this device. Here&apos;s the framed preview instead.
              </p>
            </div>
          </div>
        )}

        {/* top bar */}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
          <p className="rounded-full bg-void/70 px-3 py-1.5 text-xs text-ink-soft backdrop-blur">
            {status === "ready"
              ? canAR === false
                ? "3D preview — open on an AR phone to place it on your wall"
                : "Drag to rotate · tap “View on your wall”"
              : "Preparing…"}
          </p>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-hairline bg-void/70 text-ink backdrop-blur active:scale-90"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* controls */}
      <div className="flex items-center justify-between gap-3 border-t border-hairline bg-surface px-4 py-3 pb-[calc(env(safe-area-inset-bottom,0)+0.75rem)]">
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-medium text-ink">{portrait.title}</p>
          <p className="truncate text-xs text-ink-faint">{describeOptions(options)}</p>
        </div>
        <button
          onClick={launchAR}
          disabled={status !== "ready"}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-energy px-4 py-2.5 font-display text-sm font-semibold text-void transition-transform active:scale-95 disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 2 3 7v10l9 5 9-5V7l-9-5Z" />
            <path d="m3 7 9 5 9-5M12 12v10" />
          </svg>
          View on your wall
        </button>
      </div>
    </div>
  );
}
