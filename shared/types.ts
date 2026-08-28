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
  | "other_income"
  | "product_sale"
  | "ad_spend"
  | "shipping_cost"
  | "platform_fee"
  | "product_refund";

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
  recipient_name?: string | null;
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

// ==========================================
// SALES & BUSINESS MODULE
// ==========================================

export type ProductType = "physical" | "digital";
export type ProductPlatform =
  | "shopify"
  | "woocommerce"
  | "etsy"
  | "gumroad"
  | "amazon"
  | "daraz"
  | "direct"
  | "other";
export type ProductStatus = "active" | "draft" | "archived";

export interface Product {
  id: string;
  user_id: string;
  workspace_id: string | null;
  name: string;
  type: ProductType;
  sku: string;
  category: string;
  selling_price: number;
  cost_price: number;
  platform: ProductPlatform;
  stock_quantity: number; // 0 for digital
  low_stock_threshold: number;
  image_url?: string | null;
  status: ProductStatus;
  description?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export type CustomerStatus = "new" | "active" | "returning" | "vip" | "inactive";

export interface Customer {
  id: string;
  user_id: string;
  workspace_id: string | null;
  name: string;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  city?: string | null;
  country?: string | null;
  address?: string | null;
  notes?: string | null;
  status: CustomerStatus;
  created_at: string;
  updated_at: string;
}

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";

export type OrderPaymentStatus =
  | "pending"
  | "paid"
  | "partially_paid"
  | "refunded";

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_sku: string;
  product_type: ProductType;
  unit_price: number;
  unit_cost: number;
  quantity: number;
  total_price: number;
  total_cost: number;
  notes?: string | null;
}

export interface Order {
  id: string;
  user_id: string;
  workspace_id: string | null;
  order_number: string;
  customer_id?: string | null;
  customer_name: string;
  customer_email?: string | null;
  customer_phone?: string | null;
  order_date: string;
  order_status: OrderStatus;
  payment_status: OrderPaymentStatus;
  payment_method: PaymentMethod;
  platform: ProductPlatform;
  ad_campaign_id?: string | null;
  source?: string | null;

  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping_cost: number;
  packaging_cost: number;
  platform_fee: number;
  payment_fee: number;
  ad_cost: number;

  total_revenue: number; // (subtotal - discount + shipping_cost)
  total_cogs: number;    // sum of (unit_cost * quantity)
  actual_profit: number; // total_revenue - total_cogs - shipping_cost - packaging_cost - platform_fee - payment_fee - ad_cost

  notes?: string | null;
  transaction_id?: string | null;
  created_at: string;
  updated_at: string;
}

export type InventoryMovementType =
  | "stock_added"
  | "sale"
  | "return"
  | "damaged"
  | "adjustment";

export interface InventoryMovement {
  id: string;
  user_id: string;
  product_id: string;
  product_name: string;
  quantity: number; // positive (added/returned) or negative (sold/damaged)
  previous_stock: number;
  new_stock: number;
  type: InventoryMovementType;
  date: string;
  reason: string;
  reference_id?: string | null;
  reference_type?: string | null;
  notes?: string | null;
  created_at: string;
}

export type AdPlatform =
  | "meta"
  | "facebook"
  | "instagram"
  | "tiktok"
  | "google"
  | "pinterest"
  | "other";

export type AdCampaignStatus = "draft" | "active" | "paused" | "completed";

export interface AdCampaign {
  id: string;
  user_id: string;
  workspace_id: string | null;
  name: string;
  platform: AdPlatform;
  product_id?: string | null;
  product_ids?: string[];
  objective: string;
  start_date: string;
  end_date?: string | null;
  budget: number;
  actual_spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  conversions: number;
  orders_count: number;
  attributed_revenue: number;
  status: AdCampaignStatus;
  notes?: string | null;
  expense_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductReturn {
  id: string;
  user_id: string;
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
  return_shipping_cost: number;
  notes?: string | null;
  created_at: string;
}