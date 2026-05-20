import React, {
  createContext, useCallback, useContext,
  useEffect, useState, ReactNode,
} from "react";
import { api } from "../api/client";
import type { DailyEntry } from "../types";

// ─── Shape ────────────────────────────────────────────────────────────────────
interface DataContextType {
  entries:     DailyEntry[];
  loading:     boolean;
  error:       string | null;
  refetch:     () => Promise<void>;
  // Entries
  addEntry:    (data: Omit<DailyEntry, "id">)             => Promise<DailyEntry>;
  updateEntry: (id: string, data: Omit<DailyEntry, "id">) => Promise<DailyEntry>;
  removeEntry: (id: string)                                => Promise<void>;
}

const DataContext = createContext<DataContextType>(null!);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function DataProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const e = await api.entries.list();
      setEntries(e as DailyEntry[]);
    } catch (err) {
      setError((err as Error).message ?? "Cannot reach backend.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  // ── Entries CRUD ──────────────────────────────────────────────────────────
  async function addEntry(data: Omit<DailyEntry, "id">) {
    const created = await api.entries.create(data);
    setEntries(prev => [created as DailyEntry, ...prev]);
    return created as DailyEntry;
  }

  async function updateEntry(id: string, data: Omit<DailyEntry, "id">) {
    const updated = await api.entries.update(id, data);
    setEntries(prev => prev.map(e => e.id === id ? updated as DailyEntry : e));
    return updated as DailyEntry;
  }

  async function removeEntry(id: string) {
    await api.entries.remove(id);
    setEntries(prev => prev.filter(e => e.id !== id));
  }

  return (
    <DataContext.Provider value={{
      entries, loading, error, refetch,
      addEntry, updateEntry, removeEntry,
    }}>
      {children}
    </DataContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useData() {
  return useContext(DataContext);
}
