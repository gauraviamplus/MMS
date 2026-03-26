// ─── Farmer ───────────────────────────────────────────────────────────────────
export type AnimalType = "cow" | "buffalo" | "both";

export interface Farmer {
  id: string;
  name: string;
  phone: string;
  address: string;
  animalType: AnimalType;
  active: boolean;
  createdAt: string; // ISO date
}

// ─── Milk Collection ──────────────────────────────────────────────────────────
export type Session = "morning" | "evening";

export interface MilkCollection {
  id: string;
  farmerId: string;
  farmerName: string;
  date: string;       // YYYY-MM-DD
  session: Session;
  quantity: number;   // liters
  fat: number;        // percentage
  snf: number;        // percentage
  rate: number;       // ₹ per liter
  amount: number;     // quantity * rate
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

// ─── Navigation ───────────────────────────────────────────────────────────────
export type RootTabParamList = {
  Dashboard: undefined;
  Farmers: undefined;
  Collection: undefined;
  Reports: undefined;
};

export type FarmersStackParamList = {
  FarmersList: undefined;
  AddFarmer: { farmer?: Farmer };
  FarmerDetail: { farmerId: string };
};
