import { useState } from "react";
import { FolderGit2, Plus, Trash2, Search, CheckCircle2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { LedgerIllustration } from "@/components/LedgerIllustration";
import { useFinancialData } from "@/contexts/FinancialDataContext";

export default function Projects() {
  const { projects, addProject, deleteProject, addTransaction, clients } = useFinancialData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [name, setName] = useState("");
  const [clientId, setClientId] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [initialReceived, setInitialReceived] = useState("");

  const totalProjectValue = projects.reduce((sum, p) => sum + Number(p.total_amount || 0), 0);
  const totalReceived = projects.reduce((sum, p) => sum + Number(p.received_amount || 0), 0);
  const totalOutstanding = totalProjectValue - totalReceived;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !totalAmount) return;

    const prj = addProject({
      name: name.trim(),
      client_id: clientId || undefined,
      total_amount: parseFloat(totalAmount) || 0,
      received_amount: parseFloat(initialReceived) || 0,
      status: "active",
    });

    if (parseFloat(initialReceived) > 0) {
      addTransaction({
        description: `Project Payment - ${name.trim()}`,
        amount: parseFloat(initialReceived),
        type: "client_payment",
        date: new Date().toISOString().split("T")[0],
        category: "Client Payment",
        payment_method: "bank_transfer",
        reference_id: prj.id,
      });
    }

    setName("");
    setClientId("");
    setTotalAmount("");
    setInitialReceived("");
    setShowAddModal(false);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !paymentAmount || parseFloat(paymentAmount) <= 0) return;

    const amt = parseFloat(paymentAmount);
    selectedProject.received_amount = (Number(selectedProject.received_amount) || 0) + amt;

    addTransaction({
      description: `Project Milestone - ${selectedProject.name}`,
      amount: amt,
      type: "client_payment",
      date: new Date().toISOString().split("T")[0],
      category: "Milestone Payment",
      payment_method: "bank_transfer",
      reference_id: selectedProject.id,
    });

    setShowPaymentModal(false);
    setPaymentAmount("");
  };

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="module-card card-surface">
      {/* Module Hero */}
      <div className="module-hero">
        <div className="module-icon">
          <FolderGit2 size={20} />
        </div>
        <div>
          <div className="eyebrow">FINTRACK MODULE</div>
          <h2>Projects</h2>
          <p>Track project deliverables, total contracted budget, milestone invoices, and receipts.</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="primary-btn">
          <Plus size={16} />
          Add project
        </Button>
      </div>

      {/* 3-Column Stats Row */}
      <div className="module-stats">
        <div>
          <span>TOTAL BUDGET</span>
          <b>Rs. {totalProjectValue.toLocaleString()}</b>
        </div>
        <div>
          <span>COLLECTED</span>
          <b>Rs. {totalReceived.toLocaleString()}</b>
        </div>
        <div>
          <span>UNPAID MILESTONES</span>
          <b>Rs. {totalOutstanding.toLocaleString()}</b>
        </div>
      </div>

      {/* Main Body */}
      {projects.length === 0 ? (
        <div className="empty-table">
          <div className="empty-marker">✦</div>
          <LedgerIllustration />
          <div>
            <h3>Your projects workspace is clear</h3>
            <p>Choose a first record and we'll keep the next step visible.</p>
          </div>
          <Button onClick={() => setShowAddModal(true)} className="primary-btn">
            <Plus size={16} />
            Add first project
          </Button>
        </div>
      ) : (
        <div className="pt-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-10 bg-[#f8fbfe] border-[#e2e8f0] text-xs rounded-xl"
              />
            </div>
          </div>

          <div className="border border-[#eef2f7] rounded-xl overflow-hidden bg-white">
            <table className="w-full text-left text-xs text-[#334155]">
              <thead className="bg-[#f8fafc] border-b border-[#eef2f7]">
                <tr className="text-[11px] font-semibold text-[#8b98aa] uppercase tracking-wider">
                  <th className="py-3 px-4">Project Name</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Contract Budget</th>
                  <th className="py-3 px-3 text-right">Received</th>
                  <th className="py-3 px-3 text-right">Remaining</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {filteredProjects.map((p) => {
                  const remaining = Number(p.total_amount) - Number(p.received_amount || 0);
                  return (
                    <tr key={p.id} className="hover:bg-[#fbfcfe] transition">
                      <td className="py-3.5 px-4 font-semibold text-[#0f172a]">{p.name}</td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded-full bg-[#ecfdf5] text-[#059669] text-[10px] font-bold uppercase">
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right font-medium">Rs. {Number(p.total_amount).toLocaleString()}</td>
                      <td className="py-3.5 px-3 text-right text-[#059669] font-medium">Rs. {Number(p.received_amount || 0).toLocaleString()}</td>
                      <td className="py-3.5 px-3 text-right font-bold text-xs">
                        {remaining <= 0 ? (
                          <span className="text-[#059669]">Paid</span>
                        ) : (
                          <span className="text-[#ea580c]">Rs. {remaining.toLocaleString()}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        {remaining > 0 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedProject(p);
                              setShowPaymentModal(true);
                            }}
                            className="h-8 text-[11px] px-2.5 rounded-lg border-[#e2e8f0]"
                          >
                            + Milestone
                          </Button>
                        )}
                        <button
                          onClick={() => deleteProject(p.id)}
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

      {/* Add Project Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-[460px] p-6 rounded-2xl bg-white border border-[#e2e8f0] shadow-2xl">
          <DialogTitle className="text-lg font-bold text-[#0f172a]">Add New Project</DialogTitle>
          <form onSubmit={handleCreate} className="space-y-3.5 mt-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-[#1e293b]">Project Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Mobile Banking App"
                required
                className="h-10 text-xs rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-[#1e293b]">Total Budget (Rs.)</Label>
                <Input
                  type="number"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  placeholder="150000"
                  required
                  className="h-10 text-xs rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-[#1e293b]">Initial Paid (Rs.)</Label>
                <Input
                  type="number"
                  value={initialReceived}
                  onChange={(e) => setInitialReceived(e.target.value)}
                  placeholder="50000"
                  className="h-10 text-xs rounded-xl"
                />
              </div>
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
                Save Project
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Record Milestone Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="max-w-[400px] p-6 rounded-2xl bg-white border border-[#e2e8f0] shadow-2xl">
          <DialogTitle className="text-lg font-bold text-[#0f172a]">
            Record Milestone - {selectedProject?.name}
          </DialogTitle>
          <form onSubmit={handleRecordPayment} className="space-y-3.5 mt-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-[#1e293b]">Amount Received (Rs.)</Label>
              <Input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Enter amount"
                required
                autoFocus
                className="h-10 text-xs rounded-xl"
              />
            </div>
            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="px-3.5 py-2 text-xs font-medium text-[#475569] hover:bg-[#f1f5f9] rounded-xl"
              >
                Cancel
              </button>
              <Button type="submit" className="h-10 px-4 bg-[#2563eb] text-white text-xs rounded-xl font-semibold">
                Record Payment
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
