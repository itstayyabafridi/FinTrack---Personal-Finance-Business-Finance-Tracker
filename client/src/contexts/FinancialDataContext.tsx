import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from "react";
import type {
  Transaction,
  TransactionType,
  PaymentMethod,
  Student,
  Client,
  Project,
  Expense,
  Loan,
  OwnerPayment,
  Owner,
  Product,
  ProductType,
  ProductPlatform,
  ProductStatus,
  Customer,
  CustomerStatus,
  Order,
  OrderItem,
  OrderStatus,
  OrderPaymentStatus,
  InventoryMovement,
  InventoryMovementType,
  AdCampaign,
  AdCampaignStatus,
  AdPlatform,
  ProductReturn,
} from "@shared/types";
import { toast } from "sonner";

// Input interfaces
export interface NewTransactionInput {
  description: string;
  amount: number;
  type: TransactionType;
  date: string;
  category?: string;
  payment_method: PaymentMethod;
  notes?: string;
  reference_id?: string;
  reference_type?: string;
}

export interface NewStudentInput {
  name: string;
  email?: string;
  phone?: string;
  course?: string;
  total_fee: number;
  received_amount?: number;
}

export interface NewClientInput {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
}

export interface NewProjectInput {
  client_id?: string;
  name: string;
  description?: string;
  total_amount: number;
  received_amount?: number;
  status?: "active" | "completed" | "on_hold" | "cancelled";
  start_date?: string;
  end_date?: string;
}

export interface NewExpenseInput {
  category: string;
  description: string;
  amount: number;
  date: string;
  payment_method: PaymentMethod;
  notes?: string;
}

export interface NewLoanInput {
  lender: string;
  principal_amount: number;
  remaining_amount?: number;
  interest_rate?: number;
  due_date?: string;
  status?: "active" | "paid" | "overdue";
  reason?: string;
}

export interface NewOwnerPaymentInput {
  owner_id?: string;
  recipient_name?: string;
  amount: number;
  date: string;
  payment_method: PaymentMethod;
  notes?: string;
}

// Sales & Business Input Interfaces
export interface NewProductInput {
  name: string;
  type: ProductType;
  sku: string;
  category?: string;
  selling_price: number;
  cost_price: number;
  platform?: ProductPlatform;
  stock_quantity?: number;
  low_stock_threshold?: number;
  image_url?: string | null;
  status?: ProductStatus;
  description?: string;
  notes?: string;
}

export interface NewCustomerInput {
  name: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  city?: string;
  country?: string;
  address?: string;
  notes?: string;
  status?: CustomerStatus;
}

export interface NewOrderItemInput {
  product_id: string;
  product_name: string;
  product_sku: string;
  product_type: ProductType;
  unit_price: number;
  unit_cost: number;
  quantity: number;
  total_price: number;
  total_cost: number;
  notes?: string;
}

export interface NewOrderInput {
  order_number?: string;
  customer_id?: string | null;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  order_date: string;
  order_status?: OrderStatus;
  payment_status?: OrderPaymentStatus;
  payment_method: PaymentMethod;
  platform?: ProductPlatform;
  ad_campaign_id?: string | null;
  source?: string;
  items: NewOrderItemInput[];
  discount?: number;
  shipping_cost?: number;
  packaging_cost?: number;
  platform_fee?: number;
  payment_fee?: number;
  ad_cost?: number;
  notes?: string;
}

export interface NewInventoryMovementInput {
  product_id: string;
  product_name: string;
  quantity: number; // positive or negative
  type: InventoryMovementType;
  date: string;
  reason: string;
  reference_id?: string;
  reference_type?: string;
  notes?: string;
}

export interface NewAdCampaignInput {
  name: string;
  platform: AdPlatform;
  product_id?: string | null;
  product_ids?: string[];
  objective?: string;
  start_date: string;
  end_date?: string | null;
  budget: number;
  actual_spend: number;
  impressions?: number;
  reach?: number;
  clicks?: number;
  conversions?: number;
  orders_count?: number;
  attributed_revenue?: number;
  status?: AdCampaignStatus;
  notes?: string;
  syncToExpenses?: boolean;
}

export interface NewProductReturnInput {
  order_id: string;
  order_number: string;
  customer_name: string;
  product_id: string;
  product_name: string;
  quantity: number;
  refund_amount: number;
  refund_date: string;
  reason: string;
  restock_inventory: boolean;
  return_shipping_cost?: number;
  notes?: string;
}

// Budget Configuration and Analytics Types
export interface BudgetConfig {
  monthlyBudget: number;
  weeklyBudget: number;
}

export interface PeriodBudgetAnalytics {
  period: "month" | "week";
  title: string;
  startDateStr: string;
  endDateStr: string;
  budget: number;
  spent: number;
  remaining: number;
  percentUsed: number;
  isOverBudget: boolean;
  overBudgetAmount: number;
  income: number;
  netProfit: number;
  profitMargin: number;
  isProfit: boolean;
  transactionCount: number;
  expenseCount: number;
  incomeCount: number;
  expenses: Transaction[];
  incomeTransactions: Transaction[];
  daysRemaining: number;
  suggestedDailySpend: number;
  dailySpending: { date: string; dayLabel: string; spent: number; income: number }[];
}

// Full Context Type
export interface FinancialDataContextType {
  // Core Entities
  transactions: Transaction[];
  students: Student[];
  clients: Client[];
  projects: Project[];
  expenses: Expense[];
  loans: Loan[];
  ownerPayments: OwnerPayment[];
  owners: Owner[];

  // Monthly & Weekly Budget & Profit/Loss Features
  monthlyBudget: number;
  weeklyBudget: number;
  setMonthlyBudget: (amount: number) => void;
  setWeeklyBudget: (amount: number) => void;
  monthlyAnalytics: PeriodBudgetAnalytics;
  weeklyAnalytics: PeriodBudgetAnalytics;

  // Sales & Business Entities
  products: Product[];
  customers: Customer[];
  orders: Order[];
  inventoryMovements: InventoryMovement[];
  adCampaigns: AdCampaign[];
  productReturns: ProductReturn[];

  // Global Financial Metrics
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  receivables: number;
  payables: number;
  outstandingLoans: number;
  chartData: { day: string; income: number; expenses: number; profit: number }[];

  // Sales & Business Specific Metrics
  salesMetrics: {
    totalRevenue: number;
    totalOrders: number;
    totalUnitsSold: number;
    totalCOGS: number;
    totalAdSpend: number;
    totalFees: number;
    totalShipping: number;
    totalRefunds: number;
    netSales: number;
    actualProfit: number;
    blendedROAS: number;
    blendedCPA: number;
    averageOrderValue: number;
    lowStockCount: number;
    outOfStockCount: number;
    totalInventoryValue: number;
  };

  // Core Mutation Methods
  addTransaction: (input: NewTransactionInput) => Transaction;
  deleteTransaction: (id: string) => void;

  addStudent: (input: NewStudentInput) => Student;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;

  addClient: (input: NewClientInput) => Client;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  addProject: (input: NewProjectInput) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  addExpense: (input: NewExpenseInput) => Expense;
  deleteExpense: (id: string) => void;

  addLoan: (input: NewLoanInput) => Loan;
  updateLoan: (id: string, updates: Partial<Loan>) => void;
  deleteLoan: (id: string) => void;

  addOwnerPayment: (input: NewOwnerPaymentInput) => OwnerPayment;
  deleteOwnerPayment: (id: string) => void;

  // Sales & Business Mutation Methods
  addProduct: (input: NewProductInput) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  duplicateProduct: (id: string) => Product | null;

  addCustomer: (input: NewCustomerInput) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  addOrder: (input: NewOrderInput) => Order;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  deleteOrder: (id: string) => void;

  addInventoryMovement: (input: NewInventoryMovementInput) => InventoryMovement;
  
  addAdCampaign: (input: NewAdCampaignInput) => AdCampaign;
  updateAdCampaign: (id: string, updates: Partial<AdCampaign>) => void;
  deleteAdCampaign: (id: string) => void;

  processReturn: (input: NewProductReturnInput) => ProductReturn;

  // Database Management
  clearAllData: () => void;
  restoreDatabase: (
    data: {
      transactions?: Transaction[];
      students?: Student[];
      clients?: Client[];
      projects?: Project[];
      expenses?: Expense[];
      loans?: Loan[];
      ownerPayments?: OwnerPayment[];
      products?: Product[];
      customers?: Customer[];
      orders?: Order[];
      inventoryMovements?: InventoryMovement[];
      adCampaigns?: AdCampaign[];
      productReturns?: ProductReturn[];
    },
    mode?: "replace" | "merge"
  ) => { total: number };
}

const STORAGE_KEYS = {
  TRANSACTIONS: "fintrack_transactions_v2",
  STUDENTS: "fintrack_students_v2",
  CLIENTS: "fintrack_clients_v2",
  PROJECTS: "fintrack_projects_v2",
  EXPENSES: "fintrack_expenses_v2",
  LOANS: "fintrack_loans_v2",
  OWNER_PAYMENTS: "fintrack_owner_payments_v2",
  OWNERS: "fintrack_owners_v2",
  // Sales & Business Keys
  PRODUCTS: "fintrack_products_v2",
  CUSTOMERS: "fintrack_customers_v2",
  ORDERS: "fintrack_orders_v2",
  INVENTORY_MOVEMENTS: "fintrack_inventory_movements_v2",
  AD_CAMPAIGNS: "fintrack_ad_campaigns_v2",
  PRODUCT_RETURNS: "fintrack_product_returns_v2",
  BUDGET_CONFIG: "fintrack_budget_config_v2",
};

// Initial Seed Data for Sales & Business
const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod_1",
    user_id: "user_current",
    workspace_id: "workspace_1",
    name: "E-Commerce Growth Masterclass",
    type: "digital",
    sku: "DIG-ECOM-01",
    category: "Digital Courses",
    selling_price: 12500,
    cost_price: 500,
    platform: "gumroad",
    stock_quantity: 0,
    low_stock_threshold: 0,
    status: "active",
    description: "Complete 8-module video course on scaling direct-to-consumer e-commerce brands.",
    notes: "High margin digital curriculum with automated access delivery.",
    created_at: "2026-08-01T10:00:00.000Z",
    updated_at: "2026-08-01T10:00:00.000Z",
  },
  {
    id: "prod_2",
    user_id: "user_current",
    workspace_id: "workspace_1",
    name: "Minimalist Leather Cardholder",
    type: "physical",
    sku: "PHY-LTH-02",
    category: "Leather Goods",
    selling_price: 3800,
    cost_price: 1400,
    platform: "shopify",
    stock_quantity: 34,
    low_stock_threshold: 10,
    status: "active",
    description: "Top-grain genuine leather RFID-blocking slim cardholder wallet with cash clip.",
    notes: "Best seller in accessories category. Reliable local manufacturing partner.",
    created_at: "2026-08-02T11:00:00.000Z",
    updated_at: "2026-08-02T11:00:00.000Z",
  },
  {
    id: "prod_3",
    user_id: "user_current",
    workspace_id: "workspace_1",
    name: "Pro Studio Wireless Headphones",
    type: "physical",
    sku: "PHY-AUD-03",
    category: "Electronics",
    selling_price: 18500,
    cost_price: 8200,
    platform: "woocommerce",
    stock_quantity: 4,
    low_stock_threshold: 8,
    status: "active",
    description: "Active noise-cancelling studio monitoring wireless over-ear headphones.",
    notes: "Low stock alert triggered. Re-order shipment from manufacturer pending.",
    created_at: "2026-08-03T12:00:00.000Z",
    updated_at: "2026-08-03T12:00:00.000Z",
  },
  {
    id: "prod_4",
    user_id: "user_current",
    workspace_id: "workspace_1",
    name: "SaaS Notion Operating OS",
    type: "digital",
    sku: "DIG-TMP-04",
    category: "Templates",
    selling_price: 4999,
    cost_price: 0,
    platform: "direct",
    stock_quantity: 0,
    low_stock_threshold: 0,
    status: "active",
    description: "All-in-one Notion workspace template for freelance founders and agency owners.",
    notes: "Instant digital download link provided post payment.",
    created_at: "2026-08-04T13:00:00.000Z",
    updated_at: "2026-08-04T13:00:00.000Z",
  },
];

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: "cust_1",
    user_id: "user_current",
    workspace_id: "workspace_1",
    name: "Hamza Tariq",
    email: "hamza.tariq@example.com",
    phone: "+92 321 9876543",
    whatsapp: "+92 321 9876543",
    country: "Pakistan",
    address: "DHA Phase 5, Lahore",
    notes: "VIP customer who enrolled in course and purchased multiple toolkits.",
    status: "vip",
    created_at: "2026-08-05T09:00:00.000Z",
    updated_at: "2026-08-05T09:00:00.000Z",
  },
  {
    id: "cust_2",
    user_id: "user_current",
    workspace_id: "workspace_1",
    name: "Ayesha Malik",
    email: "ayesha.m@example.com",
    phone: "+92 333 4567890",
    whatsapp: "+92 333 4567890",
    country: "Pakistan",
    address: "Clifton Block 4, Karachi",
    notes: "Frequent shopper for leather goods & accessories.",
    status: "active",
    created_at: "2026-08-06T14:30:00.000Z",
    updated_at: "2026-08-06T14:30:00.000Z",
  },
  {
    id: "cust_3",
    user_id: "user_current",
    workspace_id: "workspace_1",
    name: "Zain Ahmed",
    email: "zain.a@example.com",
    phone: "+92 300 8765432",
    whatsapp: "+92 300 8765432",
    country: "Pakistan",
    address: "F-11/2, Islamabad",
    notes: "Audiophile customer. Requested express courier delivery.",
    status: "returning",
    created_at: "2026-08-07T16:15:00.000Z",
    updated_at: "2026-08-07T16:15:00.000Z",
  },
  {
    id: "cust_4",
    user_id: "user_current",
    workspace_id: "workspace_1",
    name: "Sara Khan",
    email: "sara.k@example.com",
    phone: "+92 312 3456789",
    whatsapp: "+92 312 3456789",
    country: "Pakistan",
    address: "Satellite Town, Rawalpindi",
    notes: "Direct website purchase of Notion OS template.",
    status: "new",
    created_at: "2026-08-08T18:00:00.000Z",
    updated_at: "2026-08-08T18:00:00.000Z",
  },
];

const INITIAL_CAMPAIGNS: AdCampaign[] = [
  {
    id: "ad_1",
    user_id: "user_current",
    workspace_id: "workspace_1",
    name: "Meta Retargeting - Summer Sale",
    platform: "meta",
    product_id: "prod_2",
    product_ids: ["prod_2"],
    objective: "Conversions",
    start_date: "2026-08-01",
    end_date: null,
    budget: 25000,
    actual_spend: 18500,
    impressions: 45200,
    reach: 38400,
    clicks: 1250,
    conversions: 22,
    orders_count: 22,
    attributed_revenue: 83600,
    status: "active",
    notes: "Meta Advantage+ catalog campaign targeting accessory buyers in Lahore, Karachi & Islamabad.",
    created_at: "2026-08-01T08:00:00.000Z",
    updated_at: "2026-08-20T10:00:00.000Z",
  },
  {
    id: "ad_2",
    user_id: "user_current",
    workspace_id: "workspace_1",
    name: "TikTok Video Boost - Audio Gear",
    platform: "tiktok",
    product_id: "prod_3",
    product_ids: ["prod_3"],
    objective: "Traffic & Sales",
    start_date: "2026-08-05",
    end_date: null,
    budget: 30000,
    actual_spend: 22000,
    impressions: 98400,
    reach: 82000,
    clicks: 2400,
    conversions: 14,
    orders_count: 14,
    attributed_revenue: 259000,
    status: "active",
    notes: "Creator UGC video reviewing noise cancellation feature. 11.7x ROAS achieved.",
    created_at: "2026-08-05T08:00:00.000Z",
    updated_at: "2026-08-21T10:00:00.000Z",
  },
  {
    id: "ad_3",
    user_id: "user_current",
    workspace_id: "workspace_1",
    name: "Google Search - Growth Course",
    platform: "google",
    product_id: "prod_1",
    product_ids: ["prod_1"],
    objective: "Course Signups",
    start_date: "2026-08-10",
    end_date: null,
    budget: 40000,
    actual_spend: 35000,
    impressions: 32100,
    reach: 24500,
    clicks: 980,
    conversions: 18,
    orders_count: 18,
    attributed_revenue: 225000,
    status: "active",
    notes: "High intent search keywords: 'ecommerce masterclass pakistan', 'shopify course online'.",
    created_at: "2026-08-10T08:00:00.000Z",
    updated_at: "2026-08-22T10:00:00.000Z",
  },
];

const INITIAL_ORDERS: Order[] = [
  {
    id: "ord_1",
    user_id: "user_current",
    workspace_id: "workspace_1",
    order_number: "ORD-8801",
    customer_id: "cust_1",
    customer_name: "Hamza Tariq",
    customer_email: "hamza.tariq@example.com",
    customer_phone: "+92 321 9876543",
    order_date: "2026-08-19",
    order_status: "delivered",
    payment_status: "paid",
    payment_method: "card",
    platform: "gumroad",
    ad_campaign_id: "ad_3",
    source: "Google Search",
    items: [
      {
        id: "item_1",
        order_id: "ord_1",
        product_id: "prod_1",
        product_name: "E-Commerce Growth Masterclass",
        product_sku: "DIG-ECOM-01",
        product_type: "digital",
        unit_price: 12500,
        unit_cost: 500,
        quantity: 1,
        total_price: 12500,
        total_cost: 500,
      },
    ],
    subtotal: 12500,
    discount: 0,
    shipping_cost: 0,
    packaging_cost: 0,
    platform_fee: 375,
    payment_fee: 250,
    ad_cost: 1944,
    total_revenue: 12500,
    total_cogs: 500,
    actual_profit: 9431,
    notes: "Enrolled in masterclass via Google Search campaign.",
    created_at: "2026-08-19T11:20:00.000Z",
    updated_at: "2026-08-19T11:20:00.000Z",
  },
  {
    id: "ord_2",
    user_id: "user_current",
    workspace_id: "workspace_1",
    order_number: "ORD-8802",
    customer_id: "cust_2",
    customer_name: "Ayesha Malik",
    customer_email: "ayesha.m@example.com",
    customer_phone: "+92 333 4567890",
    order_date: "2026-08-20",
    order_status: "delivered",
    payment_status: "paid",
    payment_method: "bank_transfer",
    platform: "shopify",
    ad_campaign_id: "ad_1",
    source: "Meta Ads",
    items: [
      {
        id: "item_2",
        order_id: "ord_2",
        product_id: "prod_2",
        product_name: "Minimalist Leather Cardholder",
        product_sku: "PHY-LTH-02",
        product_type: "physical",
        unit_price: 3800,
        unit_cost: 1400,
        quantity: 2,
        total_price: 7600,
        total_cost: 2800,
      },
    ],
    subtotal: 7600,
    discount: 0,
    shipping_cost: 300,
    packaging_cost: 150,
    platform_fee: 190,
    payment_fee: 150,
    ad_cost: 840,
    total_revenue: 7900,
    total_cogs: 2800,
    actual_profit: 3470,
    notes: "Shipped via TCS Express tracking #TCS9920194.",
    created_at: "2026-08-20T14:15:00.000Z",
    updated_at: "2026-08-20T14:15:00.000Z",
  },
  {
    id: "ord_3",
    user_id: "user_current",
    workspace_id: "workspace_1",
    order_number: "ORD-8803",
    customer_id: "cust_3",
    customer_name: "Zain Ahmed",
    customer_email: "zain.a@example.com",
    customer_phone: "+92 300 8765432",
    order_date: "2026-08-21",
    order_status: "shipped",
    payment_status: "paid",
    payment_method: "easypaisa",
    platform: "woocommerce",
    ad_campaign_id: "ad_2",
    source: "TikTok UGC",
    items: [
      {
        id: "item_3",
        order_id: "ord_3",
        product_id: "prod_3",
        product_name: "Pro Studio Wireless Headphones",
        product_sku: "PHY-AUD-03",
        product_type: "physical",
        unit_price: 18500,
        unit_cost: 8200,
        quantity: 1,
        total_price: 18500,
        total_cost: 8200,
      },
    ],
    subtotal: 18500,
    discount: 0,
    shipping_cost: 400,
    packaging_cost: 250,
    platform_fee: 370,
    payment_fee: 370,
    ad_cost: 1570,
    total_revenue: 18900,
    total_cogs: 8200,
    actual_profit: 7740,
    notes: "Shipped via Call Courier #CC883011.",
    created_at: "2026-08-21T16:45:00.000Z",
    updated_at: "2026-08-21T16:45:00.000Z",
  },
  {
    id: "ord_4",
    user_id: "user_current",
    workspace_id: "workspace_1",
    order_number: "ORD-8804",
    customer_id: "cust_4",
    customer_name: "Sara Khan",
    customer_email: "sara.k@example.com",
    customer_phone: "+92 312 3456789",
    order_date: "2026-08-22",
    order_status: "delivered",
    payment_status: "paid",
    payment_method: "jazzcash",
    platform: "direct",
    source: "Direct Website",
    items: [
      {
        id: "item_4",
        order_id: "ord_4",
        product_id: "prod_4",
        product_name: "SaaS Notion Operating OS",
        product_sku: "DIG-TMP-04",
        product_type: "digital",
        unit_price: 4999,
        unit_cost: 0,
        quantity: 1,
        total_price: 4999,
        total_cost: 0,
      },
    ],
    subtotal: 4999,
    discount: 0,
    shipping_cost: 0,
    packaging_cost: 0,
    platform_fee: 0,
    payment_fee: 100,
    ad_cost: 0,
    total_revenue: 4999,
    total_cogs: 0,
    actual_profit: 4899,
    notes: "Instant digital delivery completed.",
    created_at: "2026-08-22T09:10:00.000Z",
    updated_at: "2026-08-22T09:10:00.000Z",
  },
];

const INITIAL_INVENTORY_MOVEMENTS: InventoryMovement[] = [
  {
    id: "inv_1",
    user_id: "user_current",
    product_id: "prod_2",
    product_name: "Minimalist Leather Cardholder",
    quantity: 40,
    previous_stock: 0,
    new_stock: 40,
    type: "stock_added",
    date: "2026-08-01",
    reason: "Initial batch production inventory receipt",
    created_at: "2026-08-01T10:00:00.000Z",
  },
  {
    id: "inv_2",
    user_id: "user_current",
    product_id: "prod_2",
    product_name: "Minimalist Leather Cardholder",
    quantity: -4,
    previous_stock: 40,
    new_stock: 36,
    type: "sale",
    date: "2026-08-15",
    reason: "Batch order fulfillment",
    reference_id: "ORD-8790",
    reference_type: "order",
    created_at: "2026-08-15T12:00:00.000Z",
  },
  {
    id: "inv_3",
    user_id: "user_current",
    product_id: "prod_2",
    product_name: "Minimalist Leather Cardholder",
    quantity: -2,
    previous_stock: 36,
    new_stock: 34,
    type: "sale",
    date: "2026-08-20",
    reason: "Order fulfillment ORD-8802",
    reference_id: "ORD-8802",
    reference_type: "order",
    created_at: "2026-08-20T14:15:00.000Z",
  },
  {
    id: "inv_4",
    user_id: "user_current",
    product_id: "prod_3",
    product_name: "Pro Studio Wireless Headphones",
    quantity: 15,
    previous_stock: 0,
    new_stock: 15,
    type: "stock_added",
    date: "2026-08-05",
    reason: "Wholesale factory consignment intake",
    created_at: "2026-08-05T10:00:00.000Z",
  },
  {
    id: "inv_5",
    user_id: "user_current",
    product_id: "prod_3",
    product_name: "Pro Studio Wireless Headphones",
    quantity: -10,
    previous_stock: 15,
    new_stock: 5,
    type: "sale",
    date: "2026-08-18",
    reason: "Pre-order launch batch dispatch",
    created_at: "2026-08-18T11:00:00.000Z",
  },
  {
    id: "inv_6",
    user_id: "user_current",
    product_id: "prod_3",
    product_name: "Pro Studio Wireless Headphones",
    quantity: -1,
    previous_stock: 5,
    new_stock: 4,
    type: "sale",
    date: "2026-08-21",
    reason: "Order fulfillment ORD-8803",
    reference_id: "ORD-8803",
    reference_type: "order",
    created_at: "2026-08-21T16:45:00.000Z",
  },
];

const FinancialDataContext = createContext<FinancialDataContextType | null>(null);

export function FinancialDataProvider({ children }: { children: ReactNode }) {
  // Budget State (Monthly e.g. 100k, Weekly e.g. 25k)
  const [budgetConfig, setBudgetConfig] = useState<BudgetConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BUDGET_CONFIG);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          monthlyBudget: typeof parsed.monthlyBudget === "number" && parsed.monthlyBudget >= 0 ? parsed.monthlyBudget : 100000,
          weeklyBudget: typeof parsed.weeklyBudget === "number" && parsed.weeklyBudget >= 0 ? parsed.weeklyBudget : 25000,
        };
      }
    } catch {}
    return { monthlyBudget: 100000, weeklyBudget: 25000 };
  });

  const setMonthlyBudget = (amount: number) => {
    const valid = Math.max(0, Number(amount) || 0);
    setBudgetConfig((prev) => {
      const next = { ...prev, monthlyBudget: valid };
      try {
        localStorage.setItem(STORAGE_KEYS.BUDGET_CONFIG, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const setWeeklyBudget = (amount: number) => {
    const valid = Math.max(0, Number(amount) || 0);
    setBudgetConfig((prev) => {
      const next = { ...prev, weeklyBudget: valid };
      try {
        localStorage.setItem(STORAGE_KEYS.BUDGET_CONFIG, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Core Entities State
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const fourDaysAgo = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    return [
      {
        id: "tx_seed_1",
        user_id: "user_current",
        workspace_id: "workspace_1",
        type: "income",
        amount: 85000,
        description: "Client Milestone Retainer Payment",
        category: "Client Retainer",
        date: twoDaysAgo,
        payment_method: "Bank Transfer",
        notes: "Milestone 2 cleared via Bank Transfer",
        reference_id: null,
        reference_type: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "tx_seed_2",
        user_id: "user_current",
        workspace_id: "workspace_1",
        type: "expense",
        amount: 14500,
        description: "Office Utilities & Internet Connection",
        category: "Office & Rent",
        date: todayStr,
        payment_method: "Bank Transfer",
        notes: "Monthly utility and connectivity bill",
        reference_id: null,
        reference_type: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "tx_seed_3",
        user_id: "user_current",
        workspace_id: "workspace_1",
        type: "expense",
        amount: 8200,
        description: "Cloud Hosting & Development Tools",
        category: "Software & IT",
        date: twoDaysAgo,
        payment_method: "Credit Card",
        notes: "Cloud servers & tooling renewal",
        reference_id: null,
        reference_type: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "tx_seed_4",
        user_id: "user_current",
        workspace_id: "workspace_1",
        type: "product_sale",
        amount: 42000,
        description: "E-Commerce Product Order Settlement",
        category: "E-Commerce",
        date: fourDaysAgo,
        payment_method: "Cash on Delivery",
        notes: "Customer shipments fulfilled",
        reference_id: null,
        reference_type: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "tx_seed_5",
        user_id: "user_current",
        workspace_id: "workspace_1",
        type: "ad_spend",
        amount: 9800,
        description: "Meta & TikTok Growth Ad Campaign",
        category: "Marketing & Ads",
        date: fourDaysAgo,
        payment_method: "Credit Card",
        notes: "Performance marketing campaign",
        reference_id: null,
        reference_type: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  });

  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [clients, setClients] = useState<Client[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CLIENTS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [loans, setLoans] = useState<Loan[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LOANS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [ownerPayments, setOwnerPayments] = useState<OwnerPayment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.OWNER_PAYMENTS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [owners] = useState<Owner[]>([
    {
      id: "owner_1",
      user_id: "user_1",
      workspace_id: null,
      name: "Tayyab",
      email: "tayyab@example.com",
      phone: "+92 300 1234567",
      share_percentage: 100,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]);

  // Sales & Business Entities State
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return saved !== null ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      return saved !== null ? JSON.parse(saved) : INITIAL_CUSTOMERS;
    } catch {
      return INITIAL_CUSTOMERS;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return saved !== null ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  const [inventoryMovements, setInventoryMovements] = useState<InventoryMovement[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INVENTORY_MOVEMENTS);
      return saved !== null ? JSON.parse(saved) : INITIAL_INVENTORY_MOVEMENTS;
    } catch {
      return INITIAL_INVENTORY_MOVEMENTS;
    }
  });

  const [adCampaigns, setAdCampaigns] = useState<AdCampaign[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AD_CAMPAIGNS);
      return saved !== null ? JSON.parse(saved) : INITIAL_CAMPAIGNS;
    } catch {
      return INITIAL_CAMPAIGNS;
    }
  });

  const [productReturns, setProductReturns] = useState<ProductReturn[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCT_RETURNS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Local Storage Persistence
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(loans));
  }, [loans]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.OWNER_PAYMENTS, JSON.stringify(ownerPayments));
  }, [ownerPayments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INVENTORY_MOVEMENTS, JSON.stringify(inventoryMovements));
  }, [inventoryMovements]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AD_CAMPAIGNS, JSON.stringify(adCampaigns));
  }, [adCampaigns]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCT_RETURNS, JSON.stringify(productReturns));
  }, [productReturns]);

  // Real-time Global Financial Calculations
  const totalIncome = useMemo(() => {
    // 1. Transaction records categorized as income / sales
    const txIncome = transactions
      .filter((t) => ["income", "other_income", "student_fee", "client_payment", "product_sale"].includes(t.type))
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    // 2. Orders that are paid/delivered/processing and don't already have a transaction recorded
    const directOrderRevenue = orders
      .filter((o) => o.payment_status === "paid" && !o.transaction_id)
      .reduce((sum, o) => sum + Number(o.total_revenue || 0), 0);

    return txIncome + directOrderRevenue;
  }, [transactions, orders]);

  const totalExpenses = useMemo(() => {
    // 1. Transactions of type expense, ad_spend, shipping_cost, platform_fee, product_refund
    const txExpenses = transactions
      .filter((t) => ["expense", "ad_spend", "shipping_cost", "platform_fee", "product_refund"].includes(t.type))
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    // 2. Ad campaigns not linked to a specific expense transaction
    const directAdSpend = adCampaigns
      .filter((a) => !a.expense_id)
      .reduce((sum, a) => sum + Number(a.actual_spend || 0), 0);

    return txExpenses + directAdSpend;
  }, [transactions, adCampaigns]);

  const netProfit = totalIncome - totalExpenses;

  const receivables = useMemo(() => {
    const studentUnpaid = students.reduce(
      (sum, s) => sum + Math.max(0, Number(s.total_fee || 0) - Number(s.received_amount || 0)),
      0
    );
    const projectUnpaid = projects.reduce(
      (sum, p) => sum + Math.max(0, Number(p.total_amount || 0) - Number(p.received_amount || 0)),
      0
    );
    const orderUnpaid = orders
      .filter((o) => o.payment_status === "pending" || o.payment_status === "partially_paid")
      .reduce((sum, o) => sum + Number(o.total_revenue || 0), 0);

    return studentUnpaid + projectUnpaid + orderUnpaid;
  }, [students, projects, orders]);

  const payables = useMemo(() => {
    return loans
      .filter((l) => l.status !== "paid")
      .reduce((sum, l) => sum + Number(l.remaining_amount || 0), 0);
  }, [loans]);

  const outstandingLoans = useMemo(() => {
    return loans
      .filter((l) => l.status !== "paid")
      .reduce((sum, l) => sum + Number(l.remaining_amount || 0), 0);
  }, [loans]);

  // Sales & Business Specific Metrics
  const salesMetrics = useMemo(() => {
    const validOrders = orders.filter((o) => o.order_status !== "cancelled");
    const totalOrders = validOrders.length;
    const totalRevenue = validOrders.reduce((sum, o) => sum + Number(o.total_revenue || 0), 0);
    const totalCOGS = validOrders.reduce((sum, o) => sum + Number(o.total_cogs || 0), 0);
    const totalShipping = validOrders.reduce((sum, o) => sum + Number(o.shipping_cost || 0), 0);
    const totalFees = validOrders.reduce(
      (sum, o) => sum + Number(o.platform_fee || 0) + Number(o.payment_fee || 0) + Number(o.packaging_cost || 0),
      0
    );
    const totalUnitsSold = validOrders.reduce(
      (sum, o) => sum + o.items.reduce((iSum, item) => iSum + Number(item.quantity || 0), 0),
      0
    );
    const totalAdSpend = adCampaigns.reduce((sum, a) => sum + Number(a.actual_spend || 0), 0);
    const totalRefunds = productReturns.reduce((sum, r) => sum + Number(r.refund_amount || 0), 0);

    const netSales = totalRevenue - totalRefunds;
    const actualProfit = netSales - totalCOGS - totalShipping - totalFees - totalAdSpend;

    const totalAttributedRevenue = adCampaigns.reduce((sum, a) => sum + Number(a.attributed_revenue || 0), 0);
    const totalConversions = adCampaigns.reduce((sum, a) => sum + Number(a.conversions || 0), 0);

    const blendedROAS = totalAdSpend > 0 ? totalAttributedRevenue / totalAdSpend : 0;
    const blendedCPA = totalConversions > 0 ? totalAdSpend / totalConversions : 0;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const physicalProducts = products.filter((p) => p.type === "physical" && p.status === "active");
    const lowStockCount = physicalProducts.filter(
      (p) => p.stock_quantity > 0 && p.stock_quantity <= p.low_stock_threshold
    ).length;
    const outOfStockCount = physicalProducts.filter((p) => p.stock_quantity <= 0).length;
    const totalInventoryValue = physicalProducts.reduce(
      (sum, p) => sum + Number(p.stock_quantity || 0) * Number(p.cost_price || 0),
      0
    );

    return {
      totalRevenue,
      totalOrders,
      totalUnitsSold,
      totalCOGS,
      totalAdSpend,
      totalFees,
      totalShipping,
      totalRefunds,
      netSales,
      actualProfit,
      blendedROAS,
      blendedCPA,
      averageOrderValue,
      lowStockCount,
      outOfStockCount,
      totalInventoryValue,
    };
  }, [orders, adCampaigns, productReturns, products]);

  // Real-time Chart Data (Unified Ledger + Sales)
  const chartData = useMemo(() => {
    const daysMap: Record<string, { income: number; expenses: number; profit: number }> = {
      "01": { income: 0, expenses: 0, profit: 0 },
      "05": { income: 0, expenses: 0, profit: 0 },
      "09": { income: 0, expenses: 0, profit: 0 },
      "13": { income: 0, expenses: 0, profit: 0 },
      "17": { income: 0, expenses: 0, profit: 0 },
      "21": { income: 0, expenses: 0, profit: 0 },
      "25": { income: 0, expenses: 0, profit: 0 },
      "31": { income: 0, expenses: 0, profit: 0 },
    };

    const addToBucket = (dateStr: string, amt: number, isIncome: boolean) => {
      if (!dateStr) return;
      const txDayNum = parseInt(dateStr.split("-")[2] || "1", 10);
      let targetBucket = "01";
      if (txDayNum > 25) targetBucket = "31";
      else if (txDayNum > 21) targetBucket = "25";
      else if (txDayNum > 17) targetBucket = "21";
      else if (txDayNum > 13) targetBucket = "17";
      else if (txDayNum > 9) targetBucket = "13";
      else if (txDayNum > 5) targetBucket = "09";
      else if (txDayNum > 1) targetBucket = "05";

      if (isIncome) {
        daysMap[targetBucket].income += amt;
      } else {
        daysMap[targetBucket].expenses += amt;
      }
    };

    // Process general transactions
    transactions.forEach((tx) => {
      const amt = Number(tx.amount || 0);
      if (["income", "other_income", "student_fee", "client_payment", "product_sale"].includes(tx.type)) {
        addToBucket(tx.date, amt, true);
      } else if (["expense", "ad_spend", "shipping_cost", "platform_fee", "product_refund"].includes(tx.type)) {
        addToBucket(tx.date, amt, false);
      }
    });

    // Also plot orders not in transactions
    orders.forEach((o) => {
      if (!o.transaction_id && o.payment_status === "paid") {
        addToBucket(o.order_date, Number(o.total_revenue || 0), true);
        const orderCost = Number(o.total_cogs || 0) + Number(o.shipping_cost || 0) + Number(o.platform_fee || 0);
        if (orderCost > 0) {
          addToBucket(o.order_date, orderCost, false);
        }
      }
    });

    return Object.entries(daysMap).map(([day, val]) => ({
      day,
      income: val.income,
      expenses: val.expenses,
      profit: val.income - val.expenses,
    }));
  }, [transactions, orders]);

  // Dynamic Monthly Budget & Profit/Loss Analytics
  const monthlyAnalytics: PeriodBudgetAnalytics = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const endOfMonth = new Date(year, month + 1, 0);
    const startStr = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const endStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(endOfMonth.getDate()).padStart(2, "0")}`;
    const daysInMonth = endOfMonth.getDate();
    const currentDay = now.getDate();
    const daysRemaining = Math.max(1, daysInMonth - currentDay);

    const monthName = now.toLocaleString("default", { month: "long" });
    const title = `${monthName} ${year}`;

    const expenseTypes = ["expense", "ad_spend", "shipping_cost", "platform_fee", "product_refund", "owner_payment"];
    const incomeTypes = ["income", "other_income", "student_fee", "client_payment", "product_sale"];

    const monthTxs = transactions.filter((t) => {
      if (!t.date) return false;
      const d = t.date.split("T")[0];
      return d >= startStr && d <= endStr;
    });

    const monthExpenses = monthTxs.filter((t) => expenseTypes.includes(t.type));
    const monthIncomes = monthTxs.filter((t) => incomeTypes.includes(t.type));

    // Auto-cut from budget: sum of all expense transactions
    let spent = monthExpenses.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    orders.forEach((o) => {
      if (!o.transaction_id && o.payment_status === "paid" && o.order_date >= startStr && o.order_date <= endStr) {
        const orderCost = Number(o.total_cogs || 0) + Number(o.shipping_cost || 0) + Number(o.platform_fee || 0);
        spent += orderCost;
      }
    });

    // Total monthly inflow
    let income = monthIncomes.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    orders.forEach((o) => {
      if (!o.transaction_id && o.payment_status === "paid" && o.order_date >= startStr && o.order_date <= endStr) {
        income += Number(o.total_revenue || 0);
      }
    });

    const budget = budgetConfig.monthlyBudget;
    const remaining = budget - spent;
    const percentUsed = budget > 0 ? Math.min(100, Math.max(0, Math.round((spent / budget) * 1000) / 10)) : 0;
    const isOverBudget = spent > budget;
    const overBudgetAmount = Math.max(0, spent - budget);
    const netProfit = income - spent;
    const profitMargin = income > 0 ? Math.round((netProfit / income) * 1000) / 10 : 0;
    const isProfit = netProfit >= 0;
    const suggestedDailySpend = remaining > 0 ? Math.round(remaining / daysRemaining) : 0;

    // Daily breakdown for visual chart & trends
    const dailyMap: Record<string, { spent: number; income: number }> = {};
    for (let day = 1; day <= currentDay; day++) {
      const dStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      dailyMap[dStr] = { spent: 0, income: 0 };
    }
    monthExpenses.forEach((t) => {
      const d = t.date.split("T")[0];
      if (dailyMap[d]) dailyMap[d].spent += Number(t.amount) || 0;
    });
    monthIncomes.forEach((t) => {
      const d = t.date.split("T")[0];
      if (dailyMap[d]) dailyMap[d].income += Number(t.amount) || 0;
    });

    const dailySpending = Object.entries(dailyMap).map(([dStr, val]) => ({
      date: dStr,
      dayLabel: String(parseInt(dStr.split("-")[2], 10)),
      spent: val.spent,
      income: val.income,
    }));

    return {
      period: "month",
      title,
      startDateStr: startStr,
      endDateStr: endStr,
      budget,
      spent,
      remaining,
      percentUsed,
      isOverBudget,
      overBudgetAmount,
      income,
      netProfit,
      profitMargin,
      isProfit,
      transactionCount: monthTxs.length,
      expenseCount: monthExpenses.length,
      incomeCount: monthIncomes.length,
      expenses: monthExpenses,
      incomeTransactions: monthIncomes,
      daysRemaining,
      suggestedDailySpend,
      dailySpending,
    };
  }, [transactions, orders, budgetConfig.monthlyBudget]);

  // Dynamic Weekly Budget & Profit/Loss Analytics
  const weeklyAnalytics: PeriodBudgetAnalytics = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diffToMonday = (dayOfWeek + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - diffToMonday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const startStr = monday.toISOString().split("T")[0];
    const endStr = sunday.toISOString().split("T")[0];
    const daysRemaining = Math.max(1, 7 - diffToMonday);

    const title = `Week of ${monday.toLocaleDateString("default", { month: "short", day: "numeric" })} - ${sunday.toLocaleDateString("default", { month: "short", day: "numeric" })}`;

    const expenseTypes = ["expense", "ad_spend", "shipping_cost", "platform_fee", "product_refund", "owner_payment"];
    const incomeTypes = ["income", "other_income", "student_fee", "client_payment", "product_sale"];

    const weekTxs = transactions.filter((t) => {
      if (!t.date) return false;
      const d = t.date.split("T")[0];
      return d >= startStr && d <= endStr;
    });

    const weekExpenses = weekTxs.filter((t) => expenseTypes.includes(t.type));
    const weekIncomes = weekTxs.filter((t) => incomeTypes.includes(t.type));

    let spent = weekExpenses.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    orders.forEach((o) => {
      if (!o.transaction_id && o.payment_status === "paid" && o.order_date >= startStr && o.order_date <= endStr) {
        const orderCost = Number(o.total_cogs || 0) + Number(o.shipping_cost || 0) + Number(o.platform_fee || 0);
        spent += orderCost;
      }
    });

    let income = weekIncomes.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    orders.forEach((o) => {
      if (!o.transaction_id && o.payment_status === "paid" && o.order_date >= startStr && o.order_date <= endStr) {
        income += Number(o.total_revenue || 0);
      }
    });

    const budget = budgetConfig.weeklyBudget;
    const remaining = budget - spent;
    const percentUsed = budget > 0 ? Math.min(100, Math.max(0, Math.round((spent / budget) * 1000) / 10)) : 0;
    const isOverBudget = spent > budget;
    const overBudgetAmount = Math.max(0, spent - budget);
    const netProfit = income - spent;
    const profitMargin = income > 0 ? Math.round((netProfit / income) * 1000) / 10 : 0;
    const isProfit = netProfit >= 0;
    const suggestedDailySpend = remaining > 0 ? Math.round(remaining / daysRemaining) : 0;

    const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const dailySpending = dayLabels.map((label, idx) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + idx);
      const dStr = d.toISOString().split("T")[0];
      const daySpent = weekExpenses.filter((t) => t.date.split("T")[0] === dStr).reduce((s, t) => s + (Number(t.amount) || 0), 0);
      const dayIncome = weekIncomes.filter((t) => t.date.split("T")[0] === dStr).reduce((s, t) => s + (Number(t.amount) || 0), 0);
      return {
        date: dStr,
        dayLabel: label,
        spent: daySpent,
        income: dayIncome,
      };
    });

    return {
      period: "week",
      title,
      startDateStr: startStr,
      endDateStr: endStr,
      budget,
      spent,
      remaining,
      percentUsed,
      isOverBudget,
      overBudgetAmount,
      income,
      netProfit,
      profitMargin,
      isProfit,
      transactionCount: weekTxs.length,
      expenseCount: weekExpenses.length,
      incomeCount: weekIncomes.length,
      expenses: weekExpenses,
      incomeTransactions: weekIncomes,
      daysRemaining,
      suggestedDailySpend,
      dailySpending,
    };
  }, [transactions, orders, budgetConfig.weeklyBudget]);

  // Core Mutation Methods
  const addTransaction = (input: NewTransactionInput): Transaction => {
    const newTx: Transaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: "user_current",
      workspace_id: "workspace_1",
      type: input.type,
      amount: Number(input.amount),
      description: input.description.trim(),
      category: input.category?.trim() || null,
      date: input.date,
      payment_method: input.payment_method,
      notes: input.notes?.trim() || null,
      reference_id: input.reference_id || null,
      reference_type: input.reference_type || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setTransactions((prev) => [newTx, ...prev]);

    if (input.type === "expense") {
      const exp: Expense = {
        id: `exp_${newTx.id}`,
        user_id: "user_current",
        workspace_id: "workspace_1",
        category: input.category || "General",
        description: input.description,
        amount: Number(input.amount),
        date: input.date,
        payment_method: input.payment_method,
        notes: input.notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setExpenses((prev) => [exp, ...prev]);
    } else if (input.type === "owner_payment") {
      const op: OwnerPayment = {
        id: `own_pay_${newTx.id}`,
        owner_id: "owner_1",
        recipient_name: input.notes?.startsWith("Recipient: ")
          ? input.notes.replace("Recipient: ", "").split(",")[0].trim()
          : input.description.replace(/^owner payment\s*(-|to)?\s*/i, "").trim() || "Tayyab",
        transaction_id: newTx.id,
        amount: Number(input.amount),
        date: input.date,
        payment_method: input.payment_method,
        notes: input.notes || input.description,
        created_at: new Date().toISOString(),
      };
      setOwnerPayments((prev) => [op, ...prev]);
    } else if (input.type === "loan_received" && !input.reference_id) {
      const lenderName =
        input.notes?.startsWith("Lender: ")
          ? input.notes.replace("Lender: ", "").split(",")[0].trim()
          : input.description.replace(/^loan received\s*(-|from)?\s*/i, "").trim() || "Lender";
      const ln: Loan = {
        id: `loan_${newTx.id}`,
        user_id: "user_current",
        workspace_id: "workspace_1",
        lender: lenderName,
        principal_amount: Number(input.amount),
        remaining_amount: Number(input.amount),
        interest_rate: null,
        due_date: null,
        status: "active",
        reason: input.description,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setLoans((prev) => [ln, ...prev]);
    } else if (input.type === "loan_repayment" && input.reference_id) {
      setLoans((prev) =>
        prev.map((l) => {
          if (l.id === input.reference_id) {
            const newRemaining = Math.max(0, Number(l.remaining_amount) - Number(input.amount));
            return {
              ...l,
              remaining_amount: newRemaining,
              status: newRemaining === 0 ? "paid" : "active",
              updated_at: new Date().toISOString(),
            };
          }
          return l;
        })
      );
    }

    toast.success(`Transaction added: Rs. ${Number(input.amount).toLocaleString()}`);
    return newTx;
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    toast.info("Transaction deleted");
  };

  const addStudent = (input: NewStudentInput): Student => {
    const student: Student = {
      id: `std_${Date.now()}`,
      user_id: "user_current",
      workspace_id: "workspace_1",
      name: input.name.trim(),
      email: input.email?.trim() || null,
      phone: input.phone?.trim() || null,
      course: input.course?.trim() || null,
      total_fee: Number(input.total_fee || 0),
      received_amount: Number(input.received_amount || 0),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setStudents((prev) => [student, ...prev]);
    toast.success(`Student enrolled: ${student.name}`);
    return student;
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates, updated_at: new Date().toISOString() } : s))
    );
  };

  const deleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    toast.info("Student removed");
  };

  const addClient = (input: NewClientInput): Client => {
    const client: Client = {
      id: `cli_${Date.now()}`,
      user_id: "user_current",
      workspace_id: "workspace_1",
      name: input.name.trim(),
      email: input.email?.trim() || null,
      phone: input.phone?.trim() || null,
      company: input.company?.trim() || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setClients((prev) => [client, ...prev]);
    toast.success(`Client added: ${client.name}`);
    return client;
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates, updated_at: new Date().toISOString() } : c))
    );
  };

  const deleteClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
    toast.info("Client removed");
  };

  const addProject = (input: NewProjectInput): Project => {
    const project: Project = {
      id: `prj_${Date.now()}`,
      client_id: input.client_id || "cli_general",
      user_id: "user_current",
      workspace_id: "workspace_1",
      name: input.name.trim(),
      description: input.description?.trim() || null,
      total_amount: Number(input.total_amount || 0),
      received_amount: Number(input.received_amount || 0),
      status: input.status || "active",
      start_date: input.start_date || new Date().toISOString().split("T")[0],
      end_date: input.end_date || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setProjects((prev) => [project, ...prev]);
    toast.success(`Project created: ${project.name}`);
    return project;
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p))
    );
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    toast.info("Project removed");
  };

  const addExpense = (input: NewExpenseInput): Expense => {
    const exp: Expense = {
      id: `exp_${Date.now()}`,
      user_id: "user_current",
      workspace_id: "workspace_1",
      category: input.category.trim(),
      description: input.description.trim(),
      amount: Number(input.amount || 0),
      date: input.date,
      payment_method: input.payment_method,
      notes: input.notes?.trim() || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setExpenses((prev) => [exp, ...prev]);

    // Also add to transactions ledger
    const tx: Transaction = {
      id: `tx_${exp.id}`,
      user_id: "user_current",
      workspace_id: "workspace_1",
      type: "expense",
      amount: exp.amount,
      description: exp.description,
      category: exp.category,
      date: exp.date,
      payment_method: exp.payment_method,
      notes: exp.notes,
      reference_id: exp.id,
      reference_type: "expense",
      created_at: exp.created_at,
      updated_at: exp.updated_at,
    };
    setTransactions((prev) => [tx, ...prev]);
    toast.success(`Expense recorded: Rs. ${exp.amount.toLocaleString()}`);
    return exp;
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    setTransactions((prev) => prev.filter((t) => t.reference_id !== id && t.id !== `tx_${id}`));
    toast.info("Expense removed");
  };

  const addLoan = (input: NewLoanInput): Loan => {
    const loan: Loan = {
      id: `loan_${Date.now()}`,
      user_id: "user_current",
      workspace_id: "workspace_1",
      lender: input.lender.trim(),
      principal_amount: Number(input.principal_amount || 0),
      remaining_amount:
        input.remaining_amount !== undefined
          ? Number(input.remaining_amount)
          : Number(input.principal_amount || 0),
      interest_rate: input.interest_rate !== undefined ? Number(input.interest_rate) : null,
      due_date: input.due_date || null,
      status: input.status || "active",
      reason: input.reason?.trim() || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setLoans((prev) => [loan, ...prev]);
    toast.success(`Loan / Qarza record added: ${loan.lender}`);
    return loan;
  };

  const updateLoan = (id: string, updates: Partial<Loan>) => {
    setLoans((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updates, updated_at: new Date().toISOString() } : l))
    );
  };

  const deleteLoan = (id: string) => {
    setLoans((prev) => prev.filter((l) => l.id !== id));
    toast.info("Loan record deleted");
  };

  const addOwnerPayment = (input: NewOwnerPaymentInput): OwnerPayment => {
    const op: OwnerPayment = {
      id: `own_pay_${Date.now()}`,
      owner_id: input.owner_id || "owner_1",
      recipient_name: input.recipient_name?.trim() || "Tayyab",
      transaction_id: `tx_own_${Date.now()}`,
      amount: Number(input.amount || 0),
      date: input.date,
      payment_method: input.payment_method,
      notes: input.notes?.trim() || null,
      created_at: new Date().toISOString(),
    };
    setOwnerPayments((prev) => [op, ...prev]);

    // Also record transaction
    const tx: Transaction = {
      id: op.transaction_id,
      user_id: "user_current",
      workspace_id: "workspace_1",
      type: "owner_payment",
      amount: op.amount,
      description: `Owner Payment - ${op.recipient_name}`,
      category: "Owner Drawings",
      date: op.date,
      payment_method: op.payment_method,
      notes: op.notes,
      reference_id: op.id,
      reference_type: "owner_payment",
      created_at: op.created_at,
      updated_at: op.created_at,
    };
    setTransactions((prev) => [tx, ...prev]);
    toast.success(`Owner payment recorded: Rs. ${op.amount.toLocaleString()}`);
    return op;
  };

  const deleteOwnerPayment = (id: string) => {
    setOwnerPayments((prev) => prev.filter((o) => o.id !== id));
    setTransactions((prev) => prev.filter((t) => t.reference_id !== id && t.id !== `tx_own_${id}`));
    toast.info("Owner payment removed");
  };

  // ==========================================
  // SALES & BUSINESS MUTATION METHODS
  // ==========================================

  const addProduct = (input: NewProductInput): Product => {
    const newProduct: Product = {
      id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user_id: "user_current",
      workspace_id: "workspace_1",
      name: input.name.trim(),
      type: input.type,
      sku: input.sku.trim().toUpperCase(),
      category: input.category?.trim() || "General",
      selling_price: Number(input.selling_price || 0),
      cost_price: Number(input.cost_price || 0),
      platform: input.platform || "direct",
      stock_quantity: input.type === "physical" ? Number(input.stock_quantity || 0) : 0,
      low_stock_threshold: input.type === "physical" ? Number(input.low_stock_threshold ?? 5) : 0,
      image_url: input.image_url || null,
      status: input.status || "active",
      description: input.description?.trim() || null,
      notes: input.notes?.trim() || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setProducts((prev) => [newProduct, ...prev]);

    // If initial stock is provided for a physical product, log initial movement
    if (newProduct.type === "physical" && newProduct.stock_quantity > 0) {
      const initMovement: InventoryMovement = {
        id: `inv_${Date.now()}`,
        user_id: "user_current",
        product_id: newProduct.id,
        product_name: newProduct.name,
        quantity: newProduct.stock_quantity,
        previous_stock: 0,
        new_stock: newProduct.stock_quantity,
        type: "stock_added",
        date: new Date().toISOString().split("T")[0],
        reason: "Initial catalog stock registration",
        created_at: new Date().toISOString(),
      };
      setInventoryMovements((prev) => [initMovement, ...prev]);
    }

    toast.success(`Product created: ${newProduct.name}`);
    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = { ...p, ...updates, updated_at: new Date().toISOString() };
          return updated;
        }
        return p;
      })
    );
    toast.success("Product updated successfully");
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    toast.info("Product removed from catalog");
  };

  const duplicateProduct = (id: string): Product | null => {
    const existing = products.find((p) => p.id === id);
    if (!existing) return null;

    const dup: Product = {
      ...existing,
      id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: `${existing.name} (Copy)`,
      sku: `${existing.sku}-COPY`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setProducts((prev) => [dup, ...prev]);
    toast.success(`Duplicated product: ${dup.name}`);
    return dup;
  };

  const addCustomer = (input: NewCustomerInput): Customer => {
    const customer: Customer = {
      id: `cust_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user_id: "user_current",
      workspace_id: "workspace_1",
      name: input.name.trim(),
      email: input.email?.trim() || null,
      phone: input.phone?.trim() || null,
      whatsapp: input.whatsapp?.trim() || null,
      country: input.country?.trim() || "Pakistan",
      address: input.address?.trim() || null,
      notes: input.notes?.trim() || null,
      status: input.status || "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setCustomers((prev) => [customer, ...prev]);
    toast.success(`Customer registered: ${customer.name}`);
    return customer;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates, updated_at: new Date().toISOString() } : c))
    );
    toast.success("Customer profile updated");
  };

  const deleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    toast.info("Customer removed");
  };

  const addOrder = (input: NewOrderInput): Order => {
    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const orderNumber = input.order_number || `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

    const items: OrderItem[] = input.items.map((item, idx) => ({
      id: `item_${orderId}_${idx}`,
      order_id: orderId,
      product_id: item.product_id,
      product_name: item.product_name,
      product_sku: item.product_sku,
      product_type: item.product_type,
      unit_price: Number(item.unit_price || 0),
      unit_cost: Number(item.unit_cost || 0),
      quantity: Number(item.quantity || 1),
      total_price: Number(item.unit_price || 0) * Number(item.quantity || 1),
      total_cost: Number(item.unit_cost || 0) * Number(item.quantity || 1),
      notes: item.notes || null,
    }));

    const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
    const discount = Number(input.discount || 0);
    const shipping_cost = Number(input.shipping_cost || 0);
    const packaging_cost = Number(input.packaging_cost || 0);
    const platform_fee = Number(input.platform_fee || 0);
    const payment_fee = Number(input.payment_fee || 0);
    const ad_cost = Number(input.ad_cost || 0);

    const total_revenue = Math.max(0, subtotal - discount + shipping_cost);
    const total_cogs = items.reduce((sum, item) => sum + item.total_cost, 0);
    const actual_profit =
      total_revenue - total_cogs - shipping_cost - packaging_cost - platform_fee - payment_fee - ad_cost;

    const txId = `tx_ord_${orderId}`;

    const newOrder: Order = {
      id: orderId,
      user_id: "user_current",
      workspace_id: "workspace_1",
      order_number: orderNumber,
      customer_id: input.customer_id || null,
      customer_name: input.customer_name.trim(),
      customer_email: input.customer_email?.trim() || null,
      customer_phone: input.customer_phone?.trim() || null,
      order_date: input.order_date,
      order_status: input.order_status || "delivered",
      payment_status: input.payment_status || "paid",
      payment_method: input.payment_method,
      platform: input.platform || "direct",
      ad_campaign_id: input.ad_campaign_id || null,
      source: input.source || null,
      items,
      subtotal,
      discount,
      shipping_cost,
      packaging_cost,
      platform_fee,
      payment_fee,
      ad_cost,
      total_revenue,
      total_cogs,
      actual_profit,
      notes: input.notes?.trim() || null,
      transaction_id: txId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);

    // 1. Deduct inventory for physical items and log movements
    items.forEach((item) => {
      if (item.product_type === "physical") {
        setProducts((prev) =>
          prev.map((p) => {
            if (p.id === item.product_id) {
              const previousStock = p.stock_quantity;
              const newStock = Math.max(0, previousStock - item.quantity);

              const move: InventoryMovement = {
                id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                user_id: "user_current",
                product_id: p.id,
                product_name: p.name,
                quantity: -item.quantity,
                previous_stock: previousStock,
                new_stock: newStock,
                type: "sale",
                date: newOrder.order_date,
                reason: `Order fulfillment #${newOrder.order_number}`,
                reference_id: newOrder.id,
                reference_type: "order",
                created_at: new Date().toISOString(),
              };
              setInventoryMovements((mPrev) => [move, ...mPrev]);

              return { ...p, stock_quantity: newStock, updated_at: new Date().toISOString() };
            }
            return p;
          })
        );
      }
    });

    // 2. Add Transaction to FinTrack Ledger
    if (newOrder.payment_status === "paid" || newOrder.payment_status === "partially_paid") {
      const saleTx: Transaction = {
        id: txId,
        user_id: "user_current",
        workspace_id: "workspace_1",
        type: "product_sale",
        amount: total_revenue,
        description: `Sale: Order #${orderNumber} (${newOrder.customer_name})`,
        category: "Product Sales",
        date: newOrder.order_date,
        payment_method: newOrder.payment_method,
        notes: `Order #${orderNumber} | Platform: ${newOrder.platform} | Items: ${items.map((i) => `${i.product_name} (x${i.quantity})`).join(", ")}`,
        reference_id: newOrder.id,
        reference_type: "order",
        created_at: newOrder.created_at,
        updated_at: newOrder.updated_at,
      };
      setTransactions((prev) => [saleTx, ...prev]);
    }

    // 3. Update Ad Campaign metrics if order is attributed
    if (newOrder.ad_campaign_id) {
      setAdCampaigns((prev) =>
        prev.map((c) => {
          if (c.id === newOrder.ad_campaign_id) {
            return {
              ...c,
              orders_count: (c.orders_count || 0) + 1,
              conversions: (c.conversions || 0) + 1,
              attributed_revenue: (c.attributed_revenue || 0) + total_revenue,
              updated_at: new Date().toISOString(),
            };
          }
          return c;
        })
      );
    }

    // 4. Auto-register or update customer if new
    if (newOrder.customer_name) {
      setCustomers((prev) => {
        const exists = prev.find(
          (c) =>
            (c.email && c.email.toLowerCase() === newOrder.customer_email?.toLowerCase()) ||
            (c.phone && c.phone === newOrder.customer_phone) ||
            c.name.toLowerCase() === newOrder.customer_name.toLowerCase()
        );
        if (!exists) {
          const autoCust: Customer = {
            id: `cust_${Date.now()}`,
            user_id: "user_current",
            workspace_id: "workspace_1",
            name: newOrder.customer_name,
            email: newOrder.customer_email || null,
            phone: newOrder.customer_phone || null,
            status: "active",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          return [autoCust, ...prev];
        }
        return prev;
      });
    }

    toast.success(`Order created #${orderNumber} (Rs. ${total_revenue.toLocaleString()})`);
    return newOrder;
  };

  const updateOrder = (id: string, updates: Partial<Order>) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...updates, updated_at: new Date().toISOString() } : o))
    );
    toast.success("Order details updated");
  };

  const deleteOrder = (id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
    setTransactions((prev) => prev.filter((t) => t.reference_id !== id && t.id !== `tx_ord_${id}`));
    toast.info("Order deleted");
  };

  const addInventoryMovement = (input: NewInventoryMovementInput): InventoryMovement => {
    let targetProduct = products.find((p) => p.id === input.product_id);
    const prevStock = targetProduct ? targetProduct.stock_quantity : 0;
    const newStock = Math.max(0, prevStock + input.quantity);

    const movement: InventoryMovement = {
      id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user_id: "user_current",
      product_id: input.product_id,
      product_name: input.product_name,
      quantity: input.quantity,
      previous_stock: prevStock,
      new_stock: newStock,
      type: input.type,
      date: input.date,
      reason: input.reason.trim(),
      reference_id: input.reference_id || null,
      reference_type: input.reference_type || null,
      notes: input.notes?.trim() || null,
      created_at: new Date().toISOString(),
    };

    setInventoryMovements((prev) => [movement, ...prev]);

    // Update physical product stock
    setProducts((prev) =>
      prev.map((p) => (p.id === input.product_id ? { ...p, stock_quantity: newStock, updated_at: new Date().toISOString() } : p))
    );

    toast.success(`Stock adjusted: ${movement.product_name} (${movement.quantity > 0 ? `+${movement.quantity}` : movement.quantity})`);
    return movement;
  };

  const addAdCampaign = (input: NewAdCampaignInput): AdCampaign => {
    const campaignId = `ad_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const expenseId = `exp_ad_${campaignId}`;

    const campaign: AdCampaign = {
      id: campaignId,
      user_id: "user_current",
      workspace_id: "workspace_1",
      name: input.name.trim(),
      platform: input.platform,
      product_id: input.product_id || null,
      product_ids: input.product_ids || (input.product_id ? [input.product_id] : []),
      objective: input.objective?.trim() || "Conversions",
      start_date: input.start_date,
      end_date: input.end_date || null,
      budget: Number(input.budget || 0),
      actual_spend: Number(input.actual_spend || 0),
      impressions: Number(input.impressions || 0),
      reach: Number(input.reach || 0),
      clicks: Number(input.clicks || 0),
      conversions: Number(input.conversions || 0),
      orders_count: Number(input.orders_count || 0),
      attributed_revenue: Number(input.attributed_revenue || 0),
      status: input.status || "active",
      notes: input.notes?.trim() || null,
      expense_id: input.syncToExpenses !== false ? expenseId : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setAdCampaigns((prev) => [campaign, ...prev]);

    // Auto-sync to FinTrack Expenses & Ledger
    if (input.syncToExpenses !== false && campaign.actual_spend > 0) {
      const exp: Expense = {
        id: expenseId,
        user_id: "user_current",
        workspace_id: "workspace_1",
        category: "Advertising & Marketing",
        description: `Ad Campaign: ${campaign.name} (${campaign.platform.toUpperCase()})`,
        amount: campaign.actual_spend,
        date: campaign.start_date,
        payment_method: "card",
        notes: `Marketing spend for ${campaign.name}. Platform: ${campaign.platform}`,
        created_at: campaign.created_at,
        updated_at: campaign.updated_at,
      };
      setExpenses((prev) => [exp, ...prev]);

      const tx: Transaction = {
        id: `tx_${expenseId}`,
        user_id: "user_current",
        workspace_id: "workspace_1",
        type: "ad_spend",
        amount: campaign.actual_spend,
        description: `Ad Spend: ${campaign.name}`,
        category: "Advertising & Marketing",
        date: campaign.start_date,
        payment_method: "card",
        notes: `Campaign: ${campaign.name} | Budget: Rs. ${campaign.budget.toLocaleString()}`,
        reference_id: campaign.id,
        reference_type: "ad_campaign",
        created_at: campaign.created_at,
        updated_at: campaign.updated_at,
      };
      setTransactions((prev) => [tx, ...prev]);
    }

    toast.success(`Ad Campaign logged: ${campaign.name}`);
    return campaign;
  };

  const updateAdCampaign = (id: string, updates: Partial<AdCampaign>) => {
    setAdCampaigns((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const updated = { ...c, ...updates, updated_at: new Date().toISOString() };
          // If spend was updated, sync matching expense
          if (updates.actual_spend !== undefined && c.expense_id) {
            setExpenses((ePrev) =>
              ePrev.map((e) => (e.id === c.expense_id ? { ...e, amount: Number(updates.actual_spend) } : e))
            );
            setTransactions((tPrev) =>
              tPrev.map((t) => (t.reference_id === id ? { ...t, amount: Number(updates.actual_spend) } : t))
            );
          }
          return updated;
        }
        return c;
      })
    );
    toast.success("Campaign metrics updated");
  };

  const deleteAdCampaign = (id: string) => {
    setAdCampaigns((prev) => prev.filter((c) => c.id !== id));
    setExpenses((prev) => prev.filter((e) => e.id !== `exp_ad_${id}`));
    setTransactions((prev) => prev.filter((t) => t.reference_id !== id));
    toast.info("Campaign removed");
  };

  const processReturn = (input: NewProductReturnInput): ProductReturn => {
    const returnRecord: ProductReturn = {
      id: `ret_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user_id: "user_current",
      order_id: input.order_id,
      order_number: input.order_number,
      customer_name: input.customer_name,
      product_id: input.product_id,
      product_name: input.product_name,
      quantity: Number(input.quantity || 1),
      refund_amount: Number(input.refund_amount || 0),
      refund_date: input.refund_date,
      reason: input.reason.trim(),
      restock_inventory: input.restock_inventory,
      return_shipping_cost: Number(input.return_shipping_cost || 0),
      notes: input.notes?.trim() || null,
      created_at: new Date().toISOString(),
    };

    setProductReturns((prev) => [returnRecord, ...prev]);

    // 1. Restock physical product if chosen
    if (input.restock_inventory) {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === input.product_id && p.type === "physical") {
            const prevStock = p.stock_quantity;
            const newStock = prevStock + returnRecord.quantity;

            const move: InventoryMovement = {
              id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              user_id: "user_current",
              product_id: p.id,
              product_name: p.name,
              quantity: returnRecord.quantity,
              previous_stock: prevStock,
              new_stock: newStock,
              type: "return",
              date: returnRecord.refund_date,
              reason: `Customer Return #${returnRecord.order_number} (${returnRecord.reason})`,
              reference_id: returnRecord.id,
              reference_type: "return",
              created_at: new Date().toISOString(),
            };
            setInventoryMovements((mPrev) => [move, ...mPrev]);

            return { ...p, stock_quantity: newStock, updated_at: new Date().toISOString() };
          }
          return p;
        })
      );
    }

    // 2. Update order status
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === input.order_id) {
          return {
            ...o,
            order_status: "returned",
            payment_status: "refunded",
            actual_profit: o.actual_profit - returnRecord.refund_amount - (returnRecord.return_shipping_cost || 0),
            updated_at: new Date().toISOString(),
          };
        }
        return o;
      })
    );

    // 3. Record refund transaction in FinTrack Ledger
    if (returnRecord.refund_amount > 0) {
      const refTx: Transaction = {
        id: `tx_ref_${returnRecord.id}`,
        user_id: "user_current",
        workspace_id: "workspace_1",
        type: "product_refund",
        amount: returnRecord.refund_amount,
        description: `Refund: Order #${returnRecord.order_number} (${returnRecord.product_name})`,
        category: "Product Refunds",
        date: returnRecord.refund_date,
        payment_method: "bank_transfer",
        notes: `Customer return reason: ${returnRecord.reason}`,
        reference_id: returnRecord.id,
        reference_type: "return",
        created_at: returnRecord.created_at,
        updated_at: returnRecord.created_at,
      };
      setTransactions((prev) => [refTx, ...prev]);
    }

    toast.success(`Processed return for Order #${returnRecord.order_number} (Rs. ${returnRecord.refund_amount.toLocaleString()})`);
    return returnRecord;
  };

  // Restore & Reset Database
  const restoreDatabase = (
    data: {
      transactions?: Transaction[];
      students?: Student[];
      clients?: Client[];
      projects?: Project[];
      expenses?: Expense[];
      loans?: Loan[];
      ownerPayments?: OwnerPayment[];
      products?: Product[];
      customers?: Customer[];
      orders?: Order[];
      inventoryMovements?: InventoryMovement[];
      adCampaigns?: AdCampaign[];
      productReturns?: ProductReturn[];
    },
    mode: "replace" | "merge" = "replace"
  ) => {
    let totalCount = 0;

    if (mode === "replace") {
      const newTx = data.transactions || [];
      const newSt = data.students || [];
      const newCl = data.clients || [];
      const newPr = data.projects || [];
      const newEx = data.expenses || [];
      const newLn = data.loans || [];
      const newOp = data.ownerPayments || [];
      const newProd = data.products || [];
      const newCust = data.customers || [];
      const newOrd = data.orders || [];
      const newInv = data.inventoryMovements || [];
      const newAd = data.adCampaigns || [];
      const newRet = data.productReturns || [];

      setTransactions(newTx);
      setStudents(newSt);
      setClients(newCl);
      setProjects(newPr);
      setExpenses(newEx);
      setLoans(newLn);
      setOwnerPayments(newOp);
      setProducts(newProd);
      setCustomers(newCust);
      setOrders(newOrd);
      setInventoryMovements(newInv);
      setAdCampaigns(newAd);
      setProductReturns(newRet);

      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(newTx));
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(newSt));
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(newCl));
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(newPr));
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(newEx));
      localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(newLn));
      localStorage.setItem(STORAGE_KEYS.OWNER_PAYMENTS, JSON.stringify(newOp));
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(newProd));
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(newCust));
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(newOrd));
      localStorage.setItem(STORAGE_KEYS.INVENTORY_MOVEMENTS, JSON.stringify(newInv));
      localStorage.setItem(STORAGE_KEYS.AD_CAMPAIGNS, JSON.stringify(newAd));
      localStorage.setItem(STORAGE_KEYS.PRODUCT_RETURNS, JSON.stringify(newRet));

      totalCount =
        newTx.length +
        newSt.length +
        newCl.length +
        newPr.length +
        newEx.length +
        newLn.length +
        newOp.length +
        newProd.length +
        newCust.length +
        newOrd.length +
        newInv.length +
        newAd.length +
        newRet.length;

      toast.success(`Successfully restored ${totalCount} records from backup!`);
    } else {
      // Merge mode
      if (data.transactions && data.transactions.length > 0) {
        setTransactions((prev) => {
          const map = new Map(prev.map((i) => [i.id, i]));
          data.transactions!.forEach((i) => map.set(i.id, i));
          const updated = Array.from(map.values());
          localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updated));
          return updated;
        });
        totalCount += data.transactions.length;
      }
      if (data.products && data.products.length > 0) {
        setProducts((prev) => {
          const map = new Map(prev.map((i) => [i.id, i]));
          data.products!.forEach((i) => map.set(i.id, i));
          const updated = Array.from(map.values());
          localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
          return updated;
        });
        totalCount += data.products.length;
      }
      if (data.orders && data.orders.length > 0) {
        setOrders((prev) => {
          const map = new Map(prev.map((i) => [i.id, i]));
          data.orders!.forEach((i) => map.set(i.id, i));
          const updated = Array.from(map.values());
          localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));
          return updated;
        });
        totalCount += data.orders.length;
      }
      if (data.adCampaigns && data.adCampaigns.length > 0) {
        setAdCampaigns((prev) => {
          const map = new Map(prev.map((i) => [i.id, i]));
          data.adCampaigns!.forEach((i) => map.set(i.id, i));
          const updated = Array.from(map.values());
          localStorage.setItem(STORAGE_KEYS.AD_CAMPAIGNS, JSON.stringify(updated));
          return updated;
        });
        totalCount += data.adCampaigns.length;
      }
      if (data.customers && data.customers.length > 0) {
        setCustomers((prev) => {
          const map = new Map(prev.map((i) => [i.id, i]));
          data.customers!.forEach((i) => map.set(i.id, i));
          const updated = Array.from(map.values());
          localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(updated));
          return updated;
        });
        totalCount += data.customers.length;
      }
      toast.success(`Successfully merged ${totalCount} records into workspace!`);
    }

    return { total: totalCount };
  };

  const clearAllData = () => {
    setTransactions([]);
    setStudents([]);
    setClients([]);
    setProjects([]);
    setExpenses([]);
    setLoans([]);
    setOwnerPayments([]);
    setProducts([]);
    setCustomers([]);
    setOrders([]);
    setInventoryMovements([]);
    setAdCampaigns([]);
    setProductReturns([]);

    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.STUDENTS);
    localStorage.removeItem(STORAGE_KEYS.CLIENTS);
    localStorage.removeItem(STORAGE_KEYS.PROJECTS);
    localStorage.removeItem(STORAGE_KEYS.EXPENSES);
    localStorage.removeItem(STORAGE_KEYS.LOANS);
    localStorage.removeItem(STORAGE_KEYS.OWNER_PAYMENTS);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.INVENTORY_MOVEMENTS);
    localStorage.removeItem(STORAGE_KEYS.AD_CAMPAIGNS);
    localStorage.removeItem(STORAGE_KEYS.PRODUCT_RETURNS);

    toast.info("Workspace data reset");
  };

  return (
    <FinancialDataContext.Provider
      value={{
        transactions,
        students,
        clients,
        projects,
        expenses,
        loans,
        ownerPayments,
        owners,
        products,
        customers,
        orders,
        inventoryMovements,
        adCampaigns,
        productReturns,
        totalIncome,
        totalExpenses,
        netProfit,
        receivables,
        payables,
        outstandingLoans,
        chartData,
        salesMetrics,
        monthlyBudget: budgetConfig.monthlyBudget,
        weeklyBudget: budgetConfig.weeklyBudget,
        setMonthlyBudget,
        setWeeklyBudget,
        monthlyAnalytics,
        weeklyAnalytics,
        addTransaction,
        deleteTransaction,
        addStudent,
        updateStudent,
        deleteStudent,
        addClient,
        updateClient,
        deleteClient,
        addProject,
        updateProject,
        deleteProject,
        addExpense,
        deleteExpense,
        addLoan,
        updateLoan,
        deleteLoan,
        addOwnerPayment,
        deleteOwnerPayment,
        addProduct,
        updateProduct,
        deleteProduct,
        duplicateProduct,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addOrder,
        updateOrder,
        deleteOrder,
        addInventoryMovement,
        addAdCampaign,
        updateAdCampaign,
        deleteAdCampaign,
        processReturn,
        clearAllData,
        restoreDatabase,
      }}
    >
      {children}
    </FinancialDataContext.Provider>
  );
}

export function useFinancialData() {
  const context = useContext(FinancialDataContext);
  if (!context) {
    throw new Error("useFinancialData must be used within FinancialDataProvider");
  }
  return context;
}
