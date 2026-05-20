import type { Farmer, MilkCollection, Payment } from "../types";

// ─── Farmers ──────────────────────────────────────────────────────────────────
export const FARMERS: Farmer[] = [
  { id: "F001", name: "Ramesh Patil",   phone: "9876543210", address: "Pune, Maharashtra",       animalType: "cow",     active: true,  createdAt: "2024-01-10" },
  { id: "F002", name: "Suresh Shinde",  phone: "9823456781", address: "Nashik, Maharashtra",     animalType: "buffalo", active: true,  createdAt: "2024-02-05" },
  { id: "F003", name: "Vijay More",     phone: "9765432109", address: "Satara, Maharashtra",     animalType: "buffalo", active: true,  createdAt: "2024-03-15" },
  { id: "F004", name: "Anil Jadhav",    phone: "9812345678", address: "Kolhapur, Maharashtra",   animalType: "cow",     active: true,  createdAt: "2024-04-20" },
  { id: "F005", name: "Mahesh Desai",   phone: "9898989898", address: "Aurangabad, Maharashtra", animalType: "buffalo", active: false, createdAt: "2024-05-01" },
];

// ─── Date helpers ─────────────────────────────────────────────────────────────
const today     = new Date().toISOString().split("T")[0];
const yesterday = new Date(Date.now() - 86_400_000).toISOString().split("T")[0];

// ─── Collections ─────────────────────────────────────────────────────────────
// Today: Cow total = 245.5L | Buffalo total = 180.0L | Grand = 425.5L
// Yesterday: Cow = 230.0L  | Buffalo = 175.5L        | Grand = 405.5L
// Changes:   Cow +15.5L    | Buffalo +4.5L            | Total +20.0L
export const COLLECTIONS: MilkCollection[] = [
  // ── Today Morning ───────────────────────────────────────────────────────────
  { id: "C001", farmerId: "F001", farmerName: "Ramesh Patil",  date: today, session: "morning", quantity: 65.0,  fat: 3.8, snf: 8.2, rate: 32, amount: 2080 },
  { id: "C002", farmerId: "F002", farmerName: "Suresh Shinde", date: today, session: "morning", quantity: 50.0,  fat: 6.5, snf: 9.1, rate: 38, amount: 1900 },
  { id: "C003", farmerId: "F003", farmerName: "Vijay More",    date: today, session: "morning", quantity: 50.0,  fat: 6.2, snf: 9.0, rate: 34, amount: 1700 },
  { id: "C004", farmerId: "F004", farmerName: "Anil Jadhav",   date: today, session: "morning", quantity: 70.0,  fat: 3.9, snf: 8.3, rate: 32, amount: 2240 },
  // ── Today Evening ───────────────────────────────────────────────────────────
  { id: "C005", farmerId: "F001", farmerName: "Ramesh Patil",  date: today, session: "evening", quantity: 55.0,  fat: 3.6, snf: 8.0, rate: 32, amount: 1760 },
  { id: "C006", farmerId: "F002", farmerName: "Suresh Shinde", date: today, session: "evening", quantity: 40.0,  fat: 6.2, snf: 9.0, rate: 38, amount: 1520 },
  { id: "C007", farmerId: "F003", farmerName: "Vijay More",    date: today, session: "evening", quantity: 40.0,  fat: 6.0, snf: 8.8, rate: 34, amount: 1360 },
  { id: "C008", farmerId: "F004", farmerName: "Anil Jadhav",   date: today, session: "evening", quantity: 55.5,  fat: 3.8, snf: 8.2, rate: 32, amount: 1776 },
  // ── Yesterday Morning ───────────────────────────────────────────────────────
  { id: "C009", farmerId: "F001", farmerName: "Ramesh Patil",  date: yesterday, session: "morning", quantity: 60.0,  fat: 3.7, snf: 8.1, rate: 32, amount: 1920 },
  { id: "C010", farmerId: "F002", farmerName: "Suresh Shinde", date: yesterday, session: "morning", quantity: 45.0,  fat: 6.4, snf: 9.0, rate: 38, amount: 1710 },
  { id: "C011", farmerId: "F003", farmerName: "Vijay More",    date: yesterday, session: "morning", quantity: 45.0,  fat: 6.1, snf: 8.9, rate: 34, amount: 1530 },
  { id: "C012", farmerId: "F004", farmerName: "Anil Jadhav",   date: yesterday, session: "morning", quantity: 60.0,  fat: 3.8, snf: 8.2, rate: 32, amount: 1920 },
  // ── Yesterday Evening ───────────────────────────────────────────────────────
  { id: "C013", farmerId: "F001", farmerName: "Ramesh Patil",  date: yesterday, session: "evening", quantity: 55.0,  fat: 3.5, snf: 8.0, rate: 32, amount: 1760 },
  { id: "C014", farmerId: "F002", farmerName: "Suresh Shinde", date: yesterday, session: "evening", quantity: 42.75, fat: 6.2, snf: 8.9, rate: 38, amount: 1624 },
  { id: "C015", farmerId: "F003", farmerName: "Vijay More",    date: yesterday, session: "evening", quantity: 42.75, fat: 6.0, snf: 8.7, rate: 34, amount: 1453 },
  { id: "C016", farmerId: "F004", farmerName: "Anil Jadhav",   date: yesterday, session: "evening", quantity: 55.0,  fat: 3.7, snf: 8.1, rate: 32, amount: 1760 },
];

// ─── Payments ─────────────────────────────────────────────────────────────────
export const PAYMENTS: Payment[] = [
  { id: "P001", farmerId: "F001", farmerName: "Ramesh Patil",  fromDate: "2026-03-01", toDate: "2026-03-15", totalLiters: 1650, totalAmount: 52800, paidAmount: 52800, status: "paid",    paidAt: "2026-03-16" },
  { id: "P002", farmerId: "F002", farmerName: "Suresh Shinde", fromDate: "2026-03-01", toDate: "2026-03-15", totalLiters: 2400, totalAmount: 91200, paidAmount: 50000, status: "partial" },
  { id: "P003", farmerId: "F003", farmerName: "Vijay More",    fromDate: "2026-03-01", toDate: "2026-03-15", totalLiters: 1300, totalAmount: 44200, paidAmount: 0,     status: "pending" },
  { id: "P004", farmerId: "F004", farmerName: "Anil Jadhav",   fromDate: "2026-03-01", toDate: "2026-03-15", totalLiters: 1950, totalAmount: 62400, paidAmount: 0,     status: "pending" },
];

// ─── Computed Stats ───────────────────────────────────────────────────────────
export function getDashboardStats() {
  const todayCollections = COLLECTIONS.filter((c) => c.date === today);
  const morningCols      = todayCollections.filter((c) => c.session === "morning");
  const eveningCols      = todayCollections.filter((c) => c.session === "evening");

  const todayMorningLiters = morningCols.reduce((s, c) => s + c.quantity, 0);
  const todayEveningLiters = eveningCols.reduce((s, c) => s + c.quantity, 0);
  const todayTotalLiters   = todayMorningLiters + todayEveningLiters;
  const todayTotalAmount   = todayCollections.reduce((s, c) => s + c.amount, 0);

  const monthTotalLiters = COLLECTIONS.reduce((s, c) => s + c.quantity, 0);
  const monthTotalAmount = COLLECTIONS.reduce((s, c) => s + c.amount, 0);

  const activeFarmers   = FARMERS.filter((f) => f.active).length;
  const pendingPayments = PAYMENTS.filter((p) => p.status !== "paid").length;

  return {
    todayMorningLiters,
    todayEveningLiters,
    todayTotalLiters,
    todayTotalAmount,
    monthTotalLiters,
    monthTotalAmount,
    activeFarmers,
    pendingPayments,
  };
}
