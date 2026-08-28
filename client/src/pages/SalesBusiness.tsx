import { useState, useMemo } from "react";
import {
  ShoppingBag,
  Package,
  Layers,
  Megaphone,
  Boxes,
  Users,
  RotateCcw,
  TrendingUp,
  Plus,
  Search,
  Trash2,
  Edit2,
  Eye,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  DollarSign,
  ArrowUpRight,
  TrendingDown,
  Filter,
  BarChart3,
  Receipt,
  FileSpreadsheet,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFinancialData } from "@/contexts/FinancialDataContext";
import { LedgerIllustration } from "@/components/LedgerIllustration";
import { AddProductModal } from "@/components/sales/AddProductModal";
import { AddOrderModal } from "@/components/sales/AddOrderModal";
import { AddCampaignModal } from "@/components/sales/AddCampaignModal";
import { AddCustomerModal } from "@/components/sales/AddCustomerModal";
import { AdjustInventoryModal } from "@/components/sales/AdjustInventoryModal";
import { ProcessReturnModal } from "@/components/sales/ProcessReturnModal";
import { OrderInvoiceModal } from "@/components/sales/OrderInvoiceModal";
import type {
  Product,
  Order,
  Customer,
  AdCampaign,
  ProductPlatform,
  OrderStatus,
  ProductType,
} from "@shared/types";

type TabKey = "overview" | "products" | "orders" | "inventory" | "customers" | "campaigns" | "returns";

export default function SalesBusiness() {
  const {
    products,
    orders,
    customers,
    inventoryMovements,
    adCampaigns,
    productReturns,
    deleteProduct,
    deleteOrder,
    deleteCustomer,
    deleteAdCampaign,
    salesMetrics,
  } = useFinancialData();

  const totalSalesRevenue = salesMetrics.totalRevenue;
  const totalSalesCogs = salesMetrics.totalCOGS;
  const totalSalesProfit = salesMetrics.actualProfit;
  const totalAdSpend = salesMetrics.totalAdSpend;
  const salesRoas = salesMetrics.blendedROAS;
  const totalPhysicalUnitsSold = salesMetrics.totalUnitsSold;
  const totalReturnsAmount = salesMetrics.totalRefunds;

  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modals state
  const [showProductModal, setShowProductModal] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<Order | null>(null);

  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [campaignToEdit, setCampaignToEdit] = useState<AdCampaign | null>(null);

  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);

  const [showAdjustStockModal, setShowAdjustStockModal] = useState(false);
  const [selectedStockProduct, setSelectedStockProduct] = useState<Product | null>(null);

  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedReturnOrder, setSelectedReturnOrder] = useState<Order | null>(null);

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);

  // Filtered lists
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchPlatform = platformFilter === "all" || p.platform === platformFilter;
      const matchType = typeFilter === "all" || p.type === typeFilter;
      return matchSearch && matchPlatform && matchType;
    });
  }, [products, searchTerm, platformFilter, typeFilter]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        o.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.items.some((i) => i.product_name.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchPlatform = platformFilter === "all" || o.platform === platformFilter;
      const matchStatus = statusFilter === "all" || o.order_status === statusFilter;
      return matchSearch && matchPlatform && matchStatus;
    });
  }, [orders, searchTerm, platformFilter, statusFilter]);

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.phone && c.phone.includes(searchTerm)) ||
        (c.city && c.city.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchSearch;
    });
  }, [customers, searchTerm]);

  const filteredCampaigns = useMemo(() => {
    return adCampaigns.filter((c) => {
      const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchPlatform = platformFilter === "all" || c.platform === platformFilter;
      return matchSearch && matchPlatform;
    });
  }, [adCampaigns, searchTerm, platformFilter]);

  // Chart data calculations
  const platformBreakdownData = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach((o) => {
      map[o.platform] = (map[o.platform] || 0) + o.total_revenue;
    });
    return Object.entries(map).map(([name, value]) => ({
      name: name.toUpperCase(),
      value,
    }));
  }, [orders]);

  const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"];

  const lowStockProducts = products.filter(
    (p) => p.type === "physical" && p.stock_quantity <= p.low_stock_threshold
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Module Hero Header */}
      <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#eff6ff] text-[#2563eb] flex items-center justify-center shrink-0 shadow-xs border border-[#dbeafe]">
              <ShoppingBag size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#2563eb] bg-[#eff6ff] px-2 py-0.5 rounded-md">
                  FinTrack Core Module
                </span>
                <span className="text-xs text-[#94a3b8] font-medium">· Real-Time Ledger Sync</span>
              </div>
              <h1 className="text-xl font-bold text-[#0f172a] tracking-tight mt-1">
                Sales & Commercial Business OS
              </h1>
              <p className="text-xs text-[#64748b] mt-0.5">
                Track physical/digital products, orders, real net profit, advertising ROAS, inventory, and customer lifetime value.
              </p>
            </div>
          </div>

          {/* Quick Action Trigger Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => {
                setProductToEdit(null);
                setShowProductModal(true);
              }}
              variant="outline"
              size="sm"
              className="h-9 text-xs px-3 rounded-xl border-[#cbd5e1] text-[#0f172a] hover:bg-[#f8fafc]"
            >
              <Package size={14} className="mr-1.5 text-[#2563eb]" /> + Add Product
            </Button>
            <Button
              onClick={() => {
                setOrderToEdit(null);
                setShowOrderModal(true);
              }}
              size="sm"
              className="h-9 text-xs px-4 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white shadow-xs font-semibold"
            >
              <Plus size={14} className="mr-1.5" /> + New Order
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto border-t border-[#f1f5f9] pt-4 mt-5">
          {[
            { key: "overview", label: "Executive Overview", icon: BarChart3 },
            { key: "products", label: `Products (${products.length})`, icon: Package },
            { key: "orders", label: `Orders (${orders.length})`, icon: ShoppingBag },
            { key: "inventory", label: "Inventory & Stock", icon: Boxes },
            { key: "campaigns", label: `Ad Campaigns & ROAS (${adCampaigns.length})`, icon: Megaphone },
            { key: "customers", label: `Customers (${customers.length})`, icon: Users },
            { key: "returns", label: `Returns & Refunds (${productReturns.length})`, icon: RotateCcw },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveTab(tab.key as TabKey);
                  setSearchTerm("");
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  isActive
                    ? "bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe]"
                    : "text-[#64748b] hover:text-[#0f172a] hover:bg-[#f8fafc]"
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: EXECUTIVE OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-[#64748b] mb-2">
                <span className="text-xs font-semibold">Total Gross Sales</span>
                <div className="w-8 h-8 rounded-lg bg-[#eff6ff] text-[#2563eb] flex items-center justify-center">
                  <TrendingUp size={16} />
                </div>
              </div>
              <div className="text-2xl font-black text-[#0f172a]">
                Rs. {totalSalesRevenue.toLocaleString()}
              </div>
              <p className="text-[11px] text-[#64748b] mt-1">
                {orders.length} total orders recorded
              </p>
            </div>

            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-[#64748b] mb-2">
                <span className="text-xs font-semibold">Actual Net Sales Profit</span>
                <div className="w-8 h-8 rounded-lg bg-[#ecfdf5] text-[#10b981] flex items-center justify-center">
                  <DollarSign size={16} />
                </div>
              </div>
              <div className="text-2xl font-black text-[#10b981]">
                Rs. {totalSalesProfit.toLocaleString()}
              </div>
              <p className="text-[11px] text-[#64748b] mt-1">
                After COGS, fees & ad attribution
              </p>
            </div>

            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-[#64748b] mb-2">
                <span className="text-xs font-semibold">Marketing ROAS</span>
                <div className="w-8 h-8 rounded-lg bg-[#fff7ed] text-[#ea580c] flex items-center justify-center">
                  <Megaphone size={16} />
                </div>
              </div>
              <div className="text-2xl font-black text-[#ea580c]">
                {salesRoas}x
              </div>
              <p className="text-[11px] text-[#64748b] mt-1">
                Spend: Rs. {totalAdSpend.toLocaleString()}
              </p>
            </div>

            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-[#64748b] mb-2">
                <span className="text-xs font-semibold">Units Sold & Returns</span>
                <div className="w-8 h-8 rounded-lg bg-[#faf5ff] text-[#8b5cf6] flex items-center justify-center">
                  <Boxes size={16} />
                </div>
              </div>
              <div className="text-2xl font-black text-[#8b5cf6]">
                {totalPhysicalUnitsSold} <span className="text-sm font-normal text-[#64748b]">units</span>
              </div>
              <p className="text-[11px] text-[#dc2626] mt-1">
                Returns: Rs. {totalReturnsAmount.toLocaleString()} ({productReturns.length} cases)
              </p>
            </div>
          </div>

          {/* Alerts: Low Stock Warnings */}
          {lowStockProducts.length > 0 && (
            <div className="p-4 bg-[#fff7ed] border border-[#fed7aa] rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#ffedd5] text-[#ea580c] flex items-center justify-center shrink-0">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#9a3412] block">
                    Low Stock Alert ({lowStockProducts.length} item{lowStockProducts.length === 1 ? "" : "s"})
                  </span>
                  <span className="text-[11px] text-[#c2410c]">
                    {lowStockProducts.map((p) => `${p.name} (${p.stock_quantity} left)`).join(", ")}
                  </span>
                </div>
              </div>
              <Button
                onClick={() => {
                  setSelectedStockProduct(lowStockProducts[0]);
                  setShowAdjustStockModal(true);
                }}
                size="sm"
                className="h-8 text-xs px-3 rounded-lg bg-[#ea580c] hover:bg-[#c2410c] text-white font-medium"
              >
                Restock Now
              </Button>
            </div>
          )}

          {/* Product Profitability Matrix Table */}
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#0f172a]">Product Profitability & Unit Economics</h3>
                <p className="text-xs text-[#64748b]">Per-unit margins, revenue generated, and stock valuation.</p>
              </div>
              <Button
                onClick={() => setActiveTab("products")}
                variant="outline"
                size="sm"
                className="h-8 text-xs px-3 rounded-lg border-[#cbd5e1] text-[#2563eb]"
              >
                View Full Catalog →
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#e2e8f0] text-[10px] font-bold text-[#64748b] uppercase tracking-wider">
                    <th className="pb-2.5">Product & SKU</th>
                    <th className="pb-2.5">Type</th>
                    <th className="pb-2.5 text-right">Selling Price</th>
                    <th className="pb-2.5 text-right">Unit COGS</th>
                    <th className="pb-2.5 text-right">Unit Profit</th>
                    <th className="pb-2.5 text-center">Margin %</th>
                    <th className="pb-2.5 text-center">Stock</th>
                    <th className="pb-2.5 text-right">Channel</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9]">
                  {products.slice(0, 6).map((p) => {
                    const unitProfit = p.selling_price - p.cost_price;
                    const margin = p.selling_price > 0 ? ((unitProfit / p.selling_price) * 100).toFixed(1) : "0";
                    return (
                      <tr key={p.id} className="hover:bg-[#f8fafc] transition">
                        <td className="py-3 font-semibold text-[#0f172a]">
                          {p.name}
                          <span className="block text-[10px] font-mono text-[#94a3b8]">{p.sku}</span>
                        </td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase ${
                              p.type === "physical"
                                ? "bg-[#fff7ed] text-[#ea580c]"
                                : "bg-[#eff6ff] text-[#2563eb]"
                            }`}
                          >
                            {p.type}
                          </span>
                        </td>
                        <td className="py-3 text-right font-bold text-[#0f172a]">
                          Rs. {p.selling_price.toLocaleString()}
                        </td>
                        <td className="py-3 text-right text-[#64748b]">
                          Rs. {p.cost_price.toLocaleString()}
                        </td>
                        <td className="py-3 text-right font-bold text-[#16a34a]">
                          +Rs. {unitProfit.toLocaleString()}
                        </td>
                        <td className="py-3 text-center">
                          <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-[#ecfdf5] text-[#15803d]">
                            {margin}%
                          </span>
                        </td>
                        <td className="py-3 text-center">
                          {p.type === "physical" ? (
                            <span
                              className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                                p.stock_quantity <= p.low_stock_threshold
                                  ? "bg-[#fef2f2] text-[#dc2626]"
                                  : "bg-[#f1f5f9] text-[#475569]"
                              }`}
                            >
                              {p.stock_quantity} in stock
                            </span>
                          ) : (
                            <span className="text-[11px] text-[#94a3b8]">Unlimited</span>
                          )}
                        </td>
                        <td className="py-3 text-right font-medium text-[#64748b] capitalize">
                          {p.platform}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTS CATALOG */}
      {activeTab === "products" && (
        <div className="space-y-4 animate-in fade-in-50 duration-200">
          {/* Controls Bar */}
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by product name, SKU, category..."
                className="h-9 pl-9 text-xs bg-[#f8fafc] border-[#e2e8f0] rounded-xl"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="h-9 px-3 bg-white border border-[#e2e8f0] rounded-xl text-xs text-[#0f172a] outline-none"
              >
                <option value="all">All Types</option>
                <option value="physical">Physical Goods</option>
                <option value="digital">Digital Products</option>
              </select>

              <select
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                className="h-9 px-3 bg-white border border-[#e2e8f0] rounded-xl text-xs text-[#0f172a] outline-none"
              >
                <option value="all">All Platforms</option>
                <option value="direct">Direct Store</option>
                <option value="shopify">Shopify</option>
                <option value="gumroad">Gumroad</option>
                <option value="woocommerce">WooCommerce</option>
                <option value="daraz">Daraz</option>
              </select>

              <Button
                onClick={() => {
                  setProductToEdit(null);
                  setShowProductModal(true);
                }}
                size="sm"
                className="h-9 text-xs px-4 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white shadow-xs font-semibold"
              >
                <Plus size={14} className="mr-1" /> Add Product
              </Button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((prod) => {
              const unitProfit = prod.selling_price - prod.cost_price;
              const margin = prod.selling_price > 0 ? ((unitProfit / prod.selling_price) * 100).toFixed(1) : "0";
              const isLowStock = prod.type === "physical" && prod.stock_quantity <= prod.low_stock_threshold;

              return (
                <div
                  key={prod.id}
                  className="bg-white border border-[#e2e8f0] hover:border-[#cbd5e1] rounded-2xl p-5 shadow-xs transition space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className={`px-2 py-0.5 text-[9px] font-bold rounded-md uppercase tracking-wider ${
                            prod.type === "physical"
                              ? "bg-[#fff7ed] text-[#ea580c]"
                              : "bg-[#eff6ff] text-[#2563eb]"
                          }`}
                        >
                          {prod.type}
                        </span>
                        <span className="text-[10px] font-mono text-[#94a3b8] bg-[#f8fafc] px-1.5 py-0.5 rounded">
                          {prod.sku}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-[#0f172a]">{prod.name}</h3>
                      <p className="text-[11px] text-[#64748b]">{prod.category} · {prod.platform}</p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setProductToEdit(prod);
                          setShowProductModal(true);
                        }}
                        className="text-[#94a3b8] hover:text-[#2563eb] p-1.5 rounded-lg hover:bg-[#eff6ff] transition"
                        title="Edit product"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteProduct(prod.id)}
                        className="text-[#94a3b8] hover:text-[#dc2626] p-1.5 rounded-lg hover:bg-[#fef2f2] transition"
                        title="Delete product"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Financial & Stock Details */}
                  <div className="grid grid-cols-2 gap-2 p-3 bg-[#f8fafc] rounded-xl border border-[#edf2f7]">
                    <div>
                      <span className="text-[10px] text-[#94a3b8] uppercase font-bold block">Selling Price</span>
                      <span className="text-sm font-black text-[#0f172a]">
                        Rs. {prod.selling_price.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-[#64748b] block">
                        COGS: Rs. {prod.cost_price.toLocaleString()}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-[#94a3b8] uppercase font-bold block">Unit Profit</span>
                      <span className="text-sm font-black text-[#16a34a]">
                        +Rs. {unitProfit.toLocaleString()}
                      </span>
                      <span className="text-[10px] font-bold text-[#15803d] block">
                        {margin}% Margin
                      </span>
                    </div>
                  </div>

                  {/* Stock footer */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    {prod.type === "physical" ? (
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            prod.stock_quantity === 0
                              ? "bg-red-500"
                              : isLowStock
                              ? "bg-orange-500"
                              : "bg-green-500"
                          }`}
                        />
                        <span className={`font-semibold ${isLowStock ? "text-[#ea580c]" : "text-[#475569]"}`}>
                          {prod.stock_quantity} units left
                        </span>
                      </div>
                    ) : (
                      <span className="text-[#64748b] font-medium">Digital download / course</span>
                    )}

                    {prod.type === "physical" && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedStockProduct(prod);
                          setShowAdjustStockModal(true);
                        }}
                        className="text-[11px] font-bold text-[#2563eb] hover:underline"
                      >
                        Adjust Stock
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: ORDERS MANAGEMENT */}
      {activeTab === "orders" && (
        <div className="space-y-4 animate-in fade-in-50 duration-200">
          {/* Controls */}
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search orders, customers, items..."
                className="h-9 pl-9 text-xs bg-[#f8fafc] border-[#e2e8f0] rounded-xl"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 px-3 bg-white border border-[#e2e8f0] rounded-xl text-xs text-[#0f172a] outline-none"
              >
                <option value="all">All Order Statuses</option>
                <option value="delivered">Delivered / Completed</option>
                <option value="shipped">Shipped</option>
                <option value="processing">Processing</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <Button
                onClick={() => {
                  setOrderToEdit(null);
                  setShowOrderModal(true);
                }}
                size="sm"
                className="h-9 text-xs px-4 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white shadow-xs font-semibold"
              >
                <Plus size={14} className="mr-1" /> Record Order
              </Button>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-xs overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#e2e8f0] text-[10px] font-bold text-[#64748b] uppercase tracking-wider">
                  <th className="pb-3">Order # & Date</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Platform</th>
                  <th className="pb-3">Items Ordered</th>
                  <th className="pb-3 text-right">Revenue</th>
                  <th className="pb-3 text-right">COGS & Fees</th>
                  <th className="pb-3 text-right">Net Profit</th>
                  <th className="pb-3 text-center">Status</th>
                  <th className="pb-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {filteredOrders.map((ord) => {
                  const totalDeductions = ord.total_cogs + ord.shipping_cost + ord.platform_fee + ord.payment_fee + ord.ad_cost;
                  return (
                    <tr key={ord.id} className="hover:bg-[#f8fafc] transition">
                      <td className="py-3 font-semibold text-[#0f172a]">
                        <span className="font-mono text-xs font-bold text-[#2563eb]">
                          #{ord.order_number}
                        </span>
                        <span className="block text-[10px] text-[#94a3b8] font-normal">
                          {ord.order_date}
                        </span>
                      </td>

                      <td className="py-3 font-medium text-[#0f172a]">
                        {ord.customer_name}
                        {ord.customer_phone && (
                          <span className="block text-[10px] text-[#94a3b8]">{ord.customer_phone}</span>
                        )}
                      </td>

                      <td className="py-3 capitalize text-[#64748b]">
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-[#f1f5f9] text-[#334155]">
                          {ord.platform}
                        </span>
                      </td>

                      <td className="py-3 text-[#475569]">
                        {ord.items.map((it, i) => (
                          <span key={i} className="block text-[11px] truncate max-w-[180px]">
                            {it.quantity}x {it.product_name}
                          </span>
                        ))}
                      </td>

                      <td className="py-3 text-right font-black text-[#0f172a]">
                        Rs. {ord.total_revenue.toLocaleString()}
                      </td>

                      <td className="py-3 text-right text-[#64748b]">
                        -Rs. {totalDeductions.toLocaleString()}
                      </td>

                      <td className="py-3 text-right font-black text-[#16a34a]">
                        +Rs. {ord.actual_profit.toLocaleString()}
                      </td>

                      <td className="py-3 text-center">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-md capitalize ${
                            ord.order_status === "delivered"
                              ? "bg-[#dcfce7] text-[#15803d]"
                              : ord.order_status === "shipped"
                              ? "bg-[#eff6ff] text-[#2563eb]"
                              : ord.order_status === "cancelled"
                              ? "bg-[#fef2f2] text-[#dc2626]"
                              : "bg-[#fff7ed] text-[#ea580c]"
                          }`}
                        >
                          {ord.order_status}
                        </span>
                      </td>

                      <td className="py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setInvoiceOrder(ord);
                              setShowInvoiceModal(true);
                            }}
                            className="p-1.5 text-[#64748b] hover:text-[#2563eb] hover:bg-[#eff6ff] rounded-lg transition"
                            title="Print / View Invoice"
                          >
                            <Receipt size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setOrderToEdit(ord);
                              setShowOrderModal(true);
                            }}
                            className="p-1.5 text-[#64748b] hover:text-[#2563eb] hover:bg-[#eff6ff] rounded-lg transition"
                            title="Edit Order"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedReturnOrder(ord);
                              setShowReturnModal(true);
                            }}
                            className="p-1.5 text-[#64748b] hover:text-[#ea580c] hover:bg-[#fff7ed] rounded-lg transition"
                            title="Process Return"
                          >
                            <RotateCcw size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteOrder(ord.id)}
                            className="p-1.5 text-[#64748b] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-lg transition"
                            title="Delete Order"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: INVENTORY & STOCK */}
      {activeTab === "inventory" && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#0f172a]">Physical Inventory Stock Audit</h3>
              <p className="text-xs text-[#64748b]">Track current physical warehouse units and log inbound/outbound shipments.</p>
            </div>
            <Button
              onClick={() => {
                setSelectedStockProduct(null);
                setShowAdjustStockModal(true);
              }}
              size="sm"
              className="h-9 text-xs px-4 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white shadow-xs font-semibold"
            >
              <Boxes size={14} className="mr-1.5" /> Adjust / Restock Units
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {products
              .filter((p) => p.type === "physical")
              .map((prod) => {
                const isLow = prod.stock_quantity <= prod.low_stock_threshold;
                const totalStockValue = prod.stock_quantity * prod.cost_price;
                return (
                  <div
                    key={prod.id}
                    className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-[#94a3b8]">{prod.sku}</span>
                        <h4 className="text-sm font-bold text-[#0f172a]">{prod.name}</h4>
                      </div>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                          isLow ? "bg-[#fef2f2] text-[#dc2626]" : "bg-[#dcfce7] text-[#15803d]"
                        }`}
                      >
                        {isLow ? "Low Stock" : "In Stock"}
                      </span>
                    </div>

                    <div className="p-3 bg-[#f8fafc] rounded-xl border border-[#edf2f7] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-[#94a3b8] uppercase font-bold block">Available</span>
                        <span className="text-xl font-black text-[#0f172a]">
                          {prod.stock_quantity} <span className="text-xs font-normal text-[#64748b]">units</span>
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-[#94a3b8] uppercase font-bold block">Stock Value</span>
                        <span className="text-sm font-bold text-[#0f172a]">
                          Rs. {totalStockValue.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setSelectedStockProduct(prod);
                        setShowAdjustStockModal(true);
                      }}
                      className="w-full h-8 text-xs rounded-xl border-[#cbd5e1] text-[#2563eb] hover:bg-[#eff6ff]"
                    >
                      Log Stock Movement
                    </Button>
                  </div>
                );
              })}
          </div>

          {/* Movement Audit History */}
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-xs space-y-3">
            <h4 className="text-sm font-bold text-[#0f172a]">Recent Stock Movement History</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#e2e8f0] text-[10px] font-bold text-[#64748b] uppercase tracking-wider">
                    <th className="pb-2.5">Date</th>
                    <th className="pb-2.5">Product</th>
                    <th className="pb-2.5">Movement Type</th>
                    <th className="pb-2.5 text-center">Quantity</th>
                    <th className="pb-2.5 text-right">Cost Per Unit</th>
                    <th className="pb-2.5 text-right">Total Movement Cost</th>
                    <th className="pb-2.5">Reason / Ref</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9]">
                  {inventoryMovements.slice(0, 10).map((mov) => {
                    const prod = products.find((p) => p.id === mov.product_id);
                    const unitCost = prod?.cost_price || 0;
                    const totalCost = Math.abs(mov.quantity) * unitCost;
                    return (
                      <tr key={mov.id} className="hover:bg-[#f8fafc] transition">
                        <td className="py-2.5 text-[#64748b]">{mov.date || mov.created_at.split("T")[0]}</td>
                        <td className="py-2.5 font-semibold text-[#0f172a]">
                          {prod?.name || mov.product_name || "Product"}
                        </td>
                        <td className="py-2.5">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase ${
                              mov.type === "stock_added"
                                ? "bg-[#dcfce7] text-[#15803d]"
                                : mov.type === "sale"
                                ? "bg-[#eff6ff] text-[#2563eb]"
                                : mov.type === "return"
                                ? "bg-[#faf5ff] text-[#8b5cf6]"
                                : "bg-[#fef2f2] text-[#dc2626]"
                            }`}
                          >
                            {mov.type.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-2.5 text-center font-bold text-[#0f172a]">
                          {mov.quantity > 0 ? `+${mov.quantity}` : `${mov.quantity}`}
                        </td>
                        <td className="py-2.5 text-right text-[#64748b]">
                          Rs. {unitCost.toLocaleString()}
                        </td>
                        <td className="py-2.5 text-right font-bold text-[#0f172a]">
                          Rs. {totalCost.toLocaleString()}
                        </td>
                        <td className="py-2.5 text-[#64748b]">{mov.reason || "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: AD CAMPAIGNS & ROAS */}
      {activeTab === "campaigns" && (
        <div className="space-y-4 animate-in fade-in-50 duration-200">
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#0f172a]">Marketing Campaigns & Return On Ad Spend</h3>
              <p className="text-xs text-[#64748b]">Real-time advertising attribution directly synchronized with FinTrack.</p>
            </div>
            <Button
              onClick={() => {
                setCampaignToEdit(null);
                setShowCampaignModal(true);
              }}
              size="sm"
              className="h-9 text-xs px-4 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white shadow-xs font-semibold"
            >
              <Plus size={14} className="mr-1" /> + Add Campaign
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCampaigns.map((camp) => {
              const roas = camp.actual_spend > 0 ? (camp.attributed_revenue / camp.actual_spend).toFixed(2) : "0.00";
              const netProfit = camp.attributed_revenue - camp.actual_spend;

              return (
                <div
                  key={camp.id}
                  className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-xs space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2 py-0.5 text-[9px] font-bold rounded-md bg-[#eff6ff] text-[#2563eb] uppercase tracking-wider">
                        {camp.platform}
                      </span>
                      <h4 className="text-sm font-bold text-[#0f172a] mt-1">{camp.name}</h4>
                      <p className="text-[11px] text-[#94a3b8]">Started: {camp.start_date}</p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setCampaignToEdit(camp);
                          setShowCampaignModal(true);
                        }}
                        className="text-[#94a3b8] hover:text-[#2563eb] p-1.5 rounded-lg hover:bg-[#eff6ff] transition"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteAdCampaign(camp.id)}
                        className="text-[#94a3b8] hover:text-[#dc2626] p-1.5 rounded-lg hover:bg-[#fef2f2] transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-3 bg-[#f8fafc] rounded-xl border border-[#edf2f7]">
                    <div>
                      <span className="text-[10px] text-[#94a3b8] uppercase font-bold block">Ad Spend</span>
                      <span className="text-sm font-bold text-[#dc2626]">
                        Rs. {camp.actual_spend.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-[#64748b] block">{camp.orders_count} orders</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-[#94a3b8] uppercase font-bold block">Attributed Sales</span>
                      <span className="text-sm font-bold text-[#16a34a]">
                        Rs. {camp.attributed_revenue.toLocaleString()}
                      </span>
                      <span className="text-[10px] font-black text-[#2563eb] block">{roas}x ROAS</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-[#64748b]">Net Campaign Margin:</span>
                    <span className={`font-black ${netProfit >= 0 ? "text-[#16a34a]" : "text-[#dc2626]"}`}>
                      Rs. {netProfit.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 6: CUSTOMERS DIRECTORY */}
      {activeTab === "customers" && (
        <div className="space-y-4 animate-in fade-in-50 duration-200">
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search customers by name, phone, city..."
                className="h-9 pl-9 text-xs bg-[#f8fafc] border-[#e2e8f0] rounded-xl"
              />
            </div>

            <Button
              onClick={() => {
                setCustomerToEdit(null);
                setShowCustomerModal(true);
              }}
              size="sm"
              className="h-9 text-xs px-4 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white shadow-xs font-semibold"
            >
              <Plus size={14} className="mr-1" /> Add Customer
            </Button>
          </div>

          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-xs overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#e2e8f0] text-[10px] font-bold text-[#64748b] uppercase tracking-wider">
                  <th className="pb-3">Customer Name</th>
                  <th className="pb-3">Contact</th>
                  <th className="pb-3">City & Address</th>
                  <th className="pb-3 text-center">Orders</th>
                  <th className="pb-3 text-right">Lifetime Spend (LTV)</th>
                  <th className="pb-3 text-center">Tier</th>
                  <th className="pb-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {filteredCustomers.map((cust) => {
                  const custOrders = orders.filter(
                    (o) => o.customer_id === cust.id || o.customer_name.toLowerCase() === cust.name.toLowerCase()
                  );
                  const ordersCount = custOrders.length;
                  const totalSpent = custOrders.reduce((sum, o) => sum + o.total_revenue, 0);
                  return (
                    <tr key={cust.id} className="hover:bg-[#f8fafc] transition">
                      <td className="py-3 font-semibold text-[#0f172a]">
                        {cust.name}
                      </td>

                      <td className="py-3 text-[#475569]">
                        <span>{cust.phone || "-"}</span>
                        {cust.email && <span className="block text-[10px] text-[#94a3b8]">{cust.email}</span>}
                      </td>

                      <td className="py-3 text-[#64748b]">
                        {cust.city || "-"}
                      </td>

                      <td className="py-3 text-center font-bold text-[#0f172a]">
                        {ordersCount}
                      </td>

                      <td className="py-3 text-right font-black text-[#2563eb]">
                        Rs. {totalSpent.toLocaleString()}
                      </td>

                      <td className="py-3 text-center">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase ${
                            cust.status === "vip"
                              ? "bg-[#faf5ff] text-[#8b5cf6]"
                              : cust.status === "active"
                              ? "bg-[#dcfce7] text-[#15803d]"
                              : "bg-[#f1f5f9] text-[#64748b]"
                          }`}
                        >
                          {cust.status}
                        </span>
                      </td>

                      <td className="py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setCustomerToEdit(cust);
                              setShowCustomerModal(true);
                            }}
                            className="p-1.5 text-[#64748b] hover:text-[#2563eb] hover:bg-[#eff6ff] rounded-lg transition"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteCustomer(cust.id)}
                            className="p-1.5 text-[#64748b] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-lg transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: RETURNS & REFUNDS */}
      {activeTab === "returns" && (
        <div className="space-y-4 animate-in fade-in-50 duration-200">
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#0f172a]">Product Returns & Customer Refunds</h3>
              <p className="text-xs text-[#64748b]">Track inventory return movements and sync refund deductions with the ledger.</p>
            </div>
            <Button
              onClick={() => {
                setSelectedReturnOrder(null);
                setShowReturnModal(true);
              }}
              size="sm"
              className="h-9 text-xs px-4 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white shadow-xs font-semibold"
            >
              <RotateCcw size={14} className="mr-1" /> Process Return
            </Button>
          </div>

          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-xs overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#e2e8f0] text-[10px] font-bold text-[#64748b] uppercase tracking-wider">
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Order Ref</th>
                  <th className="pb-3">Product Item</th>
                  <th className="pb-3 text-center">Returned Qty</th>
                  <th className="pb-3 text-right">Refund Amount</th>
                  <th className="pb-3 text-center">Restocked</th>
                  <th className="pb-3">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {productReturns.map((ret) => {
                  const ord = orders.find((o) => o.id === ret.order_id);
                  const prod = products.find((p) => p.id === ret.product_id);
                  return (
                    <tr key={ret.id} className="hover:bg-[#f8fafc] transition">
                      <td className="py-3 text-[#64748b]">{ret.refund_date || ret.created_at.split("T")[0]}</td>
                      <td className="py-3 font-mono font-bold text-[#2563eb]">
                        #{ord?.order_number || ret.order_number || "ORD"}
                      </td>
                      <td className="py-3 font-medium text-[#0f172a]">
                        {prod?.name || ret.product_name || "Product Item"}
                      </td>
                      <td className="py-3 text-center font-bold text-[#dc2626]">
                        {ret.quantity} unit(s)
                      </td>
                      <td className="py-3 text-right font-black text-[#dc2626]">
                        -Rs. {ret.refund_amount.toLocaleString()}
                      </td>
                      <td className="py-3 text-center">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                            ret.restock_inventory ? "bg-[#dcfce7] text-[#15803d]" : "bg-[#f1f5f9] text-[#64748b]"
                          }`}
                        >
                          {ret.restock_inventory ? "Yes (Restocked)" : "No"}
                        </span>
                      </td>
                      <td className="py-3 text-[#64748b]">{ret.reason || "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Action Modals */}
      <AddProductModal
        open={showProductModal}
        onClose={() => setShowProductModal(false)}
        productToEdit={productToEdit}
      />

      <AddOrderModal
        open={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        orderToEdit={orderToEdit}
      />

      <AddCampaignModal
        open={showCampaignModal}
        onClose={() => setShowCampaignModal(false)}
        campaignToEdit={campaignToEdit}
      />

      <AddCustomerModal
        open={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        customerToEdit={customerToEdit}
      />

      <AdjustInventoryModal
        open={showAdjustStockModal}
        onClose={() => setShowAdjustStockModal(false)}
        selectedProduct={selectedStockProduct}
      />

      <ProcessReturnModal
        open={showReturnModal}
        onClose={() => setShowReturnModal(false)}
        selectedOrder={selectedReturnOrder}
      />

      <OrderInvoiceModal
        open={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        order={invoiceOrder}
      />
    </div>
  );
}
