import { useState, useEffect } from "react";
import {
  X,
  ShoppingBag,
  Plus,
  Trash2,
  DollarSign,
  User,
  Truck,
  Percent,
  Layers,
  Sparkles,
  Calculator,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useFinancialData, type NewOrderItemInput } from "@/contexts/FinancialDataContext";
import type {
  Order,
  OrderStatus,
  OrderPaymentStatus,
  PaymentMethod,
  ProductPlatform,
} from "@shared/types";

interface AddOrderModalProps {
  open: boolean;
  onClose: () => void;
  orderToEdit?: Order | null;
}

export function AddOrderModal({ open, onClose, orderToEdit }: AddOrderModalProps) {
  const { products, customers, adCampaigns, addOrder, updateOrder } = useFinancialData();

  const [orderNumber, setOrderNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerId, setCustomerId] = useState<string>("");
  const [orderDate, setOrderDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>("delivered");
  const [paymentStatus, setPaymentStatus] = useState<OrderPaymentStatus>("paid");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bank_transfer");
  const [platform, setPlatform] = useState<ProductPlatform>("direct");
  const [adCampaignId, setAdCampaignId] = useState<string>("");
  const [source, setSource] = useState("");

  // Items in the order
  const [items, setItems] = useState<NewOrderItemInput[]>([
    {
      product_id: "",
      product_name: "",
      product_sku: "",
      product_type: "physical",
      unit_price: 0,
      unit_cost: 0,
      quantity: 1,
      total_price: 0,
      total_cost: 0,
    },
  ]);

  // Financial Fee Adjustments
  const [discount, setDiscount] = useState("0");
  const [shippingCost, setShippingCost] = useState("0");
  const [packagingCost, setPackagingCost] = useState("0");
  const [platformFee, setPlatformFee] = useState("0");
  const [paymentFee, setPaymentFee] = useState("0");
  const [adCost, setAdCost] = useState("0");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (orderToEdit) {
        setOrderNumber(orderToEdit.order_number);
        setCustomerName(orderToEdit.customer_name);
        setCustomerEmail(orderToEdit.customer_email || "");
        setCustomerPhone(orderToEdit.customer_phone || "");
        setCustomerId(orderToEdit.customer_id || "");
        setOrderDate(orderToEdit.order_date);
        setOrderStatus(orderToEdit.order_status);
        setPaymentStatus(orderToEdit.payment_status);
        setPaymentMethod(orderToEdit.payment_method);
        setPlatform(orderToEdit.platform);
        setAdCampaignId(orderToEdit.ad_campaign_id || "");
        setSource(orderToEdit.source || "");
        setDiscount(String(orderToEdit.discount || 0));
        setShippingCost(String(orderToEdit.shipping_cost || 0));
        setPackagingCost(String(orderToEdit.packaging_cost || 0));
        setPlatformFee(String(orderToEdit.platform_fee || 0));
        setPaymentFee(String(orderToEdit.payment_fee || 0));
        setAdCost(String(orderToEdit.ad_cost || 0));
        setNotes(orderToEdit.notes || "");
        setItems(
          orderToEdit.items.map((i) => ({
            product_id: i.product_id,
            product_name: i.product_name,
            product_sku: i.product_sku,
            product_type: i.product_type,
            unit_price: i.unit_price,
            unit_cost: i.unit_cost,
            quantity: i.quantity,
            total_price: i.total_price,
            total_cost: i.total_cost,
            notes: i.notes || undefined,
          }))
        );
      } else {
        const genOrderNum = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
        setOrderNumber(genOrderNum);
        setCustomerName("");
        setCustomerEmail("");
        setCustomerPhone("");
        setCustomerId("");
        setOrderDate(new Date().toISOString().split("T")[0]);
        setOrderStatus("delivered");
        setPaymentStatus("paid");
        setPaymentMethod("bank_transfer");
        setPlatform("direct");
        setAdCampaignId("");
        setSource("");
        setDiscount("0");
        setShippingCost("0");
        setPackagingCost("0");
        setPlatformFee("0");
        setPaymentFee("0");
        setAdCost("0");
        setNotes("");

        if (products.length > 0) {
          const firstProd = products[0];
          setItems([
            {
              product_id: firstProd.id,
              product_name: firstProd.name,
              product_sku: firstProd.sku,
              product_type: firstProd.type,
              unit_price: firstProd.selling_price,
              unit_cost: firstProd.cost_price,
              quantity: 1,
              total_price: firstProd.selling_price,
              total_cost: firstProd.cost_price,
            },
          ]);
        } else {
          setItems([
            {
              product_id: "custom_item",
              product_name: "Item 1",
              product_sku: "SKU-CUSTOM",
              product_type: "physical",
              unit_price: 1000,
              unit_cost: 400,
              quantity: 1,
              total_price: 1000,
              total_cost: 400,
            },
          ]);
        }
      }
      setErrors({});
    }
  }, [open, orderToEdit, products]);

  // Quick select customer
  const handleSelectCustomer = (cust: typeof customers[0]) => {
    setCustomerId(cust.id);
    setCustomerName(cust.name);
    setCustomerEmail(cust.email || "");
    setCustomerPhone(cust.phone || cust.whatsapp || "");
  };

  // Item handlers
  const handleProductSelect = (index: number, prodId: string) => {
    const prod = products.find((p) => p.id === prodId);
    if (!prod) return;

    setItems((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          const q = item.quantity || 1;
          return {
            ...item,
            product_id: prod.id,
            product_name: prod.name,
            product_sku: prod.sku,
            product_type: prod.type,
            unit_price: prod.selling_price,
            unit_cost: prod.cost_price,
            total_price: prod.selling_price * q,
            total_cost: prod.cost_price * q,
          };
        }
        return item;
      })
    );
  };

  const handleItemQuantityChange = (index: number, qty: number) => {
    const validQty = Math.max(1, qty);
    setItems((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          return {
            ...item,
            quantity: validQty,
            total_price: item.unit_price * validQty,
            total_cost: item.unit_cost * validQty,
          };
        }
        return item;
      })
    );
  };

  const handleItemPriceChange = (index: number, price: number) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          return {
            ...item,
            unit_price: price,
            total_price: price * (item.quantity || 1),
          };
        }
        return item;
      })
    );
  };

  const handleItemCostChange = (index: number, cost: number) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          return {
            ...item,
            unit_cost: cost,
            total_cost: cost * (item.quantity || 1),
          };
        }
        return item;
      })
    );
  };

  const addItemRow = () => {
    if (products.length > 0) {
      const p = products[0];
      setItems((prev) => [
        ...prev,
        {
          product_id: p.id,
          product_name: p.name,
          product_sku: p.sku,
          product_type: p.type,
          unit_price: p.selling_price,
          unit_cost: p.cost_price,
          quantity: 1,
          total_price: p.selling_price,
          total_cost: p.cost_price,
        },
      ]);
    } else {
      setItems((prev) => [
        ...prev,
        {
          product_id: `custom_${Date.now()}`,
          product_name: "New Item",
          product_sku: "SKU-NEW",
          product_type: "physical",
          unit_price: 1000,
          unit_cost: 300,
          quantity: 1,
          total_price: 1000,
          total_cost: 300,
        },
      ]);
    }
  };

  const removeItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Real-time calculations
  const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
  const totalCogs = items.reduce((sum, item) => sum + item.total_cost, 0);
  const discountNum = parseFloat(discount) || 0;
  const shippingNum = parseFloat(shippingCost) || 0;
  const packagingNum = parseFloat(packagingCost) || 0;
  const platformFeeNum = parseFloat(platformFee) || 0;
  const paymentFeeNum = parseFloat(paymentFee) || 0;
  const adCostNum = parseFloat(adCost) || 0;

  const totalRevenue = Math.max(0, subtotal - discountNum + shippingNum);
  const totalDeductions = totalCogs + shippingNum + packagingNum + platformFeeNum + paymentFeeNum + adCostNum;
  const netActualProfit = totalRevenue - totalDeductions;
  const profitMarginPercent = totalRevenue > 0 ? ((netActualProfit / totalRevenue) * 100).toFixed(1) : "0.0";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!customerName.trim()) newErrors.customerName = "Customer name is required";
    if (items.length === 0) newErrors.items = "At least one product item is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      if (orderToEdit) {
        updateOrder(orderToEdit.id, {
          order_number: orderNumber,
          customer_id: customerId || null,
          customer_name: customerName.trim(),
          customer_email: customerEmail.trim() || null,
          customer_phone: customerPhone.trim() || null,
          order_date: orderDate,
          order_status: orderStatus,
          payment_status: paymentStatus,
          payment_method: paymentMethod,
          platform,
          ad_campaign_id: adCampaignId || null,
          source: source.trim() || null,
          items: items.map((i, idx) => ({
            id: `item_${orderToEdit.id}_${idx}`,
            order_id: orderToEdit.id,
            product_id: i.product_id,
            product_name: i.product_name,
            product_sku: i.product_sku,
            product_type: i.product_type,
            unit_price: i.unit_price,
            unit_cost: i.unit_cost,
            quantity: i.quantity,
            total_price: i.total_price,
            total_cost: i.total_cost,
            notes: i.notes || null,
          })),
          subtotal,
          discount: discountNum,
          shipping_cost: shippingNum,
          packaging_cost: packagingNum,
          platform_fee: platformFeeNum,
          payment_fee: paymentFeeNum,
          ad_cost: adCostNum,
          total_revenue: totalRevenue,
          total_cogs: totalCogs,
          actual_profit: netActualProfit,
          notes: notes.trim() || null,
        });
      } else {
        addOrder({
          order_number: orderNumber,
          customer_id: customerId || null,
          customer_name: customerName.trim(),
          customer_email: customerEmail.trim() || undefined,
          customer_phone: customerPhone.trim() || undefined,
          order_date: orderDate,
          order_status: orderStatus,
          payment_status: paymentStatus,
          payment_method: paymentMethod,
          platform,
          ad_campaign_id: adCampaignId || null,
          source: source.trim() || undefined,
          items,
          discount: discountNum,
          shipping_cost: shippingNum,
          packaging_cost: packagingNum,
          platform_fee: platformFeeNum,
          payment_fee: paymentFeeNum,
          ad_cost: adCostNum,
          notes: notes.trim() || undefined,
        });
      }
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="p-0 max-w-2xl bg-white border border-[#e2e8f0] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
        <DialogTitle className="sr-only">
          {orderToEdit ? "Edit Order" : "Create New Order"}
        </DialogTitle>

        <div className="p-6 max-h-[88vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#f1f5f9] mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#eff6ff] text-[#2563eb] flex items-center justify-center">
                <ShoppingBag size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#0f172a]">
                  {orderToEdit ? `Edit Order #${orderNumber}` : "Record New Order / Sale"}
                </h2>
                <p className="text-xs text-[#64748b]">
                  Calculate revenue, product COGS, platform fees, and real net profit.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-[#94a3b8] hover:text-[#475569] hover:bg-[#f1f5f9] p-1.5 rounded-lg transition"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Row 1: Order #, Date, Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-[#1e293b]">Order Number</Label>
                <Input
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="h-10 rounded-xl bg-white border border-[#e2e8f0] text-xs font-mono font-semibold text-[#0f172a]"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-[#1e293b]">Order Date</Label>
                <Input
                  type="date"
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                  className="h-10 rounded-xl bg-white border border-[#e2e8f0] text-xs text-[#0f172a]"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-[#1e293b]">Sales Channel</Label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as ProductPlatform)}
                  className="w-full h-10 px-3 bg-white border border-[#e2e8f0] rounded-xl text-xs text-[#0f172a] outline-none"
                >
                  <option value="direct">Direct Website</option>
                  <option value="shopify">Shopify Store</option>
                  <option value="gumroad">Gumroad</option>
                  <option value="woocommerce">WooCommerce</option>
                  <option value="daraz">Daraz</option>
                  <option value="amazon">Amazon</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Row 2: Customer Details */}
            <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-[#0f172a] flex items-center gap-1.5">
                  <User size={13} className="text-[#2563eb]" />
                  Customer Information <span className="text-red-500">*</span>
                </Label>
                {customers.length > 0 && (
                  <div className="flex items-center gap-1 overflow-x-auto">
                    <span className="text-[10px] text-[#64748b]">Select:</span>
                    {customers.slice(0, 3).map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleSelectCustomer(c)}
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-md border transition ${
                          customerName === c.name
                            ? "bg-[#eff6ff] text-[#2563eb] border-[#bfdbfe]"
                            : "bg-white text-[#475569] border-[#e2e8f0] hover:bg-[#f1f5f9]"
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Input
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    if (errors.customerName) setErrors((prev) => ({ ...prev, customerName: "" }));
                  }}
                  placeholder="Customer Full Name *"
                  className={`h-9 bg-white border text-xs text-[#0f172a] rounded-lg ${
                    errors.customerName ? "border-red-400" : "border-[#e2e8f0]"
                  }`}
                />
                <Input
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="Email Address"
                  className="h-9 bg-white border border-[#e2e8f0] text-xs text-[#0f172a] rounded-lg"
                />
                <Input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Phone / WhatsApp"
                  className="h-9 bg-white border border-[#e2e8f0] text-xs text-[#0f172a] rounded-lg"
                />
              </div>
            </div>

            {/* Row 3: Product Line Items */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-[#0f172a] flex items-center gap-1.5">
                  <Layers size={14} className="text-[#2563eb]" />
                  Order Items ({items.length})
                </Label>
                <Button
                  type="button"
                  onClick={addItemRow}
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs px-2.5 rounded-lg border-[#cbd5e1] text-[#2563eb] hover:bg-[#eff6ff]"
                >
                  <Plus size={13} className="mr-1" /> Add Product
                </Button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-white border border-[#e2e8f0] rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-2"
                  >
                    <div className="flex-1 min-w-[160px]">
                      {products.length > 0 ? (
                        <select
                          value={item.product_id}
                          onChange={(e) => handleProductSelect(idx, e.target.value)}
                          className="w-full h-8 px-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-xs text-[#0f172a] font-medium outline-none"
                        >
                          <option value="">-- Choose Product --</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.type === "physical" ? `Stock: ${p.stock_quantity}` : "Digital"}) - Rs. {p.selling_price.toLocaleString()}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <Input
                          value={item.product_name}
                          onChange={(e) => {
                            const val = e.target.value;
                            setItems((prev) =>
                              prev.map((it, i) => (i === idx ? { ...it, product_name: val } : it))
                            );
                          }}
                          placeholder="Item Name"
                          className="h-8 text-xs bg-[#f8fafc] border-[#e2e8f0]"
                        />
                      )}
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <div className="w-16">
                        <span className="text-[9px] uppercase font-bold text-[#94a3b8] block">Qty</span>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemQuantityChange(idx, parseInt(e.target.value) || 1)}
                          className="h-8 text-xs text-center font-bold bg-[#f8fafc] border-[#e2e8f0]"
                        />
                      </div>

                      <div className="w-24">
                        <span className="text-[9px] uppercase font-bold text-[#94a3b8] block">Price</span>
                        <Input
                          type="number"
                          value={item.unit_price}
                          onChange={(e) => handleItemPriceChange(idx, parseFloat(e.target.value) || 0)}
                          className="h-8 text-xs font-semibold bg-[#f8fafc] border-[#e2e8f0]"
                        />
                      </div>

                      <div className="w-20">
                        <span className="text-[9px] uppercase font-bold text-[#94a3b8] block">COGS</span>
                        <Input
                          type="number"
                          value={item.unit_cost}
                          onChange={(e) => handleItemCostChange(idx, parseFloat(e.target.value) || 0)}
                          className="h-8 text-xs bg-[#f8fafc] border-[#e2e8f0]"
                        />
                      </div>

                      <div className="pt-3">
                        <button
                          type="button"
                          onClick={() => removeItemRow(idx)}
                          disabled={items.length <= 1}
                          className="text-[#94a3b8] hover:text-red-600 disabled:opacity-30 p-1 transition"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Row 4: Fees, Shipping, Ad Attribution & Deductions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl">
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-[#475569]">Shipping Charge (Rs.)</Label>
                <Input
                  type="number"
                  value={shippingCost}
                  onChange={(e) => setShippingCost(e.target.value)}
                  placeholder="0"
                  className="h-8 bg-white text-xs border-[#e2e8f0]"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-[#475569]">Discount / Voucher (Rs.)</Label>
                <Input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  placeholder="0"
                  className="h-8 bg-white text-xs border-[#e2e8f0]"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-[#475569]">Platform Fee (Rs.)</Label>
                <Input
                  type="number"
                  value={platformFee}
                  onChange={(e) => setPlatformFee(e.target.value)}
                  placeholder="0"
                  className="h-8 bg-white text-xs border-[#e2e8f0]"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-[#475569]">Attributed Ad Spend</Label>
                {adCampaigns.length > 0 ? (
                  <select
                    value={adCampaignId}
                    onChange={(e) => {
                      setAdCampaignId(e.target.value);
                      const camp = adCampaigns.find((c) => c.id === e.target.value);
                      if (camp && camp.orders_count) {
                        const estimatedCostPerOrder = Math.round(camp.actual_spend / Math.max(1, camp.orders_count));
                        setAdCost(String(estimatedCostPerOrder));
                      }
                    }}
                    className="w-full h-8 px-2 bg-white border border-[#e2e8f0] rounded-md text-xs text-[#0f172a] outline-none"
                  >
                    <option value="">No Campaign</option>
                    {adCampaigns.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.platform})
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    type="number"
                    value={adCost}
                    onChange={(e) => setAdCost(e.target.value)}
                    placeholder="0"
                    className="h-8 bg-white text-xs border-[#e2e8f0]"
                  />
                )}
              </div>
            </div>

            {/* Row 5: Payment & Order Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-[#1e293b]">Payment Status</Label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as OrderPaymentStatus)}
                  className="w-full h-9 px-3 bg-white border border-[#e2e8f0] rounded-xl text-xs text-[#0f172a] outline-none"
                >
                  <option value="paid">Paid (In Full)</option>
                  <option value="partially_paid">Partially Paid</option>
                  <option value="pending">Pending Payment</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-[#1e293b]">Payment Method</Label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full h-9 px-3 bg-white border border-[#e2e8f0] rounded-xl text-xs text-[#0f172a] outline-none"
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="card">Credit / Debit Card</option>
                  <option value="easypaisa">Easypaisa</option>
                  <option value="jazzcash">JazzCash</option>
                  <option value="cash">Cash on Delivery (COD)</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-[#1e293b]">Fulfillment Status</Label>
                <select
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value as OrderStatus)}
                  className="w-full h-9 px-3 bg-white border border-[#e2e8f0] rounded-xl text-xs text-[#0f172a] outline-none"
                >
                  <option value="delivered">Delivered / Completed</option>
                  <option value="shipped">Shipped (In Transit)</option>
                  <option value="processing">Processing</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="returned">Returned</option>
                </select>
              </div>
            </div>

            {/* Live Financial Summary Banner */}
            <div className="p-4 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-[#166534] block">
                  Total Order Revenue
                </span>
                <span className="text-lg font-black text-[#15803d]">
                  Rs. {totalRevenue.toLocaleString()}
                </span>
                <span className="text-[11px] text-[#166534] block">
                  Subtotal: Rs. {subtotal.toLocaleString()} | COGS: Rs. {totalCogs.toLocaleString()}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider font-bold text-[#166534] block">
                  Actual Net Profit
                </span>
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-lg font-black text-[#16a34a]">
                    Rs. {netActualProfit.toLocaleString()}
                  </span>
                  <span className="px-2 py-0.5 text-xs font-extrabold rounded-md bg-white border border-[#bbf7d0] text-[#15803d]">
                    {profitMarginPercent}% Margin
                  </span>
                </div>
                <span className="text-[10px] text-[#166534]">
                  Synced directly with FinTrack Ledger
                </span>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#f1f5f9]">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="h-10 px-5 rounded-xl border-[#e2e8f0] text-xs text-[#475569]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="h-10 px-6 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold shadow-xs"
              >
                {saving ? "Saving..." : orderToEdit ? "Update Order" : "Save & Record Order"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
