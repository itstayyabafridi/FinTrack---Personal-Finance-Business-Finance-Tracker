import { useState } from "react";
import { CreditCard, Plus, Trash2, Search, ArrowUpDown, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LedgerIllustration } from "@/components/LedgerIllustration";
import { useFinancialData } from "@/contexts/FinancialDataContext";
import { useAppLayout } from "@/components/layout/AppLayout";

export default function Expenses() {
  const { expenses, deleteExpense, totalExpenses } = useFinancialData();
  const { openAddModal } = useAppLayout();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredExpenses = expenses.filter((e) =>
    e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { label: "RECORDS", value: expenses.length },
    { label: "TOTAL EXPENSES", value: `Rs. ${totalExpenses.toLocaleString()}` },
    { label: "CATEGORIES", value: new Set(expenses.map(e => e.category)).size },
  ];

  return (
    <div className="module-card card-surface">
      {/* Module Hero */}
      <div className="module-hero">
        <div className="module-icon">
          <CreditCard size={20} />
        </div>
        <div>
          <div className="eyebrow">FINTRACK MODULE</div>
          <h2>Expenses</h2>
          <p>
            Track and categorize all your business and personal expenses to keep books in balance.
          </p>
        </div>
        <Button onClick={openAddModal} className="primary-btn">
          <Plus size={16} />
          Add expense
        </Button>
      </div>

      {/* 3-Column Stats Row */}
      <div className="module-stats">
        {stats.map((stat, idx) => (
          <div key={idx}>
            <span>{stat.label}</span>
            <b>{stat.value}</b>
          </div>
        ))}
      </div>

      {/* Main Body */}
      {expenses.length === 0 ? (
        <div className="empty-table">
          <div className="empty-marker">✦</div>
          <LedgerIllustration />
          <div>
            <h3>Your expenses workspace is clear</h3>
            <p>Choose a first record and we'll keep the next step visible.</p>
          </div>
          <Button onClick={openAddModal} className="primary-btn">
            <Plus size={16} />
            Add first record
          </Button>
        </div>
      ) : (
        <div className="pt-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]"
              />
              <Input
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-10 bg-[#f8fbfe] border-[#e2e8f0] text-xs rounded-xl"
              />
            </div>
          </div>

          <div className="border border-[#eef2f7] rounded-xl overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#334155]">
                <thead className="bg-[#f8fafc] border-b border-[#eef2f7]">
                  <tr className="text-[11px] font-semibold text-[#8b98aa] uppercase tracking-wider">
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Method</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3 text-right">Amount</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9]">
                  {filteredExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-[#fbfcfe] transition">
                      <td className="py-3.5 px-4 font-medium text-[#0f172a]">
                        {exp.description}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2.5 py-1 rounded-md bg-[#fff1f2] text-[#e11d48] text-[11px] font-medium">
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 capitalize text-[#64748b]">
                        {exp.payment_method.replace("_", " ")}
                      </td>
                      <td className="py-3.5 px-3 text-[#64748b]">{exp.date}</td>
                      <td className="py-3.5 px-3 text-right font-bold text-xs text-[#dc2626]">
                        Rs. {Number(exp.amount).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => deleteExpense(exp.id)}
                          className="text-[#94a3b8] hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition"
                          title="Delete expense"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
