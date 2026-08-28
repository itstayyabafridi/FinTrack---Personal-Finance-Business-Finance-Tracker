import { useState, useMemo } from "react";
import {
  Tags,
  Plus,
  Search,
  Filter,
  Trash2,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LedgerIllustration } from "@/components/LedgerIllustration";
import { useFinancialData } from "@/contexts/FinancialDataContext";
import { useAppLayout } from "@/components/layout/AppLayout";
import type { TransactionType } from "@shared/types";

export default function Transactions() {
  const { transactions, deleteTransaction, totalIncome, totalExpenses } = useFinancialData();
  const { openAddModal } = useAppLayout();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        const matchesSearch =
          t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (t.category && t.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
          t.payment_method.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType =
          typeFilter === "all" ||
          (typeFilter === "income" &&
            ["income", "other_income", "student_fee", "client_payment"].includes(t.type)) ||
          (typeFilter === "expense" && t.type === "expense") ||
          (typeFilter === "other" && ["owner_payment", "loan_received", "loan_repayment"].includes(t.type));

        return matchesSearch && matchesType;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
      });
  }, [transactions, searchTerm, typeFilter, sortOrder]);

  const stats = [
    { label: "RECORDS", value: transactions.length },
    { label: "TOTAL INFLOW", value: `Rs. ${totalIncome.toLocaleString()}` },
    { label: "TOTAL OUTFLOW", value: `Rs. ${totalExpenses.toLocaleString()}` },
  ];

  const exportCSV = () => {
    if (transactions.length === 0) return;
    const headers = ["Description,Type,Category,Payment Method,Date,Amount,Notes\n"];
    const rows = transactions.map(
      (t) =>
        `"${t.description}","${t.type}","${t.category || ""}","${t.payment_method}","${t.date}","${t.amount}","${t.notes || ""}"\n`
    );
    const blob = new Blob([headers.concat(rows).join("")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fintrack-transactions-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="module-card card-surface">
      {/* Module Hero */}
      <div className="module-hero">
        <div className="module-icon">
          <Tags size={20} />
        </div>
        <div>
          <div className="eyebrow">FINTRACK MODULE</div>
          <h2>Transactions</h2>
          <p>
            This workspace is ready for your records. Add an entry to keep your personal and
            business books connected.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {transactions.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={exportCSV}
              className="h-10 px-3 text-xs gap-1.5 border-[#e2e8f0]"
            >
              <Download size={14} />
              Export
            </Button>
          )}
          <Button onClick={openAddModal} className="primary-btn">
            <Plus size={16} />
            Add record
          </Button>
        </div>
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
      {transactions.length === 0 ? (
        <div className="empty-table">
          <div className="empty-marker">✦</div>
          <LedgerIllustration />
          <div>
            <h3>Your ledger is waiting for its first signal</h3>
            <p>Choose a first record and we'll keep the next step visible.</p>
          </div>
          <Button onClick={openAddModal} className="primary-btn">
            <Plus size={16} />
            Add first record
          </Button>
        </div>
      ) : (
        <div className="pt-6 space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]"
              />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-10 bg-[#f8fbfe] border-[#e2e8f0] text-xs rounded-xl"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex bg-[#f1f5f9] p-1 rounded-xl text-xs">
                {[
                  { id: "all", label: "All" },
                  { id: "income", label: "Inflow" },
                  { id: "expense", label: "Outflow" },
                  { id: "other", label: "Other" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setTypeFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition ${
                      typeFilter === tab.id
                        ? "bg-white text-[#0f172a] shadow-sm font-semibold"
                        : "text-[#64748b] hover:text-[#0f172a]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                className="h-9 px-3 text-xs border-[#e2e8f0] rounded-xl gap-1"
              >
                <ArrowUpDown size={13} />
                {sortOrder === "desc" ? "Newest" : "Oldest"}
              </Button>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="border border-[#eef2f7] rounded-xl overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#334155]">
                <thead className="bg-[#f8fafc] border-b border-[#eef2f7]">
                  <tr className="text-[11px] font-semibold text-[#8b98aa] uppercase tracking-wider">
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Method</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3 text-right">Amount</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9]">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-[#8b98aa]">
                        No matching transactions found.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((tx) => {
                      const isPositive = [
                        "income",
                        "other_income",
                        "student_fee",
                        "client_payment",
                      ].includes(tx.type);
                      return (
                        <tr key={tx.id} className="hover:bg-[#fbfcfe] transition">
                          <td className="py-3.5 px-4 font-medium text-[#0f172a]">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                  isPositive ? "bg-[#ecfdf5] text-[#059669]" : "bg-[#fef2f2] text-[#dc2626]"
                                }`}
                              >
                                {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                              </div>
                              <div>
                                <span className="font-semibold block">{tx.description}</span>
                                {tx.notes && (
                                  <span className="text-[11px] text-[#94a3b8] block">{tx.notes}</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-3">
                            <span className="capitalize text-[#475569] font-medium">
                              {tx.type.replace("_", " ")}
                            </span>
                          </td>
                          <td className="py-3.5 px-3">
                            <span className="px-2.5 py-1 rounded-md bg-[#eff6ff] text-[#2563eb] text-[11px] font-medium">
                              {tx.category || "General"}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 capitalize text-[#64748b]">
                            {tx.payment_method.replace("_", " ")}
                          </td>
                          <td className="py-3.5 px-3 text-[#64748b]">{tx.date}</td>
                          <td
                            className={`py-3.5 px-3 text-right font-bold text-xs ${
                              isPositive ? "text-[#059669]" : "text-[#dc2626]"
                            }`}
                          >
                            {isPositive ? "+" : "-"} Rs. {Number(tx.amount).toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => deleteTransaction(tx.id)}
                              className="text-[#94a3b8] hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition"
                              title="Delete transaction"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
