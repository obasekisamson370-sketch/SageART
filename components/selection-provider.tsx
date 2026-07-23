"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type SelectedItem = { id: string; title: string };

type SelectionState = {
  items: SelectedItem[];
  ids: string[];
  has: (id: string) => boolean;
  toggle: (item: SelectedItem) => void;
  remove: (id: string) => void;
  clear: () => void;
  hydrated: boolean;
};

const SelectionContext = createContext<SelectionState | null>(null);
const STORAGE_KEY = "sageart:selection";
const MAX_SELECTION = 30; // mirrors the /share cap (PRD §6.4)

export function SelectionProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<SelectedItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore malformed storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage may be full or blocked */
    }
  }, [items, hydrated]);

  const toggle = useCallback((item: SelectedItem) => {
    setItems((prev) => {
      if (prev.some((p) => p.id === item.id)) return prev.filter((p) => p.id !== item.id);
      if (prev.length >= MAX_SELECTION) return prev; // cap silently
      return [...prev, item];
    });
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<SelectionState>(
    () => ({
      items,
      ids: items.map((i) => i.id),
      has: (id) => items.some((i) => i.id === id),
      toggle,
      remove,
      clear,
      hydrated,
    }),
    [items, toggle, remove, clear, hydrated],
  );

  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
}

export function useSelection() {
  const ctx = useContext(SelectionContext);
  if (!ctx) throw new Error("useSelection must be used within <SelectionProvider>");
  return ctx;
}

export { MAX_SELECTION };
