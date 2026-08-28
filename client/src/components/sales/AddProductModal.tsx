import { useState, useEffect } from "react";
import { X, Package, Layers, DollarSign, Tag, Globe, Image as ImageIcon, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useFinancialData } from "@/contexts/FinancialDataContext";
import type { Product, ProductType, ProductPlatform, ProductStatus } from "@shared/types";

interface AddProductModalProps {
  open: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

const PLATFORMS: { value: ProductPlatform; label: string }[] = [
  { value: "direct", label: "Direct Website / Store" },
  { value: "shopify", label: "Shopify" },
  { value: "gumroad", label: "Gumroad" },
  { value: "woocommerce", label: "WooCommerce" },
  { value: "etsy", label: "Etsy" },
  { value: "amazon", label: "Amazon" },
  { value: "daraz", label: "Daraz" },
  { value: "other", label: "Other Platform" },
];

export function AddProductModal({ open, onClose, productToEdit }: AddProductModalProps) {
  const { addProduct, updateProduct } = useFinancialData();

  const [name, setName] = useState("");
  const [type, setType] = useState<ProductType>("physical");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("General");
  const [sellingPrice, setSellingPrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [platform, setPlatform] = useState<ProductPlatform>("direct");
  const [stockQuantity, setStockQuantity] = useState("10");
  const [lowStockThreshold, setLowStockThreshold] = useState("5");
  const [status, setStatus] = useState<ProductStatus>("active");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (productToEdit) {
        setName(productToEdit.name);
        setType(productToEdit.type);
        setSku(productToEdit.sku);
        setCategory(productToEdit.category);
        setSellingPrice(String(productToEdit.selling_price));
        setCostPrice(String(productToEdit.cost_price));
        setPlatform(productToEdit.platform);
        setStockQuantity(String(productToEdit.stock_quantity));
        setLowStockThreshold(String(productToEdit.low_stock_threshold));
        setStatus(productToEdit.status);
        setDescription(productToEdit.description || "");
        setNotes(productToEdit.notes || "");
      } else {
        setName("");
        setType("physical");
        const randomSku = `SKU-${Math.floor(1000 + Math.random() * 9000)}`;
        setSku(randomSku);
        setCategory("General");
        setSellingPrice("");
        setCostPrice("");
        setPlatform("direct");
        setStockQuantity("15");
        setLowStockThreshold("5");
        setStatus("active");
        setDescription("");
        setNotes("");
      }
      setErrors({});
    }
  }, [open, productToEdit]);

  const sellingNum = parseFloat(sellingPrice) || 0;
  const costNum = parseFloat(costPrice) || 0;
  const unitProfit = sellingNum - costNum;
  const marginPercent = sellingNum > 0 ? ((unitProfit / sellingNum) * 100).toFixed(1) : "0.0";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = "Product name is required";
    if (!sku.trim()) newErrors.sku = "SKU is required";
    if (isNaN(sellingNum) || sellingNum <= 0) newErrors.sellingPrice = "Valid selling price is required";
    if (isNaN(costNum) || costNum < 0) newErrors.costPrice = "Valid cost price is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      if (productToEdit) {
        updateProduct(productToEdit.id, {
          name: name.trim(),
          type,
          sku: sku.trim().toUpperCase(),
          category: category.trim() || "General",
          selling_price: sellingNum,
          cost_price: costNum,
          platform,
          stock_quantity: type === "physical" ? parseInt(stockQuantity) || 0 : 0,
          low_stock_threshold: type === "physical" ? parseInt(lowStockThreshold) || 5 : 0,
          status,
          description: description.trim() || null,
          notes: notes.trim() || null,
        });
      } else {
        addProduct({
          name: name.trim(),
          type,
          sku: sku.trim().toUpperCase(),
          category: category.trim() || "General",
          selling_price: sellingNum,
          cost_price: costNum,
          platform,
          stock_quantity: type === "physical" ? parseInt(stockQuantity) || 0 : 0,
          low_stock_threshold: type === "physical" ? parseInt(lowStockThreshold) || 5 : 0,
          status,
          description: description.trim() || undefined,
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
      <DialogContent className="p-0 max-w-xl bg-white border border-[#e2e8f0] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
        <DialogTitle className="sr-only">
          {productToEdit ? "Edit Product" : "Add New Product"}
        </DialogTitle>

        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#f1f5f9] mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#eff6ff] text-[#2563eb] flex items-center justify-center">
                <Package size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#0f172a]">
                  {productToEdit ? "Edit Product" : "Add New Product"}
                </h2>
                <p className="text-xs text-[#64748b]">
                  {productToEdit
                    ? "Update product pricing, inventory thresholds or platform."
                    : "Add a physical or digital product to your sales catalog."}
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
            {/* Product Type Tabs */}
            <div className="grid grid-cols-2 gap-2 bg-[#f8fafc] p-1 rounded-xl border border-[#e2e8f0]">
              <button
                type="button"
                onClick={() => setType("physical")}
                className={`py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition ${
                  type === "physical"
                    ? "bg-white text-[#2563eb] shadow-xs border border-[#cbd5e1]"
                    : "text-[#64748b] hover:text-[#0f172a]"
                }`}
              >
                <Package size={14} />
                Physical Product
              </button>
              <button
                type="button"
                onClick={() => setType("digital")}
                className={`py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition ${
                  type === "digital"
                    ? "bg-white text-[#2563eb] shadow-xs border border-[#cbd5e1]"
                    : "text-[#64748b] hover:text-[#0f172a]"
                }`}
              >
                <Layers size={14} />
                Digital Product / Course
              </button>
            </div>

            {/* Row 1: Name & SKU */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1.5">
                <Label className="text-xs font-semibold text-[#1e293b]">
                  Product Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                  }}
                  placeholder="e.g. Minimalist Leather Cardholder"
                  className={`h-10 rounded-xl bg-white border text-xs text-[#0f172a] ${
                    errors.name ? "border-red-400" : "border-[#e2e8f0]"
                  }`}
                />
                {errors.name && <span className="text-[11px] text-red-500">{errors.name}</span>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#1e293b]">SKU</Label>
                <Input
                  value={sku}
                  onChange={(e) => {
                    setSku(e.target.value.toUpperCase());
                    if (errors.sku) setErrors((prev) => ({ ...prev, sku: "" }));
                  }}
                  placeholder="SKU-1001"
                  className={`h-10 rounded-xl bg-white border text-xs font-mono text-[#0f172a] ${
                    errors.sku ? "border-red-400" : "border-[#e2e8f0]"
                  }`}
                />
              </div>
            </div>

            {/* Row 2: Pricing & Profit Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#1e293b]">
                  Selling Price (Rs.) <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  placeholder="0.00"
                  className="h-10 rounded-xl bg-white border border-[#e2e8f0] text-xs font-bold text-[#0f172a]"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#1e293b]">
                  Cost / COGS (Rs.) <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  placeholder="0.00"
                  className="h-10 rounded-xl bg-white border border-[#e2e8f0] text-xs font-semibold text-[#0f172a]"
                />
              </div>

              <div className="space-y-1 flex flex-col justify-center">
                <span className="text-[10px] uppercase font-bold text-[#64748b] tracking-wider">
                  Profit Margin
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-extrabold ${
                      unitProfit >= 0 ? "text-[#16a34a]" : "text-[#dc2626]"
                    }`}
                  >
                    Rs. {unitProfit.toLocaleString()}
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-white border border-[#e2e8f0] text-[#0f172a]">
                    {marginPercent}%
                  </span>
                </div>
              </div>
            </div>

            {/* Row 3: Platform & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#1e293b]">Sales Platform</Label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as ProductPlatform)}
                  className="w-full h-10 px-3 bg-white border border-[#e2e8f0] rounded-xl text-xs text-[#0f172a] outline-none"
                >
                  {PLATFORMS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#1e293b]">Category</Label>
                <Input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Leather Goods, Courses, Templates"
                  className="h-10 rounded-xl bg-white border border-[#e2e8f0] text-xs text-[#0f172a]"
                />
              </div>
            </div>

            {/* Row 4: Inventory Settings (Only for physical products) */}
            {type === "physical" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#fff7ed] border border-[#ffedd5] rounded-xl">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#9a3412]">Current Stock</Label>
                  <Input
                    type="number"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    placeholder="10"
                    className="h-10 rounded-xl bg-white border border-[#fed7aa] text-xs font-bold text-[#0f172a]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#9a3412]">
                    Low Stock Alert Threshold
                  </Label>
                  <Input
                    type="number"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(e.target.value)}
                    placeholder="5"
                    className="h-10 rounded-xl bg-white border border-[#fed7aa] text-xs text-[#0f172a]"
                  />
                </div>
              </div>
            )}

            {/* Row 5: Description */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#1e293b]">
                Description <span className="text-[#94a3b8] font-normal">(Optional)</span>
              </Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Product specs, features, delivery notes..."
                className="h-10 rounded-xl bg-white border border-[#e2e8f0] text-xs text-[#0f172a]"
              />
            </div>

            {/* Form Actions */}
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
                className="h-10 px-6 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold shadow-xs"
              >
                {saving ? "Saving..." : productToEdit ? "Update Product" : "Add Product"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
