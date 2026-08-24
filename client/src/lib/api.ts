import { supabase } from "./supabase";
import type {
  Profile,
  Workspace,
  Transaction,
  Student,
  Client,
  Project,
  Expense,
  Loan,
  Owner,
  Notification,
} from "@shared/types";

type TransactionType =
  | "income"
  | "expense"
  | "student_fee"
  | "client_payment"
  | "loan_received"
  | "loan_repayment"
  | "owner_payment"
  | "other_income";

type PaymentMethod =
  | "cash"
  | "bank_transfer"
  | "easypaisa"
  | "jazzcash"
  | "card"
  | "other";

// ============================================================
// AUTH HELPERS
// ============================================================

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function signOut() {
  return supabase.auth.signOut();
}

export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback);
}

// ============================================================
// PROFILE
// ============================================================

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (error && error.code !== "PGRST116") throw error;
  return data;
}

export async function upsertProfile(profile: Partial<Profile> & { user_id: string }): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .upsert(profile, { onConflict: "user_id" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ============================================================
// WORKSPACE
// ============================================================

export async function getWorkspaces(userId: string): Promise<Workspace[]> {
  const { data, error } = await supabase
    .from("workspaces")
    .select("*")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getWorkspace(id: string): Promise<Workspace | null> {
  const { data, error } = await supabase
    .from("workspaces")
    .select("*")
    .eq("id", id)
    .single();
  if (error && error.code !== "PGRST116") throw error;
  return data;
}

// ============================================================
// TRANSACTIONS
// ============================================================

export async function getTransactions(userId: string, workspaceId?: string): Promise<Transaction[]> {
  let query = supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (workspaceId) {
    query = query.eq("workspace_id", workspaceId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getTransaction(id: string): Promise<Transaction | null> {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("id", id)
    .single();
  if (error && error.code !== "PGRST116") throw error;
  return data;
}

interface CreateTransactionInput {
  user_id: string;
  workspace_id?: string | null;
  type: TransactionType;
  amount: number;
  description: string;
  category?: string | null;
  date: string;
  payment_method: PaymentMethod;
  notes?: string | null;
  reference_id?: string | null;
  reference_type?: string | null;
}

export async function createTransaction(input: CreateTransactionInput): Promise<Transaction> {
  const { data, error } = await supabase
    .from("transactions")
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction> {
  const { data, error } = await supabase
    .from("transactions")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteTransaction(id: string): Promise<void> {
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) throw error;
}

// ============================================================
// DASHBOARD AGGREGATIONS
// ============================================================

export interface DashboardMetrics {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  receivables: number;
  payables: number;
  outstandingLoans: number;
}

export async function getDashboardMetrics(userId: string, workspaceId?: string): Promise<DashboardMetrics> {
  const transactions = await getTransactions(userId, workspaceId);

  let totalIncome = 0;
  let totalExpenses = 0;
  let receivables = 0;
  let payables = 0;
  let outstandingLoans = 0;

  for (const t of transactions) {
    switch (t.type) {
      case "income":
      case "other_income":
      case "student_fee":
      case "client_payment":
        totalIncome += t.amount;
        break;
      case "expense":
      case "owner_payment":
        totalExpenses += t.amount;
        break;
      case "loan_received":
        outstandingLoans += t.amount;
        break;
      case "loan_repayment":
        outstandingLoans -= t.amount;
        break;
    }
  }

  // Calculate receivables from students and projects
  const { data: students } = await supabase
    .from("students")
    .select("total_fee, received_amount")
    .eq("user_id", userId);
  if (students) {
    for (const s of students) {
      receivables += s.total_fee - s.received_amount;
    }
  }

  const { data: projects } = await supabase
    .from("projects")
    .select("total_amount, received_amount")
    .eq("user_id", userId);
  if (projects) {
    for (const p of projects) {
      receivables += p.total_amount - p.received_amount;
    }
  }

  // Calculate payables from owners
  const { data: owners } = await supabase
    .from("owners")
    .select("id")
    .eq("user_id", userId);
  if (owners) {
    const ownerIds = owners.map((o) => o.id);
    const { data: ownerPayments } = await supabase
      .from("owner_payments")
      .select("owner_id, amount")
      .in("owner_id", ownerIds);
    // For now, simple calculation - would need business logic for actual payables
  }

  // Outstanding loans
  const { data: loans } = await supabase
    .from("loans")
    .select("remaining_amount")
    .eq("user_id", userId)
    .eq("status", "active");
  if (loans) {
    outstandingLoans = loans.reduce((sum, l) => sum + l.remaining_amount, 0);
  }

  return {
    totalIncome,
    totalExpenses,
    netProfit: totalIncome - totalExpenses,
    receivables: Math.max(0, receivables),
    payables,
    outstandingLoans: Math.max(0, outstandingLoans),
  };
}

export async function getChartData(
  userId: string,
  range: string,
  workspaceId?: string
): Promise<{ day: string; income: number; expenses: number; profit: number; cashFlow: number }[]> {
  const transactions = await getTransactions(userId, workspaceId);
  // Simplified - in production you'd filter by range and aggregate by day/week/month
  // This is a placeholder implementation
  const days = ["01", "05", "09", "13", "17", "21", "25", "31"];
  const result = days.map((day) => ({
    day,
    income: 0,
    expenses: 0,
    profit: 0,
    cashFlow: 0,
  }));

  // Aggregate transactions by day (simplified)
  for (const t of transactions) {
    const day = t.date.split("-")[2]; // Get day from YYYY-MM-DD
    const idx = days.indexOf(day);
    if (idx >= 0) {
      if (["income", "other_income", "student_fee", "client_payment", "loan_received"].includes(t.type)) {
        result[idx].income += t.amount;
        result[idx].cashFlow += t.amount;
      } else if (["expense", "owner_payment", "loan_repayment"].includes(t.type)) {
        result[idx].expenses += t.amount;
        result[idx].cashFlow -= t.amount;
      }
      result[idx].profit = result[idx].income - result[idx].expenses;
    }
  }

  return result;
}

export async function getRecentTransactions(
  userId: string,
  limit = 10,
  workspaceId?: string
): Promise<Transaction[]> {
  let query = supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (workspaceId) {
    query = query.eq("workspace_id", workspaceId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

// ============================================================
// STUDENTS
// ============================================================

export async function getStudents(userId: string, workspaceId?: string): Promise<Student[]> {
  let query = supabase
    .from("students")
    .select("*")
    .eq("user_id", userId)
    .order("name", { ascending: true });

  if (workspaceId) {
    query = query.eq("workspace_id", workspaceId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getStudent(id: string): Promise<Student | null> {
  const { data, error } = await supabase.from("students").select("*").eq("id", id).single();
  if (error && error.code !== "PGRST116") throw error;
  return data;
}

export async function createStudent(
  input: Omit<Student, "id" | "created_at" | "updated_at">
): Promise<Student> {
  const { data, error } = await supabase.from("students").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function updateStudent(id: string, updates: Partial<Student>): Promise<Student> {
  const { data, error } = await supabase
    .from("students")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function createStudentPayment(
  studentId: string,
  transactionId: string,
  amount: number,
  date: string,
  paymentMethod: PaymentMethod,
  notes?: string | null
) {
  // Update student received amount
  const student = await getStudent(studentId);
  if (!student) throw new Error("Student not found");

  const { error: paymentError } = await supabase.from("student_payments").insert({
    student_id: studentId,
    transaction_id: transactionId,
    amount,
    date,
    payment_method: paymentMethod,
    notes,
  });
  if (paymentError) throw paymentError;

  const { error: studentError } = await supabase
    .from("students")
    .update({
      received_amount: student.received_amount + amount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", studentId);
  if (studentError) throw studentError;
}

// ============================================================
// CLIENTS
// ============================================================

export async function getClients(userId: string, workspaceId?: string): Promise<Client[]> {
  let query = supabase
    .from("clients")
    .select("*")
    .eq("user_id", userId)
    .order("name", { ascending: true });

  if (workspaceId) {
    query = query.eq("workspace_id", workspaceId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function createClient(
  input: Omit<Client, "id" | "created_at" | "updated_at">
): Promise<Client> {
  const { data, error } = await supabase.from("clients").insert(input).select().single();
  if (error) throw error;
  return data;
}

// ============================================================
// PROJECTS
// ============================================================

export async function getProjects(userId: string, workspaceId?: string): Promise<Project[]> {
  let query = supabase
    .from("projects")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (workspaceId) {
    query = query.eq("workspace_id", workspaceId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function createProject(
  input: Omit<Project, "id" | "created_at" | "updated_at">
): Promise<Project> {
  const { data, error } = await supabase.from("projects").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function createProjectPayment(
  projectId: string,
  transactionId: string,
  amount: number,
  date: string,
  paymentMethod: PaymentMethod,
  notes?: string | null
) {
  const { data: project, error: projError } = await supabase
    .from("projects")
    .select("received_amount")
    .eq("id", projectId)
    .single();
  if (projError) throw projError;

  const { error: paymentError } = await supabase.from("project_payments").insert({
    project_id: projectId,
    transaction_id: transactionId,
    amount,
    date,
    payment_method: paymentMethod,
    notes,
  });
  if (paymentError) throw paymentError;

  const { error: updateError } = await supabase
    .from("projects")
    .update({
      received_amount: project.received_amount + amount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", projectId);
  if (updateError) throw updateError;
}

// ============================================================
// EXPENSES
// ============================================================

export async function getExpenses(userId: string, workspaceId?: string): Promise<Expense[]> {
  let query = supabase
    .from("expenses")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (workspaceId) {
    query = query.eq("workspace_id", workspaceId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function createExpense(
  input: Omit<Expense, "id" | "created_at" | "updated_at">
): Promise<Expense> {
  const { data, error } = await supabase.from("expenses").insert(input).select().single();
  if (error) throw error;
  return data;
}

// ============================================================
// LOANS
// ============================================================

export async function getLoans(userId: string, workspaceId?: string): Promise<Loan[]> {
  let query = supabase
    .from("loans")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (workspaceId) {
    query = query.eq("workspace_id", workspaceId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function createLoan(
  input: Omit<Loan, "id" | "created_at" | "updated_at">
): Promise<Loan> {
  const { data, error } = await supabase.from("loans").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function createLoanPayment(
  loanId: string,
  transactionId: string,
  amount: number,
  date: string,
  paymentMethod: PaymentMethod,
  notes?: string | null
) {
  const { data: loan, error: loanError } = await supabase
    .from("loans")
    .select("remaining_amount")
    .eq("id", loanId)
    .single();
  if (loanError) throw loanError;

  const newRemaining = Math.max(0, loan.remaining_amount - amount);
  const newStatus = newRemaining === 0 ? "paid" : "active";

  const { error: paymentError } = await supabase.from("loan_payments").insert({
    loan_id: loanId,
    transaction_id: transactionId,
    amount,
    date,
    payment_method: paymentMethod,
    notes,
  });
  if (paymentError) throw paymentError;

  const { error: updateError } = await supabase
    .from("loans")
    .update({
      remaining_amount: newRemaining,
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", loanId);
  if (updateError) throw updateError;
}

// ============================================================
// OWNERS
// ============================================================

export async function getOwners(userId: string, workspaceId?: string): Promise<Owner[]> {
  let query = supabase
    .from("owners")
    .select("*")
    .eq("user_id", userId)
    .order("name", { ascending: true });

  if (workspaceId) {
    query = query.eq("workspace_id", workspaceId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function createOwnerPayment(
  ownerId: string,
  transactionId: string,
  amount: number,
  date: string,
  paymentMethod: PaymentMethod,
  notes?: string | null
) {
  const { error } = await supabase.from("owner_payments").insert({
    owner_id: ownerId,
    transaction_id: transactionId,
    amount,
    date,
    payment_method: paymentMethod,
    notes,
  });
  if (error) throw error;
}

// ============================================================
// NOTIFICATIONS
// ============================================================

export async function getNotifications(userId: string, unreadOnly = false): Promise<Notification[]> {
  let query = supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (unreadOnly) {
    query = query.eq("read", false);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function markNotificationRead(id: string): Promise<void> {
  const { error } = await supabase.from("notifications").update({ read: true }).eq("id", id);
  if (error) throw error;
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", userId)
    .eq("read", false);
  if (error) throw error;
}