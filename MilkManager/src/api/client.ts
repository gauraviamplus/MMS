import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { DailyEntry, Expense } from "../types";

const host =
  Constants.expoConfig?.hostUri?.split(":")[0] ?? "localhost";
const BASE_URL = `http://${host}:3000/api`;

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const token = await AsyncStorage.getItem("auth_token");
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  auth: {
    sendOtp: (phone: string) =>
      req<{ success: boolean }>("/auth/send-otp", { method: "POST", body: JSON.stringify({ phone }) }),
    verifyOtp: (phone: string, otp: string) =>
      req<{ success: boolean; phone: string; token: string }>("/auth/verify-otp", { method: "POST", body: JSON.stringify({ phone, otp }) }),
  },
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
  expenses: {
    list: () =>
      req<Expense[]>("/expenses"),
    create: (data: Omit<Expense, "id">) =>
      req<Expense>("/expenses", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Omit<Expense, "id">) =>
      req<Expense>(`/expenses/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    remove: (id: string) =>
      req<{ success: boolean }>(`/expenses/${id}`, { method: "DELETE" }),
  },
};
