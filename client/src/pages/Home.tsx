import { useState } from "react";
import { useLocation } from "wouter";
import {
  ArrowUpRight,
  CircleDollarSign,
  CreditCard,
  HandCoins,
  Landmark,
  MoreHorizontal,
  Plus,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  WalletCards,
  Trash2,
  ReceiptText,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { useAppLayout } from "@/components/layout/AppLayout";
import { useFinancialData } from "@/contexts/FinancialDataContext";
import { LedgerIllustration } from "@/components/LedgerIllustration";
import { GoogleSheetSyncBanner } from "@/components/google-sheets/GoogleSheetSyncBanner";

export default function Home() {
  const [, navigate] = useLocation();
  const { openAddModal, selectedRange } = useAppLayout();
  const {
    transactions,
    deleteTransaction,
    totalIncome,
    totalExpenses,
    netProfit,
    receivables,
    payables,
    outstandingLoans,
    chartData,
  } = useFinancialData();

  const [chartTab, setChartTab] = useState<"Income" | "Expenses" | "Profit" | "Cash Flow">("Income");

  const activeMetric =
    chartTab === "Expenses"
      ? "expenses"
      : chartTab === "Profit" || chartTab === "Cash Flow"
      ? "profit"
      : "income";

  const metrics = [
    {
      label: "Total income",
      amount: `Rs. ${totalIncome.toLocaleString()}`,
      helper: totalIncome > 0 ? `${transactions.filter(t => t.type.includes("income") || t.type.includes("fee") || t.type.includes("payment")).length} inflow entries` : "No income recorded",
      icon: TrendingUp,
      tint: "blue",
    },
    {
      label: "Total expenses",
      amount: `Rs. ${totalExpenses.toLocaleString()}`,
      helper: totalExpenses > 0 ? `${transactions.filter(t => t.type === "expense").length} expense records` : "No expenses recorded",
      icon: CreditCard,
      tint: "coral",
    },
    {
      label: "Net profit",
      amount: `Rs. ${netProfit.toLocaleString()}`,
      helper: netProfit > 0 ? "Positive cash margin" : netProfit < 0 ? "Negative margin" : "Add transactions to calculate",
      icon: CircleDollarSign,
      tint: "mint",
    },
    {
      label: "Receivables",
      amount: `Rs. ${receivables.toLocaleString()}`,
      helper: receivables > 0 ? "Uncollected balances" : "Nothing outstanding",
      icon: WalletCards,
      tint: "lilac",
    },
    {
      label: "Payables",
      amount: `Rs. ${payables.toLocaleString()}`,
      helper: payables > 0 ? "Pending liabilities" : "Nothing due",
      icon: HandCoins,
      tint: "apricot",
    },
    {
      label: "Outstanding loans",
      amount: `Rs. ${outstandingLoans.toLocaleString()}`,
      helper: outstandingLoans > 0 ? "Active loan balances" : "No active loans",
      icon: Landmark,
      tint: "navy",
    },
  ];

  const recentTransactions = transactions.slice(0, 5);

  return (
    <>
      {/* Google Sheets Live Sync Bar */}
      <GoogleSheetSyncBanner />

      {/* Position Hero Strip */}
      <section className="position-strip">
        <div className="position-copy">
          <div className="eyebrow">
            <span className="compass-marker">✦</span> Position · {selectedRange}
          </div>
          <h2>
            Know what moved.
            <br />
            <em>Choose the next record.</em>
          </h2>
          <p>
            {transactions.length > 0
              ? `You have recorded ${transactions.length} transaction${transactions.length === 1 ? "" : "s"} with Rs. ${netProfit.toLocaleString()} net balance.`
              : "Your workspace is clear right now. Start with the money that moved most recently and FinTrack will map the rest."}
          </p>
          <Button onClick={openAddModal} className="primary-btn">
            <Plus size={16} />
            Record a movement
          </Button>
        </div>
        <div className="position-coordinate">
          <span>FIN / 01</span>
          <b>Rs. {netProfit.toLocaleString()}</b>
          <small>Current net position</small>
          <div className="coordinate-line">
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
          <div className="coordinate-footer">
            <span>LAT 24.8607</span>
            <span>LONG 67.0011</span>
          </div>
        </div>
      </section>

      {/* 6 Metric Grid */}
      <section className="metric-grid">
        {metrics.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="metric-card">
              <div className={`metric-icon ${item.tint}`}>
                <Icon size={17} strokeWidth={2.2} />
              </div>
              <div className="metric-label">{item.label}</div>
              <div className="metric-amount">{item.amount}</div>
              <div className="metric-helper">
                <span className="status-dot" />
                {item.helper}
              </div>
            </div>
          );
        })}
      </section>

      {/* Analysis Grid (Chart + Insight Card) */}
      <section className="analysis-grid">
        <div className="chart-card card-surface">
          <div className="card-header">
            <div>
              <div className="eyebrow">Performance · {selectedRange}</div>
              <h2>Financial performance</h2>
              <p>Track your income, expenses and profit over time.</p>
            </div>
            <button
              className="icon-btn subtle"
              aria-label="Settings"
              onClick={() => navigate("/settings")}
            >
              <SlidersHorizontal size={16} />
            </button>
          </div>
          <div className="chart-tabs">
            {(["Income", "Expenses", "Profit", "Cash Flow"] as const).map((tab) => (
              <button
                key={tab}
                className={chartTab === tab ? "selected" : ""}
                onClick={() => setChartTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="chart-area">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="blueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="#2F6BFF"
                      stopOpacity={0.18}
                    />
                    <stop offset="100%" stopColor="#2F6BFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  stroke="#e8eef6"
                  strokeDasharray="4 5"
                />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#9aa8bb", fontSize: 11 }}
                  dy={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#9aa8bb", fontSize: 11 }}
                  tickFormatter={(v) => `Rs.${v}`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e6ebf2",
                    boxShadow: "0 10px 24px rgba(35,55,80,.08)",
                  }}
                  formatter={(value: any) => [
                    `Rs. ${Number(value).toLocaleString()}`,
                    chartTab,
                  ]}
                  labelFormatter={(label) => `Aug ${label}, 2026`}
                />
                <Area
                  type="monotone"
                  dataKey={activeMetric}
                  stroke="#2F6BFF"
                  strokeWidth={2.5}
                  fill="url(#blueFill)"
                  dot={{
                    r: 3,
                    fill: "#fff",
                    stroke: "#2F6BFF",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
            {transactions.length === 0 && (
              <div className="chart-empty-note">
                <span>Not enough data to draw a trend</span>
                <small>Add a transaction to see movement here</small>
              </div>
            )}
          </div>
          <div className="chart-footer">
            <span>
              <i className="legend-dot blue" />
              {chartTab}
            </span>
            <span className="chart-footnote">Chart updates with your records</span>
          </div>
        </div>

        {/* Insight Card */}
        <div
          className="insight-card"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(10,28,57,.98), rgba(14,47,88,.94)), url("data:image/svg+xml;base64,${btoa(
              '<svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="routeGradient" x1="0" y1="0" x2="400" y2="300"><stop offset="0%" stopColor="#0D2A54" stopOpacity="0.98"/><stop offset="100%" stopColor="#154588" stopOpacity="0.94"/></linearGradient></defs><rect width="400" height="300" fill="url(#routeGradient)"/><path d="M50 200 Q150 100 250 150 Q350 200 350 250" stroke="#66D8B6" strokeWidth="2" fill="none" opacity="0.6" strokeDasharray="8 6"/><circle cx="50" cy="200" r="4" fill="#66D8B6" opacity="0.8"/><circle cx="250" cy="150" r="4" fill="#66D8B6" opacity="0.8"/><circle cx="350" cy="250" r="4" fill="#66D8B6" opacity="0.8"/></svg>'
            )}")`,
          }}
        >
          <div className="insight-top">
            <div className="insight-orb">
              <Sparkles size={16} />
            </div>
            <span>Signal check</span>
            <button className="icon-btn dark" aria-label="More options">
              <MoreHorizontal size={18} />
            </button>
          </div>
          <h2>Financial insights</h2>
          <p className="insight-lead">
            Your financial picture becomes clearer with every honest entry.
          </p>
          <div className="insight-message">
            <div className="insight-pulse">
              <span />
            </div>
            <div>
              <b>{transactions.length > 0 ? `Signal active (${transactions.length} entries)` : "Add transactions to unlock insights."}</b>
              <p>
                {transactions.length > 0
                  ? `Your net margin is currently Rs. ${netProfit.toLocaleString()}. Keep recording cash movements to track runway.`
                  : "We’ll surface income trends, outstanding fees, and the next items that need your attention."}
              </p>
            </div>
          </div>
          <div className="insight-rule" />
          <div className="insight-footer">
            <span>
              <i className="legend-dot mint" />
              {transactions.length > 0 ? "Real-time sync enabled" : "Waiting for your first signal"}
            </span>
            <ArrowUpRight size={16} />
          </div>
        </div>
      </section>

      {/* Recent Transactions Card */}
      <section className="transactions-card card-surface">
        <div className="card-header table-header">
          <div>
            <div className="eyebrow">Ledger</div>
            <h2>Recent transactions</h2>
            <p>Your latest income, expenses, and payments in one place.</p>
          </div>
          {transactions.length > 0 && (
            <button
              className="text-btn"
              onClick={() => navigate("/transactions")}
            >
              View all ({transactions.length}) <ArrowUpRight size={14} />
            </button>
          )}
        </div>

        {recentTransactions.length === 0 ? (
          <div className="empty-table">
            <div className="empty-marker">✦</div>
            <LedgerIllustration />
            <div>
              <h3>Your ledger is waiting for its first signal</h3>
              <p>Choose a first record and we’ll keep the next step visible.</p>
            </div>
            <Button onClick={openAddModal} className="primary-btn">
              <Plus size={16} />
              Add first record
            </Button>
          </div>
        ) : (
          <div className="p-4 md:p-6 overflow-x-auto">
            <table className="w-full text-left text-xs text-[#334155]">
              <thead>
                <tr className="border-b border-[#eef2f7] text-[11px] font-semibold text-[#8b98aa] uppercase tracking-wider">
                  <th className="pb-3 pl-2">Description</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Method</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3 text-right">Amount</th>
                  <th className="pb-3 pr-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {recentTransactions.map((tx) => {
                  const isPositive = ["income", "other_income", "student_fee", "client_payment"].includes(tx.type);
                  return (
                    <tr key={tx.id} className="hover:bg-[#f8fafc] transition">
                      <td className="py-3 pl-2 font-medium text-[#0f172a] flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isPositive ? "bg-[#10b981]" : "bg-[#ef4444]"
                          }`}
                        />
                        {tx.description}
                      </td>
                      <td className="py-3 capitalize text-[#64748b]">
                        {tx.type.replace("_", " ")}
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-md bg-[#eff6ff] text-[#2563eb] text-[11px] font-medium">
                          {tx.category || "General"}
                        </span>
                      </td>
                      <td className="py-3 capitalize text-[#64748b]">
                        {tx.payment_method.replace("_", " ")}
                      </td>
                      <td className="py-3 text-[#64748b]">{tx.date}</td>
                      <td
                        className={`py-3 text-right font-semibold text-xs ${
                          isPositive ? "text-[#059669]" : "text-[#dc2626]"
                        }`}
                      >
                        {isPositive ? "+" : "-"} Rs. {Number(tx.amount).toLocaleString()}
                      </td>
                      <td className="py-3 pr-2 text-right">
                        <button
                          onClick={() => deleteTransaction(tx.id)}
                          className="text-[#94a3b8] hover:text-red-500 p-1 rounded transition"
                          title="Delete transaction"
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
        )}
      </section>
    </>
  );
}
