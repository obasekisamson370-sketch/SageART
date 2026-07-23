"use client";

import { useEffect } from "react";

/**
 * Makes the site behave like a native app on mobile:
 * - blocks Safari pinch-zoom (gesturestart) which ignores the viewport meta
 * - blocks double-tap zoom leftovers
 * Desktop keyboard zoom (ctrl +/-) is intentionally left alone for accessibility.
 */
export function NativeFeel() {
  useEffect(() => {
    const stop = (e: Event) => e.preventDefault();
    document.addEventListener("gesturestart", stop);
    document.addEventListener("gesturechange", stop);
    let lastTouch = 0;
    const onTouchEnd = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouch < 300 && e.cancelable) e.preventDefault();
      lastTouch = now;
    };
    document.addEventListener("touchend", onTouchEnd, { passive: false });
    return () => {
      document.removeEventListener("gesturestart", stop);
      document.removeEventListener("gesturechange", stop);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, []);
  return null;
}
