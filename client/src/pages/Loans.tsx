import { useState } from "react";
import { Landmark, Plus, Trash2, Search, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { LedgerIllustration } from "@/components/LedgerIllustration";
import { useFinancialData } from "@/contexts/FinancialDataContext";

export default function Loans() {
  const { loans, addLoan, updateLoan, deleteLoan, addTransaction } = useFinancialData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRepayModal, setShowRepayModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [repayAmount, setRepayAmount] = useState("");

  const [lender, setLender] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [dueDate, setDueDate] = useState("");

  const totalBorrowed = loans.reduce((sum, l) => sum + Number(l.principal_amount || 0), 0);
  const totalRemaining = loans.reduce((sum, l) => sum + Number(l.remaining_amount || 0), 0);
  const totalRepaid = totalBorrowed - totalRemaining;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lender.trim() || !amount || parseFloat(amount) <= 0) return;

    const numAmt = parseFloat(amount);
    addLoan({
      lender: lender.trim(),
      principal_amount: numAmt,
      remaining_amount: numAmt,
      reason: reason.trim() || undefined,
      due_date: dueDate || undefined,
    });

    setLender("");
    setAmount("");
    setReason("");
    setDueDate("");
    setShowAddModal(false);
  };

  const handleRepay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoan || !repayAmount || parseFloat(repayAmount) <= 0) return;

    const amt = parseFloat(repayAmount);
    const newRemaining = Math.max(0, Number(selectedLoan.remaining_amount) - amt);
    const status = newRemaining === 0 ? "paid" : "active";

    updateLoan(selectedLoan.id, {
      remaining_amount: newRemaining,
      status,
    });

    addTransaction({
      description: `Loan Repayment - ${selectedLoan.lender}`,
      amount: amt,
      type: "loan_repayment",
      date: new Date().toISOString().split("T")[0],
      category: "Loan Repayment",
      payment_method: "bank_transfer",
      reference_id: selectedLoan.id,
    });

    setShowRepayModal(false);
    setRepayAmount("");
  };

  return (
    <div className="module-card card-surface">
      {/* Module Hero */}
      <div className="module-hero">
        <div className="module-icon">
          <Landmark size={20} />
        </div>
        <div>
          <div className="eyebrow">FINTRACK MODULE</div>
          <h2>Loans / Qarza</h2>
          <p>Track borrowed liabilities, debt schedules, repayment records, and lender balances.</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="primary-btn">
          <Plus size={16} />
          Record loan
        </Button>
      </div>

      {/* 3-Column Stats Row */}
      <div className="module-stats">
        <div>
          <span>TOTAL BORROWED</span>
          <b>Rs. {totalBorrowed.toLocaleString()}</b>
        </div>
        <div>
          <span>TOTAL REPAID</span>
          <b>Rs. {totalRepaid.toLocaleString()}</b>
        </div>
        <div>
          <span>OUTSTANDING DEBT</span>
          <b>Rs. {totalRemaining.toLocaleString()}</b>
        </div>
      </div>

      {/* Main Body */}
      {loans.length === 0 ? (
        <div className="empty-table">
          <div className="empty-marker">✦</div>
          <LedgerIllustration />
          <div>
            <h3>Your loans workspace is clear</h3>
            <p>Choose a first record and we'll keep the next step visible.</p>
          </div>
          <Button onClick={() => setShowAddModal(true)} className="primary-btn">
            <Plus size={16} />
            Add first loan
          </Button>
        </div>
      ) : (
        <div className="pt-6 space-y-4">
          <div className="border border-[#eef2f7] rounded-xl overflow-hidden bg-white">
            <table className="w-full text-left text-xs text-[#334155]">
              <thead className="bg-[#f8fafc] border-b border-[#eef2f7]">
                <tr className="text-[11px] font-semibold text-[#8b98aa] uppercase tracking-wider">
                  <th className="py-3 px-4">Lender / Source</th>
                  <th className="py-3 px-3">Purpose</th>
                  <th className="py-3 px-3 text-right">Principal</th>
                  <th className="py-3 px-3 text-right">Remaining</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {loans.map((l) => (
                  <tr key={l.id} className="hover:bg-[#fbfcfe] transition">
                    <td className="py-3.5 px-4 font-semibold text-[#0f172a]">{l.lender}</td>
                    <td className="py-3.5 px-3 text-[#64748b]">{l.reason || "General loan"}</td>
                    <td className="py-3.5 px-3 text-right font-medium">Rs. {Number(l.principal_amount).toLocaleString()}</td>
                    <td className="py-3.5 px-3 text-right font-bold text-xs text-[#dc2626]">
                      Rs. {Number(l.remaining_amount).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          l.status === "paid"
                            ? "bg-[#ecfdf5] text-[#059669]"
                            : "bg-[#fff1f2] text-[#e11d48]"
                        }`}
                      >
                        {l.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {l.status !== "paid" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedLoan(l);
                            setShowRepayModal(true);
                          }}
                          className="h-8 text-[11px] px-2.5 rounded-lg border-[#e2e8f0]"
                        >
                          + Repay
                        </Button>
                      )}
                      <button
                        onClick={() => deleteLoan(l.id)}
                        className="text-[#94a3b8] hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Loan Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-[440px] p-6 rounded-2xl bg-white border border-[#e2e8f0] shadow-2xl">
          <DialogTitle className="text-lg font-bold text-[#0f172a]">Record Loan / Qarza</DialogTitle>
          <form onSubmit={handleCreate} className="space-y-3.5 mt-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-[#1e293b]">Lender / Provider Name</Label>
              <Input
                value={lender}
                onChange={(e) => setLender(e.target.value)}
                placeholder="e.g. Bank Alfalah or Hamza"
                required
                className="h-10 text-xs rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-[#1e293b]">Principal Amount (Rs.)</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100000"
                required
                className="h-10 text-xs rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-[#1e293b]">Reason / Purpose</Label>
              <Input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Working capital / equipment purchase"
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
                Save Loan
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Repay Modal */}
      <Dialog open={showRepayModal} onOpenChange={setShowRepayModal}>
        <DialogContent className="max-w-[400px] p-6 rounded-2xl bg-white border border-[#e2e8f0] shadow-2xl">
          <DialogTitle className="text-lg font-bold text-[#0f172a]">
            Record Repayment - {selectedLoan?.lender}
          </DialogTitle>
          <form onSubmit={handleRepay} className="space-y-3.5 mt-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-[#1e293b]">Amount Repaid (Rs.)</Label>
              <Input
                type="number"
                value={repayAmount}
                onChange={(e) => setRepayAmount(e.target.value)}
                placeholder="Enter repayment amount"
                required
                autoFocus
                className="h-10 text-xs rounded-xl"
              />
            </div>
            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setShowRepayModal(false)}
                className="px-3.5 py-2 text-xs font-medium text-[#475569] hover:bg-[#f1f5f9] rounded-xl"
              >
                Cancel
              </button>
              <Button type="submit" className="h-10 px-4 bg-[#2563eb] text-white text-xs rounded-xl font-semibold">
                Confirm Repayment
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
