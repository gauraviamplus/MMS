import React, {
  createContext, useCallback, useContext,
  useEffect, useState, ReactNode,
} from "react";
import { api } from "../api/client";
import type { DailyEntry, Expense } from "../types";

// ─── Shape ────────────────────────────────────────────────────────────────────
interface DataContextType {
  entries:        DailyEntry[];
  expenses:       Expense[];
  loading:        boolean;
  error:          string | null;
  refetch:        () => Promise<void>;
  // Entries
  addEntry:       (data: Omit<DailyEntry, "id">)             => Promise<DailyEntry>;
  updateEntry:    (id: string, data: Omit<DailyEntry, "id">) => Promise<DailyEntry>;
  removeEntry:    (id: string)                                => Promise<void>;
  // Expenses
  addExpense:     (data: Omit<Expense, "id">)                => Promise<Expense>;
  updateExpense:  (id: string, data: Omit<Expense, "id">)    => Promise<Expense>;
  removeExpense:  (id: string)                               => Promise<void>;
}

const DataContext = createContext<DataContextType>(null!);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function DataProvider({ children }: { children: ReactNode }) {
  const [entries,  setEntries]  = useState<DailyEntry[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [e, ex] = await Promise.all([api.entries.list(), api.expenses.list()]);
      setEntries(e as DailyEntry[]);
      setExpenses(ex as Expense[]);
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

  // ── Expenses CRUD ─────────────────────────────────────────────────────────
  async function addExpense(data: Omit<Expense, "id">) {
    const created = await api.expenses.create(data);
    setExpenses(prev => [created as Expense, ...prev]);
    return created as Expense;
  }

  async function updateExpense(id: string, data: Omit<Expense, "id">) {
    const updated = await api.expenses.update(id, data);
    setExpenses(prev => prev.map(e => e.id === id ? updated as Expense : e));
    return updated as Expense;
  }

  async function removeExpense(id: string) {
    await api.expenses.remove(id);
    setExpenses(prev => prev.filter(e => e.id !== id));
  }

  return (
    <DataContext.Provider value={{
      entries, expenses, loading, error, refetch,
      addEntry, updateEntry, removeEntry,
      addExpense, updateExpense, removeExpense,
    }}>
      {children}
    </DataContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useData() {
  return useContext(DataContext);
}
