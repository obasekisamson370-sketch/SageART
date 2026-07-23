"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_OPTIONS, type FrameOptions } from "@/lib/frame-options";

export type SelectedItem = { id: string; title: string; options: FrameOptions };

type SelectionState = {
  items: SelectedItem[];
  ids: string[];
  has: (id: string) => boolean;
  get: (id: string) => SelectedItem | undefined;
  /** Toggle membership. When adding, keeps existing options or falls back to defaults. */
  toggle: (item: { id: string; title: string; options?: FrameOptions }) => void;
  /** Add (or update) with explicit options — used by the detail configurator. */
  addOrUpdate: (item: SelectedItem) => void;
  setOptions: (id: string, options: FrameOptions) => void;
  remove: (id: string) => void;
  clear: () => void;
  hydrated: boolean;
};

const SelectionContext = createContext<SelectionState | null>(null);
const STORAGE_KEY = "sageart:selection:v2";
const MAX_SELECTION = 30;

export function SelectionProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<SelectedItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items, hydrated]);

  const toggle = useCallback((item: { id: string; title: string; options?: FrameOptions }) => {
    setItems((prev) => {
      if (prev.some((p) => p.id === item.id)) return prev.filter((p) => p.id !== item.id);
      if (prev.length >= MAX_SELECTION) return prev;
      return [...prev, { id: item.id, title: item.title, options: item.options ?? DEFAULT_OPTIONS }];
    });
  }, []);

  const addOrUpdate = useCallback((item: SelectedItem) => {
    setItems((prev) => {
      const exists = prev.some((p) => p.id === item.id);
      if (exists) return prev.map((p) => (p.id === item.id ? item : p));
      if (prev.length >= MAX_SELECTION) return prev;
      return [...prev, item];
    });
  }, []);

  const setOptions = useCallback((id: string, options: FrameOptions) => {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, options } : p)));
  }, []);

  const remove = useCallback((id: string) => setItems((prev) => prev.filter((p) => p.id !== id)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<SelectionState>(
    () => ({
      items,
      ids: items.map((i) => i.id),
      has: (id) => items.some((i) => i.id === id),
      get: (id) => items.find((i) => i.id === id),
      toggle,
      addOrUpdate,
      setOptions,
      remove,
      clear,
      hydrated,
    }),
    [items, toggle, addOrUpdate, setOptions, remove, clear, hydrated],
  );

  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
}

export function useSelection() {
  const ctx = useContext(SelectionContext);
  if (!ctx) throw new Error("useSelection must be used within <SelectionProvider>");
  return ctx;
}

export { MAX_SELECTION };
