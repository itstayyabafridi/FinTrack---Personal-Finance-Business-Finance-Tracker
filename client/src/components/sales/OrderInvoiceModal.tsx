import { X, Printer, Download, CheckCircle, Package, User, CreditCard } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Order } from "@shared/types";

interface OrderInvoiceModalProps {
  open: boolean;
  onClose: () => void;
  order: Order | null;
}

export function OrderInvoiceModal({ open, onClose, order }: OrderInvoiceModalProps) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="p-0 max-w-xl bg-white border border-[#e2e8f0] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
        <DialogTitle className="sr-only">Order Invoice #{order.order_number}</DialogTitle>

        <div className="p-6 max-h-[85vh] overflow-y-auto print:p-0">
          {/* Action Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#f1f5f9] mb-5 print:hidden">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#0f172a]">Invoice / Receipt Preview</span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-[#eff6ff] text-[#2563eb]">
                #{order.order_number}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="h-8 text-xs px-3 rounded-lg border-[#cbd5e1] text-[#0f172a] hover:bg-[#f8fafc]"
              >
                <Printer size={13} className="mr-1.5" /> Print / Save PDF
              </Button>
              <button
                type="button"
                onClick={onClose}
                className="text-[#94a3b8] hover:text-[#475569] hover:bg-[#f1f5f9] p-1.5 rounded-lg transition"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Printable Invoice Container */}
          <div className="bg-[#fcfdfe] border border-[#e2e8f0] rounded-xl p-6 space-y-6">
            {/* Top Brand Bar */}
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-xl font-black text-[#0f172a] tracking-tight">FinTrack Commerce</h1>
                <p className="text-xs text-[#64748b] mt-0.5">Sales & Commercial Operations</p>
                <p className="text-[11px] text-[#94a3b8] mt-1">Order Date: {order.order_date}</p>
              </div>

              <div className="text-right">
                <div className="text-xs uppercase font-extrabold text-[#94a3b8] tracking-wider">
                  Invoice
                </div>
                <div className="text-sm font-mono font-bold text-[#0f172a]">
                  #{order.order_number}
                </div>
                <div className="mt-1">
                  <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-md bg-[#dcfce7] text-[#15803d]">
                    Payment: {order.payment_status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Bill To & Channel Info */}
            <div className="grid grid-cols-2 gap-4 p-3 bg-white border border-[#edf2f7] rounded-lg">
              <div>
                <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider block mb-1">
                  Billed To
                </span>
                <p className="text-xs font-bold text-[#0f172a]">{order.customer_name}</p>
                {order.customer_email && (
                  <p className="text-[11px] text-[#64748b]">{order.customer_email}</p>
                )}
                {order.customer_phone && (
                  <p className="text-[11px] text-[#64748b]">{order.customer_phone}</p>
                )}
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider block mb-1">
                  Channel & Delivery
                </span>
                <p className="text-xs font-semibold text-[#0f172a] capitalize">
                  Platform: {order.platform}
                </p>
                <p className="text-[11px] text-[#64748b] capitalize">
                  Fulfillment: {order.order_status}
                </p>
                <p className="text-[11px] text-[#64748b] capitalize">
                  Method: {order.payment_method.replace("_", " ")}
                </p>
              </div>
            </div>

            {/* Items Table */}
            <div className="space-y-1">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#e2e8f0] text-[10px] font-bold text-[#64748b] uppercase tracking-wider">
                    <th className="pb-2">Item Description</th>
                    <th className="pb-2 text-center">SKU</th>
                    <th className="pb-2 text-center">Qty</th>
                    <th className="pb-2 text-right">Unit Price</th>
                    <th className="pb-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9]">
                  {order.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 font-medium text-[#0f172a]">{item.product_name}</td>
                      <td className="py-2.5 text-center font-mono text-[11px] text-[#64748b]">
                        {item.product_sku || "-"}
                      </td>
                      <td className="py-2.5 text-center font-bold text-[#0f172a]">
                        {item.quantity}
                      </td>
                      <td className="py-2.5 text-right text-[#475569]">
                        Rs. {item.unit_price.toLocaleString()}
                      </td>
                      <td className="py-2.5 text-right font-bold text-[#0f172a]">
                        Rs. {item.total_price.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Totals */}
            <div className="border-t border-[#e2e8f0] pt-3 flex justify-end">
              <div className="w-64 space-y-1.5 text-xs">
                <div className="flex justify-between text-[#64748b]">
                  <span>Subtotal:</span>
                  <span>Rs. {order.subtotal.toLocaleString()}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-[#dc2626]">
                    <span>Discount:</span>
                    <span>- Rs. {order.discount.toLocaleString()}</span>
                  </div>
                )}
                {order.shipping_cost > 0 && (
                  <div className="flex justify-between text-[#64748b]">
                    <span>Shipping:</span>
                    <span>+ Rs. {order.shipping_cost.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-sm text-[#0f172a] border-t border-[#e2e8f0] pt-2">
                  <span>Grand Total:</span>
                  <span className="text-[#2563eb]">Rs. {order.total_revenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[11px] text-[#16a34a] font-semibold pt-1 border-t border-dashed border-[#e2e8f0]">
                  <span>Real Net Profit:</span>
                  <span>Rs. {order.actual_profit.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-[10px] text-[#94a3b8] pt-3 border-t border-[#f1f5f9]">
              Thank you for your business! Generated by FinTrack Personal & Business Finance OS.
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
