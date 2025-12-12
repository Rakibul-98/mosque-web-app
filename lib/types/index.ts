// lib/types.ts
export interface User {
  id: string;
  name: string;
  role: "admin" | "cashier";
  pin: string;
  is_active: boolean;
  created_at: string;
}

export interface CommitteeMember {
  id: string;
  name: string;
  image_url?: string;
  designation: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  amount: number;
  purpose: string;
  fund: "imam" | "mosque";
  transaction_date: string;
  created_at: string;
  created_by: string | null;
  created_by_name?: string;
}

export interface DashboardStats {
  mosque_balance: number;
  imam_balance: number;
  total_balance: number;
  mosque_income: number;
  mosque_expense: number;
  imam_income: number;
  imam_expense: number;
  total_transactions: number;
}
