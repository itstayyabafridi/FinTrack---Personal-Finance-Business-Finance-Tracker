import { useMemo } from "react";
import { BarChart3, Download, TrendingUp, TrendingDown, DollarSign, PieChart, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LedgerIllustration } from "@/components/LedgerIllustration";
import { useFinancialData } from "@/contexts/FinancialDataContext";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";

export default function Reports() {
  const { transactions, totalIncome, totalExpenses, netProfit, receivables, payables } =
    useFinancialData();

  // Category breakdown calculation
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, { income: number; expense: number }> = {};
    transactions.forEach((tx) => {
      const cat = tx.category || "General";
      if (!map[cat]) map[cat] = { income: 0, expense: 0 };
      const amt = Number(tx.amount || 0);
      if (["income", "other_income", "student_fee", "client_payment"].includes(tx.type)) {
        map[cat].income += amt;
      } else if (tx.type === "expense") {
        map[cat].expense += amt;
      }
    });

    return Object.entries(map).map(([name, val]) => ({
      name,
      income: val.income,
      expense: val.expense,
      total: val.income + val.expense,
    })).sort((a, b) => b.total - a.total).slice(0, 6);
  }, [transactions]);

  const stats = [
    { label: "NET PROFIT", value: `Rs. ${netProfit.toLocaleString()}` },
    { label: "PROFIT MARGIN", value: totalIncome > 0 ? `${Math.round((netProfit / totalIncome) * 100)}%` : "0%" },
    { label: "TRANSACTIONS", value: transactions.length },
  ];

  return (
    <div className="module-card card-surface">
      {/* Module Hero */}
      <div className="module-hero">
        <div className="module-icon">
          <BarChart3 size={20} />
        </div>
        <div>
          <div className="eyebrow">FINTRACK MODULE</div>
          <h2>Financial Reports</h2>
          <p>Analyze income streams, expense distribution, profit margins, and cash flow health.</p>
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
            <h3>Reports require recorded signals</h3>
            <p>Add entries across transactions, fees, or expenses to generate analytical reports.</p>
          </div>
        </div>
      ) : (
        <div className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Breakdown chart */}
            <div className="bg-[#fbfcfe] border border-[#eef2f7] rounded-2xl p-5">
              <h3 className="text-sm font-bold text-[#0f172a] mb-1">Category Financial Flow</h3>
              <p className="text-xs text-[#64748b] mb-4">Inflow vs outflow by category</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f7" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      formatter={(val: any) => [`Rs. ${Number(val).toLocaleString()}`, ""]}
                      contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }}
                    />
                    <Bar dataKey="income" fill="#2563eb" radius={[4, 4, 0, 0]} name="Inflow" />
                    <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} name="Outflow" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Financial Health Summary */}
            <div className="bg-[#fbfcfe] border border-[#eef2f7] rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#0f172a] mb-1">Financial Health Breakdown</h3>
                <p className="text-xs text-[#64748b] mb-4">Live posture & liquidity ratios</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#eef2f7]">
                    <span className="text-xs text-[#475569] font-medium">Total Inflows</span>
                    <span className="text-xs font-bold text-[#059669]">Rs. {totalIncome.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#eef2f7]">
                    <span className="text-xs text-[#475569] font-medium">Total Outflows</span>
                    <span className="text-xs font-bold text-[#dc2626]">Rs. {totalExpenses.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#eef2f7]">
                    <span className="text-xs text-[#475569] font-medium">Expected Receivables</span>
                    <span className="text-xs font-bold text-[#2563eb]">Rs. {receivables.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#eef2f7]">
                    <span className="text-xs text-[#475569] font-medium">Outstanding Payables</span>
                    <span className="text-xs font-bold text-[#ea580c]">Rs. {payables.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-[#eef2f7] flex items-center justify-between">
                <span className="text-xs font-bold text-[#0f172a]">Net Operational Balance</span>
                <span className="text-sm font-extrabold text-[#2563eb]">Rs. {netProfit.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
