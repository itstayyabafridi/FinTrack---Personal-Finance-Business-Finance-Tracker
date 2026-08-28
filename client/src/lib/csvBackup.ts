import Papa from "papaparse";
import type {
  Transaction,
  Student,
  Client,
  Project,
  Expense,
  Loan,
  OwnerPayment,
  Product,
  Customer,
  Order,
  InventoryMovement,
  AdCampaign,
  ProductReturn,
} from "@shared/types";
import { nanoid } from "nanoid";

export interface FullBackupData {
  transactions: Transaction[];
  students: Student[];
  clients: Client[];
  projects: Project[];
  expenses: Expense[];
  loans: Loan[];
  ownerPayments: OwnerPayment[];
  products?: Product[];
  customers?: Customer[];
  orders?: Order[];
  inventoryMovements?: InventoryMovement[];
  adCampaigns?: AdCampaign[];
  productReturns?: ProductReturn[];
}

export interface ParseResult {
  success: boolean;
  totalRecords: number;
  data: FullBackupData;
  detectedModules: string[];
  error?: string;
}

/**
 * Triggers a browser download of CSV text
 */
export function downloadCsvFile(csvContent: string, filename: string) {
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export complete unified database to a single portable CSV file
 */
export function generateFullDatabaseCsv(data: FullBackupData): string {
  const rows: Record<string, any>[] = [];

  // 1. Transactions
  (data.transactions || []).forEach((t) => {
    rows.push({
      MODULE: "TRANSACTION",
      ID: t.id,
      DATE: t.date || "",
      NAME_OR_DESCRIPTION: t.description || "",
      AMOUNT_OR_FEE: t.amount ?? "",
      CATEGORY_OR_COURSE: t.category || "",
      STATUS_OR_TYPE: t.type || "",
      PAYMENT_METHOD: t.payment_method || "",
      RECEIVED_AMOUNT: "",
      REMAINING_AMOUNT: "",
      CLIENT_OR_LENDER_OR_COMPANY: "",
      EMAIL: "",
      PHONE: "",
      NOTES: t.notes || "",
      EXTRA_METADATA: t.reference_id ? `ref:${t.reference_id}` : "",
      CREATED_AT: t.created_at || "",
    });
  });

  // 2. Students
  (data.students || []).forEach((s) => {
    rows.push({
      MODULE: "STUDENT",
      ID: s.id,
      DATE: "",
      NAME_OR_DESCRIPTION: s.name || "",
      AMOUNT_OR_FEE: s.total_fee ?? "",
      CATEGORY_OR_COURSE: s.course || "",
      STATUS_OR_TYPE: "active",
      PAYMENT_METHOD: "",
      RECEIVED_AMOUNT: s.received_amount ?? 0,
      REMAINING_AMOUNT: Math.max(0, Number(s.total_fee || 0) - Number(s.received_amount || 0)),
      CLIENT_OR_LENDER_OR_COMPANY: "",
      EMAIL: s.email || "",
      PHONE: s.phone || "",
      NOTES: "",
      EXTRA_METADATA: "",
      CREATED_AT: s.created_at || "",
    });
  });

  // 3. Clients
  (data.clients || []).forEach((c) => {
    rows.push({
      MODULE: "CLIENT",
      ID: c.id,
      DATE: "",
      NAME_OR_DESCRIPTION: c.name || "",
      AMOUNT_OR_FEE: "",
      CATEGORY_OR_COURSE: "",
      STATUS_OR_TYPE: "",
      PAYMENT_METHOD: "",
      RECEIVED_AMOUNT: "",
      REMAINING_AMOUNT: "",
      CLIENT_OR_LENDER_OR_COMPANY: c.company || "",
      EMAIL: c.email || "",
      PHONE: c.phone || "",
      NOTES: "",
      EXTRA_METADATA: "",
      CREATED_AT: c.created_at || "",
    });
  });

  // 4. Projects
  (data.projects || []).forEach((p) => {
    rows.push({
      MODULE: "PROJECT",
      ID: p.id,
      DATE: p.start_date || "",
      NAME_OR_DESCRIPTION: p.name || "",
      AMOUNT_OR_FEE: p.total_amount ?? "",
      CATEGORY_OR_COURSE: "",
      STATUS_OR_TYPE: p.status || "active",
      PAYMENT_METHOD: "",
      RECEIVED_AMOUNT: p.received_amount ?? 0,
      REMAINING_AMOUNT: Math.max(0, Number(p.total_amount || 0) - Number(p.received_amount || 0)),
      CLIENT_OR_LENDER_OR_COMPANY: p.client_id || "",
      EMAIL: "",
      PHONE: "",
      NOTES: p.description || "",
      EXTRA_METADATA: p.end_date ? `due:${p.end_date}` : "",
      CREATED_AT: p.created_at || "",
    });
  });

  // 5. Expenses
  (data.expenses || []).forEach((e) => {
    rows.push({
      MODULE: "EXPENSE",
      ID: e.id,
      DATE: e.date || "",
      NAME_OR_DESCRIPTION: e.description || "",
      AMOUNT_OR_FEE: e.amount ?? "",
      CATEGORY_OR_COURSE: e.category || "",
      STATUS_OR_TYPE: "expense",
      PAYMENT_METHOD: e.payment_method || "",
      RECEIVED_AMOUNT: "",
      REMAINING_AMOUNT: "",
      CLIENT_OR_LENDER_OR_COMPANY: "",
      EMAIL: "",
      PHONE: "",
      NOTES: e.notes || "",
      EXTRA_METADATA: "",
      CREATED_AT: e.created_at || "",
    });
  });

  // 6. Loans
  (data.loans || []).forEach((l) => {
    rows.push({
      MODULE: "LOAN",
      ID: l.id,
      DATE: l.due_date || "",
      NAME_OR_DESCRIPTION: l.reason || "Loan / Qarza",
      AMOUNT_OR_FEE: l.principal_amount ?? "",
      CATEGORY_OR_COURSE: "Liability",
      STATUS_OR_TYPE: l.status || "active",
      PAYMENT_METHOD: "",
      RECEIVED_AMOUNT: Number(l.principal_amount || 0) - Number(l.remaining_amount || 0),
      REMAINING_AMOUNT: l.remaining_amount ?? 0,
      CLIENT_OR_LENDER_OR_COMPANY: l.lender || "",
      EMAIL: "",
      PHONE: "",
      NOTES: l.reason || "",
      EXTRA_METADATA: l.interest_rate ? `interest:${l.interest_rate}%` : "",
      CREATED_AT: l.created_at || "",
    });
  });

  // 7. Owner Payments
  (data.ownerPayments || []).forEach((op) => {
    rows.push({
      MODULE: "OWNER_PAYMENT",
      ID: op.id,
      DATE: op.date || "",
      NAME_OR_DESCRIPTION: op.notes || "Owner Distribution",
      AMOUNT_OR_FEE: op.amount ?? "",
      CATEGORY_OR_COURSE: "Profit Withdrawal",
      STATUS_OR_TYPE: "owner_draw",
      PAYMENT_METHOD: op.payment_method || "",
      RECEIVED_AMOUNT: "",
      REMAINING_AMOUNT: "",
      CLIENT_OR_LENDER_OR_COMPANY: op.recipient_name || "Tayyab",
      EMAIL: "",
      PHONE: "",
      NOTES: op.notes || "",
      EXTRA_METADATA: "",
      CREATED_AT: op.created_at || "",
    });
  });

  // 8. Products
  (data.products || []).forEach((p) => {
    rows.push({
      MODULE: "PRODUCT",
      ID: p.id,
      DATE: "",
      NAME_OR_DESCRIPTION: p.name || "",
      AMOUNT_OR_FEE: p.selling_price ?? "",
      CATEGORY_OR_COURSE: p.category || "",
      STATUS_OR_TYPE: p.type || "physical",
      PAYMENT_METHOD: p.platform || "direct",
      RECEIVED_AMOUNT: p.cost_price ?? 0,
      REMAINING_AMOUNT: p.stock_quantity ?? 0,
      CLIENT_OR_LENDER_OR_COMPANY: p.sku || "",
      EMAIL: "",
      PHONE: "",
      NOTES: p.description || p.notes || "",
      EXTRA_METADATA: `threshold:${p.low_stock_threshold};status:${p.status}`,
      CREATED_AT: p.created_at || "",
    });
  });

  // 9. Customers
  (data.customers || []).forEach((c) => {
    rows.push({
      MODULE: "CUSTOMER",
      ID: c.id,
      DATE: "",
      NAME_OR_DESCRIPTION: c.name || "",
      AMOUNT_OR_FEE: "",
      CATEGORY_OR_COURSE: c.status || "active",
      STATUS_OR_TYPE: "customer",
      PAYMENT_METHOD: "",
      RECEIVED_AMOUNT: "",
      REMAINING_AMOUNT: "",
      CLIENT_OR_LENDER_OR_COMPANY: c.country || "Pakistan",
      EMAIL: c.email || "",
      PHONE: c.phone || c.whatsapp || "",
      NOTES: c.address || c.notes || "",
      EXTRA_METADATA: "",
      CREATED_AT: c.created_at || "",
    });
  });

  // 10. Orders
  (data.orders || []).forEach((o) => {
    rows.push({
      MODULE: "ORDER",
      ID: o.id,
      DATE: o.order_date || "",
      NAME_OR_DESCRIPTION: `Order #${o.order_number} - ${o.customer_name}`,
      AMOUNT_OR_FEE: o.total_revenue ?? "",
      CATEGORY_OR_COURSE: o.platform || "direct",
      STATUS_OR_TYPE: o.order_status || "delivered",
      PAYMENT_METHOD: o.payment_method || "",
      RECEIVED_AMOUNT: o.actual_profit ?? 0,
      REMAINING_AMOUNT: o.total_cogs ?? 0,
      CLIENT_OR_LENDER_OR_COMPANY: o.customer_name || "",
      EMAIL: o.customer_email || "",
      PHONE: o.customer_phone || "",
      NOTES: o.notes || "",
      EXTRA_METADATA: `items:${JSON.stringify(o.items || [])};pay_status:${o.payment_status}`,
      CREATED_AT: o.created_at || "",
    });
  });

  // 11. Ad Campaigns
  (data.adCampaigns || []).forEach((a) => {
    rows.push({
      MODULE: "AD_CAMPAIGN",
      ID: a.id,
      DATE: a.start_date || "",
      NAME_OR_DESCRIPTION: a.name || "",
      AMOUNT_OR_FEE: a.budget ?? "",
      CATEGORY_OR_COURSE: a.platform || "meta",
      STATUS_OR_TYPE: a.status || "active",
      PAYMENT_METHOD: "",
      RECEIVED_AMOUNT: a.actual_spend ?? 0,
      REMAINING_AMOUNT: a.attributed_revenue ?? 0,
      CLIENT_OR_LENDER_OR_COMPANY: a.objective || "",
      EMAIL: "",
      PHONE: "",
      NOTES: a.notes || "",
      EXTRA_METADATA: `clicks:${a.clicks};conversions:${a.conversions};orders:${a.orders_count}`,
      CREATED_AT: a.created_at || "",
    });
  });

  return Papa.unparse(rows, {
    quotes: true,
    header: true,
  });
}

/**
 * Individual Module CSV Exporters
 */
export function generateModuleCsv(
  moduleKey:
    | "transactions"
    | "students"
    | "clients"
    | "projects"
    | "expenses"
    | "loans"
    | "owner_payments"
    | "products"
    | "customers"
    | "orders"
    | "ad_campaigns",
  data: any[]
): string {
  if (!data || data.length === 0) {
    return "No records to export";
  }
  return Papa.unparse(data, { quotes: true, header: true });
}

/**
 * Parse any CSV content (Full Backup or Individual Table CSV)
 */
export function parseAndValidateCsv(csvText: string): ParseResult {
  const result: ParseResult = {
    success: false,
    totalRecords: 0,
    data: {
      transactions: [],
      students: [],
      clients: [],
      projects: [],
      expenses: [],
      loans: [],
      ownerPayments: [],
      products: [],
      customers: [],
      orders: [],
      inventoryMovements: [],
      adCampaigns: [],
      productReturns: [],
    },
    detectedModules: [],
  };

  try {
    const parsed = Papa.parse<Record<string, string>>(csvText.trim(), {
      header: true,
      skipEmptyLines: true,
    });

    if (parsed.errors && parsed.errors.length > 0 && parsed.data.length === 0) {
      result.error = `CSV parsing error: ${parsed.errors[0].message}`;
      return result;
    }

    const rows = parsed.data;
    if (rows.length === 0) {
      result.error = "The uploaded CSV file is empty.";
      return result;
    }

    const firstRow = rows[0];
    const headers = Object.keys(firstRow).map((h) => h.trim().toUpperCase());

    const isUnifiedBackup =
      headers.includes("MODULE") &&
      (headers.includes("NAME_OR_DESCRIPTION") || headers.includes("AMOUNT_OR_FEE"));

    if (isUnifiedBackup) {
      rows.forEach((row) => {
        const mod = (row.MODULE || row.module || "").toUpperCase().trim();
        const id = row.ID || row.id || nanoid();
        const date = row.DATE || row.date || new Date().toISOString().split("T")[0];
        const nameDesc = row.NAME_OR_DESCRIPTION || row.name || row.description || "";
        const amount = parseFloat(row.AMOUNT_OR_FEE || row.amount || row.fee || "0") || 0;
        const catCourse = row.CATEGORY_OR_COURSE || row.category || row.course || "General";
        const statusType = row.STATUS_OR_TYPE || row.status || row.type || "";
        const method = (row.PAYMENT_METHOD || row.payment_method || "bank_transfer") as any;
        const notes = row.NOTES || row.notes || "";
        const received = parseFloat(row.RECEIVED_AMOUNT || row.received_amount || "0") || 0;
        const remaining = parseFloat(row.REMAINING_AMOUNT || row.remaining_amount || "0") || 0;
        const clientLender = row.CLIENT_OR_LENDER_OR_COMPANY || row.lender || row.company || "";
        const email = row.EMAIL || row.email || "";
        const phone = row.PHONE || row.phone || "";
        const createdAt = row.CREATED_AT || row.created_at || new Date().toISOString();

        if (mod === "TRANSACTION" || mod.includes("TX")) {
          result.data.transactions.push({
            id,
            workspace_id: null,
            user_id: "user_1",
            amount,
            type: (statusType || (amount >= 0 ? "income" : "expense")) as any,
            category: catCourse || null,
            description: nameDesc || "Imported transaction",
            date,
            payment_method: method,
            notes: notes || null,
            reference_id: null,
            reference_type: null,
            created_at: createdAt,
            updated_at: createdAt,
          });
        } else if (mod === "STUDENT") {
          result.data.students.push({
            id,
            workspace_id: null,
            user_id: "user_1",
            name: nameDesc || "Student",
            email: email || null,
            phone: phone || null,
            course: catCourse || null,
            total_fee: amount,
            received_amount: received,
            created_at: createdAt,
            updated_at: createdAt,
          });
        } else if (mod === "CLIENT") {
          result.data.clients.push({
            id,
            workspace_id: null,
            user_id: "user_1",
            name: nameDesc || "Client",
            email: email || null,
            phone: phone || null,
            company: clientLender || null,
            created_at: createdAt,
            updated_at: createdAt,
          });
        } else if (mod === "PROJECT") {
          result.data.projects.push({
            id,
            workspace_id: null,
            user_id: "user_1",
            client_id: clientLender || "cli_1",
            name: nameDesc || "Project",
            description: notes || null,
            total_amount: amount,
            received_amount: received,
            status: (statusType as any) || "active",
            start_date: date || null,
            end_date: null,
            created_at: createdAt,
            updated_at: createdAt,
          });
        } else if (mod === "EXPENSE") {
          result.data.expenses.push({
            id,
            workspace_id: null,
            user_id: "user_1",
            category: catCourse || "General",
            description: nameDesc || "Expense",
            amount,
            date,
            payment_method: method,
            notes: notes || null,
            created_at: createdAt,
            updated_at: createdAt,
          });
        } else if (mod === "LOAN") {
          result.data.loans.push({
            id,
            workspace_id: null,
            user_id: "user_1",
            lender: clientLender || nameDesc || "Lender",
            principal_amount: amount,
            remaining_amount: remaining || amount,
            interest_rate: null,
            due_date: date || null,
            status: (statusType as any) || "active",
            reason: notes || nameDesc || null,
            created_at: createdAt,
            updated_at: createdAt,
          });
        } else if (mod === "OWNER_PAYMENT") {
          result.data.ownerPayments.push({
            id,
            owner_id: "owner_1",
            recipient_name: clientLender || "Tayyab",
            transaction_id: `tx_${id}`,
            amount,
            date,
            payment_method: method,
            notes: notes || null,
            created_at: createdAt,
          });
        } else if (mod === "PRODUCT") {
          if (!result.data.products) result.data.products = [];
          result.data.products.push({
            id,
            user_id: "user_1",
            workspace_id: null,
            name: nameDesc || "Product",
            type: (statusType as any) || "physical",
            sku: clientLender || `SKU-${nanoid(6).toUpperCase()}`,
            category: catCourse || "General",
            selling_price: amount,
            cost_price: received,
            platform: (method as any) || "direct",
            stock_quantity: remaining,
            low_stock_threshold: 5,
            status: "active",
            description: notes || null,
            created_at: createdAt,
            updated_at: createdAt,
          });
        } else if (mod === "CUSTOMER") {
          if (!result.data.customers) result.data.customers = [];
          result.data.customers.push({
            id,
            user_id: "user_1",
            workspace_id: null,
            name: nameDesc || "Customer",
            email: email || null,
            phone: phone || null,
            country: clientLender || "Pakistan",
            address: notes || null,
            status: "active",
            created_at: createdAt,
            updated_at: createdAt,
          });
        } else if (mod === "AD_CAMPAIGN") {
          if (!result.data.adCampaigns) result.data.adCampaigns = [];
          result.data.adCampaigns.push({
            id,
            user_id: "user_1",
            workspace_id: null,
            name: nameDesc || "Campaign",
            platform: (catCourse.toLowerCase() as any) || "meta",
            objective: clientLender || "Conversions",
            start_date: date,
            budget: amount,
            actual_spend: received,
            impressions: 0,
            reach: 0,
            clicks: 0,
            conversions: 0,
            orders_count: 0,
            attributed_revenue: remaining,
            status: (statusType as any) || "active",
            notes: notes || null,
            created_at: createdAt,
            updated_at: createdAt,
          });
        }
      });
    }

    const detected: string[] = [];
    if (result.data.transactions.length) detected.push(`${result.data.transactions.length} Transactions`);
    if (result.data.students.length) detected.push(`${result.data.students.length} Students`);
    if (result.data.clients.length) detected.push(`${result.data.clients.length} Clients`);
    if (result.data.projects.length) detected.push(`${result.data.projects.length} Projects`);
    if (result.data.expenses.length) detected.push(`${result.data.expenses.length} Expenses`);
    if (result.data.loans.length) detected.push(`${result.data.loans.length} Loans`);
    if (result.data.ownerPayments.length) detected.push(`${result.data.ownerPayments.length} Owner Payments`);
    if (result.data.products?.length) detected.push(`${result.data.products.length} Products`);
    if (result.data.customers?.length) detected.push(`${result.data.customers.length} Customers`);
    if (result.data.orders?.length) detected.push(`${result.data.orders.length} Orders`);
    if (result.data.adCampaigns?.length) detected.push(`${result.data.adCampaigns.length} Ad Campaigns`);

    result.detectedModules = detected;
    result.totalRecords =
      result.data.transactions.length +
      result.data.students.length +
      result.data.clients.length +
      result.data.projects.length +
      result.data.expenses.length +
      result.data.loans.length +
      result.data.ownerPayments.length +
      (result.data.products?.length || 0) +
      (result.data.customers?.length || 0) +
      (result.data.orders?.length || 0) +
      (result.data.adCampaigns?.length || 0);

    result.success = result.totalRecords > 0;
    return result;
  } catch (err: any) {
    result.error = `Failed to parse CSV: ${err?.message || "Unknown error"}`;
    return result;
  }
}
