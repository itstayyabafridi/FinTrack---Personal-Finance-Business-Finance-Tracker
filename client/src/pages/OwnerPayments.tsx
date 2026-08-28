import { useState } from "react";
import { HandCoins, Plus, Trash2, Search, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { LedgerIllustration } from "@/components/LedgerIllustration";
import { useFinancialData } from "@/contexts/FinancialDataContext";

export default function OwnerPayments() {
  const { ownerPayments, addOwnerPayment, deleteOwnerPayment, owners } = useFinancialData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [recipientName, setRecipientName] = useState("Tayyab Afridi");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<any>("bank_transfer");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);

  const totalDistributed = ownerPayments.reduce((sum, o) => sum + Number(o.amount || 0), 0);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    addOwnerPayment({
      recipient_name: recipientName.trim() || "Tayyab Afridi",
      amount: parseFloat(amount),
      date,
      payment_method: paymentMethod,
      notes: notes.trim() || undefined,
    });

    setAmount("");
    setNotes("");
    setShowAddModal(false);
  };

  return (
    <div className="module-card card-surface">
      {/* Module Hero */}
      <div className="module-hero">
        <div className="module-icon">
          <HandCoins size={20} />
        </div>
        <div>
          <div className="eyebrow">FINTRACK MODULE</div>
          <h2>Owner Payments</h2>
          <p>Track profit payouts, partner dividends, and personal withdrawals from the business.</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="primary-btn">
          <Plus size={16} />
          Record payment
        </Button>
      </div>

      {/* 3-Column Stats Row */}
      <div className="module-stats">
        <div>
          <span>TOTAL DISTRIBUTED</span>
          <b>Rs. {totalDistributed.toLocaleString()}</b>
        </div>
        <div>
          <span>RECORDED PAYMENTS</span>
          <b>{ownerPayments.length}</b>
        </div>
        <div>
          <span>ACTIVE PARTNERS</span>
          <b>{owners.length}</b>
        </div>
      </div>

      {/* Main Body */}
      {ownerPayments.length === 0 ? (
        <div className="empty-table">
          <div className="empty-marker">✦</div>
          <LedgerIllustration />
          <div>
            <h3>Your owner payments workspace is clear</h3>
            <p>Choose a first record and we'll keep the next step visible.</p>
          </div>
          <Button onClick={() => setShowAddModal(true)} className="primary-btn">
            <Plus size={16} />
            Add first payment
          </Button>
        </div>
      ) : (
        <div className="pt-6 space-y-4">
          <div className="border border-[#eef2f7] rounded-xl overflow-hidden bg-white">
            <table className="w-full text-left text-xs text-[#334155]">
              <thead className="bg-[#f8fafc] border-b border-[#eef2f7]">
                <tr className="text-[11px] font-semibold text-[#8b98aa] uppercase tracking-wider">
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Method</th>
                  <th className="py-3 px-3">Notes</th>
                  <th className="py-3 px-3 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {ownerPayments.map((p) => {
                  const displayName =
                    p.recipient_name ||
                    (p.notes?.includes("Recipient:")
                      ? p.notes.split("Recipient:")[1]?.split(",")[0]?.trim()
                      : null) ||
                    "Tayyab (Owner Draw)";

                  return (
                    <tr key={p.id} className="hover:bg-[#fbfcfe] transition">
                      <td className="py-3.5 px-4 font-semibold text-[#0f172a]">{displayName}</td>
                      <td className="py-3.5 px-3 text-[#64748b]">{p.date}</td>
                      <td className="py-3.5 px-3 capitalize text-[#64748b]">{p.payment_method.replace("_", " ")}</td>
                      <td className="py-3.5 px-3 text-[#64748b]">{p.notes || "Regular distribution"}</td>
                      <td className="py-3.5 px-3 text-right font-bold text-xs text-[#2563eb]">
                        Rs. {Number(p.amount).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => deleteOwnerPayment(p.id)}
                          className="text-[#94a3b8] hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Owner Payment Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-[440px] p-6 rounded-2xl bg-white border border-[#e2e8f0] shadow-2xl">
          <DialogTitle className="text-lg font-bold text-[#0f172a]">Record Owner Payment</DialogTitle>
          <form onSubmit={handleCreate} className="space-y-3.5 mt-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-[#1e293b]">Receiver / Partner Name</Label>
              <Input
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="e.g. Tayyab Afridi or Partner Name"
                required
                className="h-10 text-xs rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-[#1e293b]">Amount (Rs.)</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="25000"
                required
                className="h-10 text-xs rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-[#1e293b]">Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-10 text-xs rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-[#1e293b]">Notes / Purpose</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Monthly owner dividend"
                className="h-10 text-xs rounded-xl"
              />
            </div>
            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3.5 py-2 text-xs font-medium text-[#475569] hover:bg-[#f1f5f9] rounded-xl"
              >
                Cancel
              </button>
              <Button type="submit" className="h-10 px-4 bg-[#2563eb] text-white text-xs rounded-xl font-semibold">
                Save Payment
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
