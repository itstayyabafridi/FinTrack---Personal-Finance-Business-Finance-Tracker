import { useState, useEffect } from "react";
import { X, Boxes, Plus, Minus, RotateCcw, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useFinancialData } from "@/contexts/FinancialDataContext";
import type { InventoryMovementType, Product } from "@shared/types";

interface AdjustInventoryModalProps {
  open: boolean;
  onClose: () => void;
  selectedProduct?: Product | null;
}

export function AdjustInventoryModal({
  open,
  onClose,
  selectedProduct,
}: AdjustInventoryModalProps) {
  const { products, addInventoryMovement } = useFinancialData();

  const [productId, setProductId] = useState("");
  const [movementType, setMovementType] = useState<InventoryMovementType>("stock_added");
  const [quantity, setQuantity] = useState("10");
  const [costPerUnit, setCostPerUnit] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const physicalProducts = products.filter((p) => p.type === "physical");

  useEffect(() => {
    if (open) {
      if (selectedProduct) {
        setProductId(selectedProduct.id);
        setCostPerUnit(String(selectedProduct.cost_price));
      } else if (physicalProducts.length > 0) {
        setProductId(physicalProducts[0].id);
        setCostPerUnit(String(physicalProducts[0].cost_price));
      }
      setMovementType("stock_added");
      setQuantity("10");
      setReason("Stock shipment received from supplier");
      setNotes("");
      setErrors({});
    }
  }, [open, selectedProduct]);

  const activeProduct = products.find((p) => p.id === productId);
  const qtyNum = parseInt(quantity) || 0;
  const unitCostNum = parseFloat(costPerUnit) || 0;
  const totalCost = qtyNum * unitCostNum;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!productId) newErrors.productId = "Please select a product";
    if (isNaN(qtyNum) || qtyNum <= 0) newErrors.quantity = "Please enter valid positive quantity";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      addInventoryMovement({
        product_id: productId,
        product_name: activeProduct?.name || "Product",
        type: movementType,
        quantity: movementType === "damaged" ? -qtyNum : qtyNum,
        date: new Date().toISOString().split("T")[0],
        reason: reason.trim() || "Stock adjustment",
        notes: notes.trim() || undefined,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="p-0 max-w-md bg-white border border-[#e2e8f0] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
        <DialogTitle className="sr-only">Adjust Stock / Record Inventory Movement</DialogTitle>

        <div className="p-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#f1f5f9] mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#fff7ed] text-[#ea580c] flex items-center justify-center">
                <Boxes size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#0f172a]">Adjust Stock Levels</h2>
                <p className="text-xs text-[#64748b]">
                  Restock units, log damaged items, or adjust counts.
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
            {/* Product selection */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-[#1e293b]">Physical Product</Label>
              <select
                value={productId}
                onChange={(e) => {
                  setProductId(e.target.value);
                  const prod = products.find((p) => p.id === e.target.value);
                  if (prod) setCostPerUnit(String(prod.cost_price));
                }}
                className="w-full h-10 px-3 bg-white border border-[#e2e8f0] rounded-xl text-xs text-[#0f172a] font-medium outline-none"
              >
                {physicalProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Current Stock: {p.stock_quantity} units)
                  </option>
                ))}
              </select>
            </div>

            {/* Movement Type */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-[#1e293b]">Movement Type</Label>
              <div className="grid grid-cols-3 gap-1 bg-[#f8fafc] p-1 rounded-xl border border-[#e2e8f0]">
                <button
                  type="button"
                  onClick={() => {
                    setMovementType("stock_added");
                    setReason("Stock replenishment from supplier");
                  }}
                  className={`py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
                    movementType === "stock_added"
                      ? "bg-white text-[#16a34a] shadow-xs border border-[#cbd5e1]"
                      : "text-[#64748b]"
                  }`}
                >
                  <Plus size={12} /> Restock (+)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMovementType("adjustment");
                    setReason("Inventory recount / audit correction");
                  }}
                  className={`py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
                    movementType === "adjustment"
                      ? "bg-white text-[#2563eb] shadow-xs border border-[#cbd5e1]"
                      : "text-[#64748b]"
                  }`}
                >
                  <RotateCcw size={12} /> Adjust (±)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMovementType("damaged");
                    setReason("Damaged / expired in warehouse");
                  }}
                  className={`py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
                    movementType === "damaged"
                      ? "bg-white text-[#dc2626] shadow-xs border border-[#cbd5e1]"
                      : "text-[#64748b]"
                  }`}
                >
                  <Minus size={12} /> Damage (-)
                </button>
              </div>
            </div>

            {/* Quantity & Unit Cost */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-[#1e293b]">
                  Quantity ({movementType === "damaged" ? "Units to Remove" : "Units to Add"})
                </Label>
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="h-10 rounded-xl bg-white border border-[#e2e8f0] text-xs font-bold text-[#0f172a]"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-[#1e293b]">Unit Cost / COGS (Rs.)</Label>
                <Input
                  type="number"
                  value={costPerUnit}
                  onChange={(e) => setCostPerUnit(e.target.value)}
                  placeholder="0.00"
                  className="h-10 rounded-xl bg-white border border-[#e2e8f0] text-xs font-semibold text-[#0f172a]"
                />
              </div>
            </div>

            {/* Total Cost preview banner */}
            <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl flex items-center justify-between">
              <span className="text-xs text-[#64748b] font-medium">Total Movement Value</span>
              <span className="text-sm font-extrabold text-[#0f172a]">
                Rs. {totalCost.toLocaleString()}
              </span>
            </div>

            {/* Reason */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-[#1e293b]">Reason / Note</Label>
              <Input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Batch #498 shipment, supplier invoice 104..."
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
                className="h-10 px-6 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-semibold shadow-xs"
              >
                {saving ? "Updating..." : "Confirm Stock Adjustment"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
