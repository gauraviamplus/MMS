import React, {
  createContext, useCallback, useContext,
  useEffect, useState, ReactNode,
} from "react";
import { api } from "../api/client";
import type { DailyEntry } from "../types";
import type { Animal } from "../data/animalsData";

// ─── Shape ────────────────────────────────────────────────────────────────────
interface DataContextType {
  animals:      Animal[];
  entries:      DailyEntry[];
  loading:      boolean;
  error:        string | null;
  refetch:      () => Promise<void>;
  // Animals
  addAnimal:    (data: Omit<Animal, "id">)                    => Promise<Animal>;
  updateAnimal: (id: string, data: Omit<Animal, "id">)        => Promise<Animal>;
  removeAnimal: (id: string)                                   => Promise<void>;
  // Entries
  addEntry:     (data: Omit<DailyEntry, "id">)                => Promise<DailyEntry>;
  updateEntry:  (id: string, data: Omit<DailyEntry, "id">)    => Promise<DailyEntry>;
  removeEntry:  (id: string)                                   => Promise<void>;
}

const DataContext = createContext<DataContextType>(null!);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function DataProvider({ children }: { children: ReactNode }) {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [a, e] = await Promise.all([api.animals.list(), api.entries.list()]);
      setAnimals(a);
      // Cast animalType string → union so TypeScript is happy downstream
      setEntries(e as DailyEntry[]);
    } catch (err) {
      setError((err as Error).message ?? "Cannot reach backend.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  // ── Animals CRUD ──────────────────────────────────────────────────────────
  async function addAnimal(data: Omit<Animal, "id">) {
    const created = await api.animals.create(data);
    setAnimals(prev => [...prev, created]);
    return created;
  }

  async function updateAnimal(id: string, data: Omit<Animal, "id">) {
    const updated = await api.animals.update(id, data);
    setAnimals(prev => prev.map(a => a.id === id ? updated : a));
    return updated;
  }

  async function removeAnimal(id: string) {
    await api.animals.remove(id);
    setAnimals(prev => prev.filter(a => a.id !== id));
  }

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
      animals, entries, loading, error, refetch,
      addAnimal, updateAnimal, removeAnimal,
      addEntry,  updateEntry,  removeEntry,
    }}>
      {children}
    </DataContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useData() {
  return useContext(DataContext);
}
