import { useState } from "react";
import { Users, Plus, Trash2, Search, Building2, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { LedgerIllustration } from "@/components/LedgerIllustration";
import { useFinancialData } from "@/contexts/FinancialDataContext";

export default function Clients() {
  const { clients, addClient, deleteClient, projects } = useFinancialData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addClient({
      name: name.trim(),
      company: company.trim() || undefined,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
    });

    setName("");
    setCompany("");
    setEmail("");
    setPhone("");
    setShowAddModal(false);
  };

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.company && c.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="module-card card-surface">
      {/* Module Hero */}
      <div className="module-hero">
        <div className="module-icon">
          <Users size={20} />
        </div>
        <div>
          <div className="eyebrow">FINTRACK MODULE</div>
          <h2>Clients</h2>
          <p>Manage customer contacts, companies, invoices, and billing relationships.</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="primary-btn">
          <Plus size={16} />
          Add client
        </Button>
      </div>

      {/* 3-Column Stats Row */}
      <div className="module-stats">
        <div>
          <span>TOTAL CLIENTS</span>
          <b>{clients.length}</b>
        </div>
        <div>
          <span>ACTIVE PROJECTS</span>
          <b>{projects.filter((p) => p.status === "active").length}</b>
        </div>
        <div>
          <span>COMPANIES</span>
          <b>{new Set(clients.map((c) => c.company).filter(Boolean)).size}</b>
        </div>
      </div>

      {/* Main Body */}
      {clients.length === 0 ? (
        <div className="empty-table">
          <div className="empty-marker">✦</div>
          <LedgerIllustration />
          <div>
            <h3>Your clients workspace is clear</h3>
            <p>Choose a first record and we'll keep the next step visible.</p>
          </div>
          <Button onClick={() => setShowAddModal(true)} className="primary-btn">
            <Plus size={16} />
            Add first client
          </Button>
        </div>
      ) : (
        <div className="pt-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
              <Input
                placeholder="Search clients or company..."
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
                  <th className="py-3 px-4">Client Name</th>
                  <th className="py-3 px-3">Company</th>
                  <th className="py-3 px-3">Email</th>
                  <th className="py-3 px-3">Phone</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {filteredClients.map((c) => (
                  <tr key={c.id} className="hover:bg-[#fbfcfe] transition">
                    <td className="py-3.5 px-4 font-semibold text-[#0f172a]">{c.name}</td>
                    <td className="py-3.5 px-3 text-[#64748b]">{c.company || "Individual"}</td>
                    <td className="py-3.5 px-3 text-[#64748b]">{c.email || "—"}</td>
                    <td className="py-3.5 px-3 text-[#64748b]">{c.phone || "—"}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => deleteClient(c.id)}
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

      {/* Add Client Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-[440px] p-6 rounded-2xl bg-white border border-[#e2e8f0] shadow-2xl">
          <DialogTitle className="text-lg font-bold text-[#0f172a]">Add New Client</DialogTitle>
          <form onSubmit={handleCreate} className="space-y-3.5 mt-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-[#1e293b]">Client / Contact Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                required
                className="h-10 text-xs rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-[#1e293b]">Company / Organization</Label>
              <Input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Apex Digital Ltd."
                className="h-10 text-xs rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-[#1e293b]">Email Address</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@company.com"
                className="h-10 text-xs rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-[#1e293b]">Phone Number</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+92 300 1234567"
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
                Save Client
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
