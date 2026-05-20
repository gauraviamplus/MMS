import Constants from "expo-constants";
import type { DailyEntry } from "../types";

const host =
  Constants.expoConfig?.hostUri?.split(":")[0] ?? "localhost";
const BASE_URL = `http://${host}:3000/api`;

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  entries: {
    list: () =>
      req<DailyEntry[]>("/entries"),
    create: (data: Omit<DailyEntry, "id">) =>
      req<DailyEntry>("/entries", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Omit<DailyEntry, "id">) =>
      req<DailyEntry>(`/entries/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    remove: (id: string) =>
      req<{ success: boolean }>(`/entries/${id}`, { method: "DELETE" }),
  },
};
