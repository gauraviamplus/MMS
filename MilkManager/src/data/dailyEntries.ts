import type { DailyEntry } from "../types";

// Animals: Bella & Daisy = cow ($35/L), Rocky & Luna = buffalo ($30/L)
const COW_RATE     = 35;
const BUFFALO_RATE = 30;

function entry(
  id: string, date: string,
  animalType: "cow" | "buffalo", animalName: string,
  quantity: number, notes?: string,
): DailyEntry {
  const rate = animalType === "cow" ? COW_RATE : BUFFALO_RATE;
  return {
    id, date, animalType, animalName,
    quantity, rate,
    totalAmount: Math.round(quantity * rate * 100) / 100,
    notes,
  };
}

const M = "Morning milking";

export const DAILY_ENTRIES: DailyEntry[] = [
  // Apr 23
  entry("E001", "2026-04-23", "cow",     "Bella", 125.5, M),
  entry("E002", "2026-04-23", "cow",     "Daisy", 120.0, M),
  entry("E003", "2026-04-23", "buffalo", "Rocky",  95.0, M),
  entry("E004", "2026-04-23", "buffalo", "Luna",   85.0, M),
  // Apr 22
  entry("E005", "2026-04-22", "cow",     "Bella", 118.0, M),
  entry("E006", "2026-04-22", "cow",     "Daisy", 112.0, M),
  entry("E007", "2026-04-22", "buffalo", "Rocky",  92.5, M),
  entry("E008", "2026-04-22", "buffalo", "Luna",   83.0, M),
  // Apr 21
  entry("E009", "2026-04-21", "cow",     "Bella", 124.9),
  entry("E010", "2026-04-21", "cow",     "Daisy", 120.1),
  entry("E011", "2026-04-21", "buffalo", "Rocky",  96.9),
  entry("E012", "2026-04-21", "buffalo", "Luna",   82.4),
  // Apr 20
  entry("E013", "2026-04-20", "cow",     "Bella", 115.1),
  entry("E014", "2026-04-20", "cow",     "Daisy", 123.5),
  entry("E015", "2026-04-20", "buffalo", "Rocky",  86.3),
  entry("E016", "2026-04-20", "buffalo", "Luna",   88.4),
  // Apr 19
  entry("E017", "2026-04-19", "cow",     "Bella", 117.6),
  entry("E018", "2026-04-19", "cow",     "Daisy", 122.8),
  entry("E019", "2026-04-19", "buffalo", "Rocky",  85.1),
  entry("E020", "2026-04-19", "buffalo", "Luna",   87.9),
  // Apr 18
  entry("E021", "2026-04-18", "cow",     "Bella", 119.7),
  entry("E022", "2026-04-18", "cow",     "Daisy", 124.4),
  entry("E023", "2026-04-18", "buffalo", "Rocky",  93.7),
  entry("E024", "2026-04-18", "buffalo", "Luna",   84.8),
  // Apr 17
  entry("E025", "2026-04-17", "cow",     "Bella", 117.5),
  entry("E026", "2026-04-17", "cow",     "Daisy", 111.1),
  entry("E027", "2026-04-17", "buffalo", "Rocky",  92.0),
  entry("E028", "2026-04-17", "buffalo", "Luna",   82.3),
];
