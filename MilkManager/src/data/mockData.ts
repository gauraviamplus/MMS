import type { Farmer, MilkCollection, Payment } from "../types";

// ─── Farmers ──────────────────────────────────────────────────────────────────
export const FARMERS: Farmer[] = [
  {
    id: "F001",
    name: "Ramesh Patil",
    phone: "9876543210",
    address: "Pune, Maharashtra",
    animalType: "cow",
    active: true,
    createdAt: "2024-01-10",
  },
  {
    id: "F002",
    name: "Suresh Shinde",
    phone: "9823456781",
    address: "Nashik, Maharashtra",
    animalType: "buffalo",
    active: true,
    createdAt: "2024-02-05",
  },
  {
    id: "F003",
    name: "Vijay More",
    phone: "9765432109",
    address: "Satara, Maharashtra",
    animalType: "both",
    active: true,
    createdAt: "2024-03-15",
  },
  {
    id: "F004",
    name: "Anil Jadhav",
    phone: "9812345678",
    address: "Kolhapur, Maharashtra",
    animalType: "cow",
    active: true,
    createdAt: "2024-04-20",
  },
  {
    id: "F005",
    name: "Mahesh Desai",
    phone: "9898989898",
    address: "Aurangabad, Maharashtra",
    animalType: "buffalo",
    active: false,
    createdAt: "2024-05-01",
  },
];

// ─── Today's date helper ──────────────────────────────────────────────────────
const today = new Date().toISOString().split("T")[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

// ─── Milk Collections ─────────────────────────────────────────────────────────
export const COLLECTIONS: MilkCollection[] = [
  // Today Morning
  { id: "C001", farmerId: "F001", farmerName: "Ramesh Patil",   date: today,     session: "morning", quantity: 12.5, fat: 3.8, snf: 8.2, rate: 32, amount: 400 },
  { id: "C002", farmerId: "F002", farmerName: "Suresh Shinde",  date: today,     session: "morning", quantity: 18.0, fat: 6.5, snf: 9.1, rate: 38, amount: 684 },
  { id: "C003", farmerId: "F003", farmerName: "Vijay More",     date: today,     session: "morning", quantity: 9.5,  fat: 4.2, snf: 8.5, rate: 34, amount: 323 },
  { id: "C004", farmerId: "F004", farmerName: "Anil Jadhav",    date: today,     session: "morning", quantity: 14.0, fat: 3.9, snf: 8.3, rate: 32, amount: 448 },
  // Today Evening
  { id: "C005", farmerId: "F001", farmerName: "Ramesh Patil",   date: today,     session: "evening", quantity: 10.0, fat: 3.6, snf: 8.0, rate: 32, amount: 320 },
  { id: "C006", farmerId: "F002", farmerName: "Suresh Shinde",  date: today,     session: "evening", quantity: 15.5, fat: 6.2, snf: 9.0, rate: 38, amount: 589 },
  { id: "C007", farmerId: "F003", farmerName: "Vijay More",     date: today,     session: "evening", quantity: 8.0,  fat: 4.0, snf: 8.4, rate: 34, amount: 272 },
  // Yesterday
  { id: "C008", farmerId: "F001", farmerName: "Ramesh Patil",   date: yesterday, session: "morning", quantity: 11.0, fat: 3.7, snf: 8.1, rate: 32, amount: 352 },
  { id: "C009", farmerId: "F002", farmerName: "Suresh Shinde",  date: yesterday, session: "morning", quantity: 17.5, fat: 6.4, snf: 9.0, rate: 38, amount: 665 },
  { id: "C010", farmerId: "F004", farmerName: "Anil Jadhav",    date: yesterday, session: "evening", quantity: 13.0, fat: 3.8, snf: 8.2, rate: 32, amount: 416 },
];

// ─── Payments ─────────────────────────────────────────────────────────────────
export const PAYMENTS: Payment[] = [
  {
    id: "P001",
    farmerId: "F001",
    farmerName: "Ramesh Patil",
    fromDate: "2026-03-01",
    toDate: "2026-03-15",
    totalLiters: 165,
    totalAmount: 5280,
    paidAmount: 5280,
    status: "paid",
    paidAt: "2026-03-16",
  },
  {
    id: "P002",
    farmerId: "F002",
    farmerName: "Suresh Shinde",
    fromDate: "2026-03-01",
    toDate: "2026-03-15",
    totalLiters: 240,
    totalAmount: 9120,
    paidAmount: 5000,
    status: "partial",
  },
  {
    id: "P003",
    farmerId: "F003",
    farmerName: "Vijay More",
    fromDate: "2026-03-01",
    toDate: "2026-03-15",
    totalLiters: 130,
    totalAmount: 4420,
    paidAmount: 0,
    status: "pending",
  },
  {
    id: "P004",
    farmerId: "F004",
    farmerName: "Anil Jadhav",
    fromDate: "2026-03-01",
    toDate: "2026-03-15",
    totalLiters: 195,
    totalAmount: 6240,
    paidAmount: 0,
    status: "pending",
  },
];

// ─── Computed Stats ───────────────────────────────────────────────────────────
export function getDashboardStats() {
  const todayCollections = COLLECTIONS.filter((c) => c.date === today);
  const morningCols = todayCollections.filter((c) => c.session === "morning");
  const eveningCols = todayCollections.filter((c) => c.session === "evening");

  const todayMorningLiters = morningCols.reduce((s, c) => s + c.quantity, 0);
  const todayEveningLiters = eveningCols.reduce((s, c) => s + c.quantity, 0);
  const todayTotalLiters   = todayMorningLiters + todayEveningLiters;
  const todayTotalAmount   = todayCollections.reduce((s, c) => s + c.amount, 0);

  const monthTotalLiters  = COLLECTIONS.reduce((s, c) => s + c.quantity, 0);
  const monthTotalAmount  = COLLECTIONS.reduce((s, c) => s + c.amount, 0);

  const activeFarmers    = FARMERS.filter((f) => f.active).length;
  const pendingPayments  = PAYMENTS.filter((p) => p.status !== "paid").length;

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
