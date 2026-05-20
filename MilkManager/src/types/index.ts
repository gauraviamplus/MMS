// ─── Farmer ───────────────────────────────────────────────────────────────────
export type AnimalType = "cow" | "buffalo" | "both";

export interface Farmer {
  id: string;
  name: string;
  phone: string;
  address: string;
  animalType: AnimalType;
  active: boolean;
  createdAt: string;
}

// ─── Milk Collection ──────────────────────────────────────────────────────────
export type Session = "morning" | "evening";

export interface MilkCollection {
  id: string;
  farmerId: string;
  farmerName: string;
  date: string;
  session: Session;
  quantity: number;
  fat: number;
  snf: number;
  rate: number;
  amount: number;
}

// ─── Daily Entry ──────────────────────────────────────────────────────────────
export interface DailyEntry {
  id: string;
  date: string;             // YYYY-MM-DD
  animalType: "cow" | "buffalo";
  animalName: string;
  session: "morning" | "evening";
  quantity: number;         // liters
  rate: number;             // per liter
  totalAmount: number;
  notes?: string;
}

// ─── Payment ──────────────────────────────────────────────────────────────────
export type PaymentStatus = "pending" | "paid" | "partial";

export interface Payment {
  id: string;
  farmerId: string;
  farmerName: string;
  fromDate: string;
  toDate: string;
  totalLiters: number;
  totalAmount: number;
  paidAmount: number;
  status: PaymentStatus;
  paidAt?: string;
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
export interface DashboardStats {
  todayMorningLiters: number;
  todayEveningLiters: number;
  todayTotalLiters: number;
  todayTotalAmount: number;
  monthTotalLiters: number;
  monthTotalAmount: number;
  activeFarmers: number;
  pendingPayments: number;
}

// ─── Expense ──────────────────────────────────────────────────────────────────
export type ExpenseCategory = "medicine" | "food" | "worker";

export interface Expense {
  id: string;
  date: string;             // YYYY-MM-DD
  category: ExpenseCategory;
  amount: number;
  workerName?: string;
  note?: string;
}

// ─── Navigation ───────────────────────────────────────────────────────────────
export type RootStackParamList = {
  Dashboard:  undefined;
  DailyEntry: undefined;
  Weekly:     undefined;
  Monthly:    undefined;
  Yearly:     undefined;
  Animals:    undefined;
};
