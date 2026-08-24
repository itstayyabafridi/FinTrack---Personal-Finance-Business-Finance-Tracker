export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  type: "personal" | "business" | "personal_business";
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export type TransactionType =
  | "income"
  | "expense"
  | "student_fee"
  | "client_payment"
  | "loan_received"
  | "loan_repayment"
  | "owner_payment"
  | "other_income";

export type PaymentMethod =
  | "cash"
  | "bank_transfer"
  | "easypaisa"
  | "jazzcash"
  | "card"
  | "other";

export interface Transaction {
  id: string;
  user_id: string;
  workspace_id: string | null;
  type: TransactionType;
  amount: number;
  description: string;
  category: string | null;
  date: string;
  payment_method: PaymentMethod;
  notes: string | null;
  reference_id: string | null;
  reference_type: string | null;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  user_id: string;
  workspace_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  course: string | null;
  total_fee: number;
  received_amount: number;
  created_at: string;
  updated_at: string;
}

export interface StudentPayment {
  id: string;
  student_id: string;
  transaction_id: string;
  amount: number;
  date: string;
  payment_method: PaymentMethod;
  notes: string | null;
  created_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  workspace_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  client_id: string;
  user_id: string;
  workspace_id: string | null;
  name: string;
  description: string | null;
  total_amount: number;
  received_amount: number;
  status: "active" | "completed" | "on_hold" | "cancelled";
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectPayment {
  id: string;
  project_id: string;
  transaction_id: string;
  amount: number;
  date: string;
  payment_method: PaymentMethod;
  notes: string | null;
  created_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  workspace_id: string | null;
  category: string;
  description: string;
  amount: number;
  date: string;
  payment_method: PaymentMethod;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Loan {
  id: string;
  user_id: string;
  workspace_id: string | null;
  lender: string;
  principal_amount: number;
  remaining_amount: number;
  interest_rate: number | null;
  due_date: string | null;
  status: "active" | "paid" | "overdue";
  reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoanPayment {
  id: string;
  loan_id: string;
  transaction_id: string;
  amount: number;
  date: string;
  payment_method: PaymentMethod;
  notes: string | null;
  created_at: string;
}

export interface Owner {
  id: string;
  user_id: string;
  workspace_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  share_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface OwnerPayment {
  id: string;
  owner_id: string;
  transaction_id: string;
  amount: number;
  date: string;
  payment_method: PaymentMethod;
  notes: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  read: boolean;
  reference_id: string | null;
  reference_type: string | null;
  created_at: string;
}