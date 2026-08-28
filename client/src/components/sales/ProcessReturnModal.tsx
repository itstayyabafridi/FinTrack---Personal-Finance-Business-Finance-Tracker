import { useState, useEffect } from "react";
import { X, RotateCcw, AlertTriangle, CheckSquare, DollarSign } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useFinancialData } from "@/contexts/FinancialDataContext";
import type { Order } from "@shared/types";

interface ProcessReturnModalProps {
  open: boolean;
  onClose: () => void;
  selectedOrder?: Order | null;
}

export function ProcessReturnModal({
  open,
  onClose,
  selectedOrder,
}: ProcessReturnModalProps) {
  const { orders, products, processReturn } = useFinancialData();

  const [orderId, setOrderId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [refundAmount, setRefundAmount] = useState("");
  const [restockItem, setRestockItem] = useState(true);
  const [reason, setReason] = useState("Customer requested exchange / size mismatch");
  const [returnDate, setReturnDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (selectedOrder) {
        setOrderId(selectedOrder.id);
        if (selectedOrder.items.length > 0) {
          setProductId(selectedOrder.items[0].product_id);
          setRefundAmount(String(selectedOrder.items[0].unit_price));
        } else {
          setRefundAmount(String(selectedOrder.total_revenue));
        }
      } else if (orders.length > 0) {
        const o = orders[0];
        setOrderId(o.id);
        if (o.items.length > 0) {
          setProductId(o.items[0].product_id);
          setRefundAmount(String(o.items[0].unit_price));
        }
      }
      setQuantity("1");
      setRestockItem(true);
      setReason("Customer returned item");
      setReturnDate(new Date().toISOString().split("T")[0]);
      setErrors({});
    }
  }, [open, selectedOrder, orders]);

  const activeOrder = orders.find((o) => o.id === orderId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    const qtyNum = parseInt(quantity) || 1;
    const refNum = parseFloat(refundAmount) || 0;

    if (!orderId) newErrors.orderId = "Please select an order";
    if (refNum < 0) newErrors.refundAmount = "Valid refund amount is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      const prod = products.find((p) => p.id === productId) || (activeOrder?.items[0] ? { name: activeOrder.items[0].product_name, id: activeOrder.items[0].product_id } : { name: "Product", id: "general" });
      processReturn({
        order_id: orderId,
        order_number: activeOrder?.order_number || "ORD",
        customer_name: activeOrder?.customer_name || "Customer",
        product_id: productId || prod.id,
        product_name: prod.name,
        quantity: qtyNum,
        refund_amount: refNum,
        restock_inventory: restockItem,
        reason: reason.trim() || "Customer return",
        refund_date: returnDate,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="p-0 max-w-md bg-white border border-[#e2e8f0] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
        <DialogTitle className="sr-only">Process Product Return / Refund</DialogTitle>

        <div className="p-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#f1f5f9] mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#fef2f2] text-[#dc2626] flex items-center justify-center">
                <RotateCcw size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#0f172a]">Process Return / Refund</h2>
                <p className="text-xs text-[#64748b]">
                  Deduct from sales ledger and optionally return item to stock.
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

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Order Selection */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-[#1e293b]">Select Order</Label>
              <select
                value={orderId}
                onChange={(e) => {
                  setOrderId(e.target.value);
                  const ord = orders.find((o) => o.id === e.target.value);
                  if (ord && ord.items.length > 0) {
                    setProductId(ord.items[0].product_id);
                    setRefundAmount(String(ord.items[0].unit_price));
                  }
                }}
                className="w-full h-10 px-3 bg-white border border-[#e2e8f0] rounded-xl text-xs text-[#0f172a] font-medium outline-none"
              >
                {orders.map((o) => (
                  <option key={o.id} value={o.id}>
                    #{o.order_number} - {o.customer_name} (Rs. {o.total_revenue.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            {/* Product & Qty */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-[#1e293b]">Returned Qty</Label>
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="h-10 rounded-xl bg-white border border-[#e2e8f0] text-xs font-bold text-[#0f172a]"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-[#1e293b]">
                  Refund Amount (Rs.)
                </Label>
                <Input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="h-10 rounded-xl bg-white border border-[#e2e8f0] text-xs font-bold text-[#dc2626]"
                />
              </div>
            </div>

            {/* Restock checkbox */}
            <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[#0f172a] block">
                  Restock back to Inventory?
                </span>
                <span className="text-[11px] text-[#64748b]">
                  Increases physical inventory stock count by {quantity} unit(s).
                </span>
              </div>
              <input
                type="checkbox"
                checked={restockItem}
                onChange={(e) => setRestockItem(e.target.checked)}
                className="w-4 h-4 text-[#2563eb] rounded border-[#cbd5e1] focus:ring-0"
              />
            </div>

            {/* Return Reason */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-[#1e293b]">Reason for Return</Label>
              <Input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Defective, wrong size, changed mind..."
                className="h-9 rounded-xl bg-white border border-[#e2e8f0] text-xs text-[#0f172a]"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#f1f5f9]">
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
                className="h-10 px-6 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs font-semibold shadow-xs"
              >
                {saving ? "Processing..." : "Process Return & Refund"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
