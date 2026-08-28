import { useState } from "react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Calendar,
  CalendarDays,
  AlertTriangle,
  CheckCircle2,
  Edit3,
  Check,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  Sparkles,
  Receipt,
  RotateCcw,
} from "lucide-react";
import { useFinancialData } from "@/contexts/FinancialDataContext";
import { useAppLayout } from "@/components/layout/AppLayout";
import { toast } from "sonner";

export function BudgetTrackerSection() {
  const {
    monthlyBudget,
    weeklyBudget,
    setMonthlyBudget,
    setWeeklyBudget,
    monthlyAnalytics,
    weeklyAnalytics,
    addTransaction,
  } = useFinancialData();

  const { openAddModal } = useAppLayout();

  // Active view: "month" or "week"
  const [period, setPeriod] = useState<"month" | "week">("month");

  // Editing state for budget
  const [isEditing, setIsEditing] = useState(false);
  const [tempBudgetInput, setTempBudgetInput] = useState<string>("");

  // Quick test expense modal/popover state
  const [showQuickExpense, setShowQuickExpense] = useState(false);
  const [quickDesc, setQuickDesc] = useState("");
  const [quickAmount, setQuickAmount] = useState("");
  const [quickCategory, setQuickCategory] = useState("Operational Expense");

  // Show detailed transaction breakdown
  const [showBreakdown, setShowBreakdown] = useState(false);

  const activeAnalytics = period === "month" ? monthlyAnalytics : weeklyAnalytics;
  const currentBudget = period === "month" ? monthlyBudget : weeklyBudget;

  const handleStartEdit = () => {
    setTempBudgetInput(String(currentBudget));
    setIsEditing(true);
  };

  const handleSaveBudget = () => {
    const parsed = parseFloat(tempBudgetInput.replace(/,/g, ""));
    if (isNaN(parsed) || parsed < 0) {
      toast.error("Please enter a valid non-negative budget amount");
      return;
    }

    if (period === "month") {
      setMonthlyBudget(parsed);
      toast.success(`Monthly budget updated to Rs. ${parsed.toLocaleString()}`);
    } else {
      setWeeklyBudget(parsed);
      toast.success(`Weekly budget updated to Rs. ${parsed.toLocaleString()}`);
    }
    setIsEditing(false);
  };

  const handleQuickPreset = (amount: number) => {
    if (period === "month") {
      setMonthlyBudget(amount);
      toast.success(`Monthly budget set to Rs. ${amount.toLocaleString()}`);
    } else {
      setWeeklyBudget(amount);
      toast.success(`Weekly budget set to Rs. ${amount.toLocaleString()}`);
    }
    setTempBudgetInput(String(amount));
    setIsEditing(false);
  };

  const handleQuickDeduct = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(quickAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Enter a valid expense amount to cut from budget");
      return;
    }

    const todayStr = new Date().toISOString().split("T")[0];
    addTransaction({
      description: quickDesc.trim() || "Manual Budget Auto-Cut",
      amount: amt,
      type: "expense",
      date: todayStr,
      category: quickCategory,
      payment_method: "cash",
      notes: `Deducted against ${period === "month" ? "monthly" : "weekly"} budget`,
    });

    toast.success(`Rs. ${amt.toLocaleString()} automatically deducted from your ${period} budget!`);
    setQuickDesc("");
    setQuickAmount("");
    setShowQuickExpense(false);
  };

  const percentUsed = Math.min(100, Math.max(0, activeAnalytics.percentUsed));

  // Determine progress bar color theme
  let progressColor = "bg-emerald-500";
  let progressBg = "bg-emerald-100";
  let progressText = "text-emerald-700";
  if (percentUsed >= 90 || activeAnalytics.isOverBudget) {
    progressColor = "bg-rose-500";
    progressBg = "bg-rose-100";
    progressText = "text-rose-700";
  } else if (percentUsed >= 70) {
    progressColor = "bg-amber-500";
    progressBg = "bg-amber-100";
    progressText = "text-amber-700";
  }

  return (
    <section className="bg-white border border-[#e6edf5] rounded-2xl shadow-[0_2px_12px_rgba(20,40,70,0.04)] p-5 md:p-6 mb-6">
      {/* Header with Period Switcher and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#f0f4f9]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2f6bff] border border-blue-200/70 flex items-center justify-center shrink-0">
            <Wallet size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base md:text-lg font-bold text-[#1a2b42] tracking-tight">
                Budget & Profit / Loss Engine
              </h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                Auto-Deductions Active
              </span>
            </div>
            <p className="text-xs text-[#62758e]">
              Real-time automatic deduction from your allocated budget with live profit & loss calculations.
            </p>
          </div>
        </div>

        {/* Period Selector Tabs: Monthly vs Weekly */}
        <div className="flex items-center gap-2">
          <div className="inline-flex bg-[#f1f5fa] p-1 rounded-xl border border-[#e2eaf3]">
            <button
              type="button"
              onClick={() => {
                setPeriod("month");
                setIsEditing(false);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                period === "month"
                  ? "bg-white text-[#2f6bff] shadow-xs"
                  : "text-[#62758e] hover:text-[#1a2b42]"
              }`}
            >
              <Calendar size={13} />
              <span>Monthly Budget</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setPeriod("week");
                setIsEditing(false);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                period === "week"
                  ? "bg-white text-[#2f6bff] shadow-xs"
                  : "text-[#62758e] hover:text-[#1a2b42]"
              }`}
            >
              <CalendarDays size={13} />
              <span>Weekly Budget</span>
            </button>
          </div>

          {/* Quick Expense Deduction Trigger */}
          <button
            type="button"
            onClick={() => setShowQuickExpense(!showQuickExpense)}
            className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 hover:bg-blue-100/80 text-[#2f6bff] border border-blue-200/80 transition-colors"
            title="Quickly record an expense to auto-cut from this budget"
          >
            <Plus size={14} />
            <span>Quick Cut</span>
          </button>
        </div>
      </div>

      {/* Quick Deduction Dropdown Form (if open) */}
      {showQuickExpense && (
        <form
          onSubmit={handleQuickDeduct}
          className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-wrap items-center gap-3 animate-in fade-in duration-150"
        >
          <div className="text-xs font-bold text-slate-700 w-full flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles size={14} className="text-blue-600" />
              Quick Auto-Cut: Record Expense Against Current {period === "month" ? "Month" : "Week"} Budget
            </span>
            <button
              type="button"
              onClick={() => setShowQuickExpense(false)}
              className="text-slate-400 hover:text-slate-600 text-xs"
            >
              Cancel
            </button>
          </div>
          <div className="flex-1 min-w-[180px]">
            <input
              type="text"
              placeholder="Description (e.g. Office Supplies, Travel)"
              value={quickDesc}
              onChange={(e) => setQuickDesc(e.target.value)}
              className="w-full text-xs px-3 py-1.5 rounded-lg bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              required
            />
          </div>
          <div className="w-[140px]">
            <input
              type="number"
              placeholder="Amount (Rs.)"
              value={quickAmount}
              onChange={(e) => setQuickAmount(e.target.value)}
              className="w-full text-xs px-3 py-1.5 rounded-lg bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold"
              required
            />
          </div>
          <div className="w-[160px]">
            <select
              value={quickCategory}
              onChange={(e) => setQuickCategory(e.target.value)}
              className="w-full text-xs px-3 py-1.5 rounded-lg bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="Operational Expense">Operational Expense</option>
              <option value="Marketing & Ads">Marketing & Ads</option>
              <option value="Software & Tools">Software & Tools</option>
              <option value="Inventory / Cost">Inventory / Cost</option>
              <option value="Office & Rent">Office & Rent</option>
              <option value="Miscellaneous">Miscellaneous</option>
            </select>
          </div>
          <button
            type="submit"
            className="px-4 py-1.5 bg-[#2f6bff] hover:bg-blue-600 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0"
          >
            Deduct Now
          </button>
        </form>
      )}

      {/* Main Analytical Cards (3-Column Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-5">
        {/* Column 1: Allocated Budget with Inline Editor (4 cols) */}
        <div className="lg:col-span-4 bg-[#fbfcfe] border border-[#e9f0f8] rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#6a7c93] uppercase tracking-wider">
                {period === "month" ? "Monthly Budget Ceiling" : "Weekly Budget Ceiling"}
              </span>
              {!isEditing ? (
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="inline-flex items-center gap-1 text-[11px] text-[#2f6bff] hover:text-blue-700 font-semibold bg-blue-50/80 px-2 py-0.5 rounded-md hover:bg-blue-100/60 transition-colors"
                >
                  <Edit3 size={11} />
                  <span>Set Budget</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSaveBudget}
                  className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md hover:bg-emerald-100 transition-colors"
                >
                  <Check size={11} />
                  <span>Save</span>
                </button>
              )}
            </div>

            {/* Display Budget or Edit Input */}
            <div className="mt-2">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-slate-400">Rs.</span>
                  <input
                    type="number"
                    value={tempBudgetInput}
                    onChange={(e) => setTempBudgetInput(e.target.value)}
                    className="w-full text-xl font-bold text-[#142338] bg-white border border-blue-400 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="e.g. 100000"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveBudget();
                      if (e.key === "Escape") setIsEditing(false);
                    }}
                  />
                </div>
              ) : (
                <div className="text-2xl md:text-3xl font-extrabold text-[#132238] tracking-tight">
                  Rs. {currentBudget.toLocaleString()}
                </div>
              )}
            </div>

            {/* Preset quick buttons */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-slate-400 font-medium mr-1">Presets:</span>
              {period === "month" ? (
                <>
                  {[50000, 100000, 150000, 200000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleQuickPreset(val)}
                      className={`text-[11px] px-2 py-0.5 rounded-md border transition-all ${
                        currentBudget === val
                          ? "bg-blue-600 text-white border-blue-600 font-bold"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {val >= 1000 ? `${val / 1000}k` : val}
                    </button>
                  ))}
                </>
              ) : (
                <>
                  {[10000, 25000, 50000, 75000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleQuickPreset(val)}
                      className={`text-[11px] px-2 py-0.5 rounded-md border transition-all ${
                        currentBudget === val
                          ? "bg-blue-600 text-white border-blue-600 font-bold"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {val >= 1000 ? `${val / 1000}k` : val}
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Budget Subtext */}
          <div className="mt-4 pt-3 border-t border-[#eaf1f9] flex items-center justify-between text-xs text-[#657790]">
            <span>Period Range:</span>
            <b className="text-[#203248]">{activeAnalytics.title}</b>
          </div>
        </div>

        {/* Column 2: Auto-Cut & Remaining Balance (4 cols) */}
        <div className="lg:col-span-4 bg-[#fbfcfe] border border-[#e9f0f8] rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#6a7c93] uppercase tracking-wider">
                Auto-Deductions & Balance
              </span>
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  activeAnalytics.isOverBudget
                    ? "bg-rose-100 text-rose-700"
                    : percentUsed > 75
                    ? "bg-amber-100 text-amber-800"
                    : "bg-emerald-100 text-emerald-800"
                }`}
              >
                {activeAnalytics.isOverBudget ? (
                  <>
                    <AlertTriangle size={11} /> Over Budget
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={11} /> On Track
                  </>
                )}
              </span>
            </div>

            {/* Remaining Amount */}
            <div className="mt-2">
              <div
                className={`text-2xl md:text-3xl font-extrabold tracking-tight ${
                  activeAnalytics.isOverBudget ? "text-rose-600" : "text-emerald-600"
                }`}
              >
                {activeAnalytics.isOverBudget ? "-" : ""}Rs.{" "}
                {Math.abs(activeAnalytics.remaining).toLocaleString()}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {activeAnalytics.isOverBudget
                  ? `Exceeded budget by Rs. ${activeAnalytics.overBudgetAmount.toLocaleString()}`
                  : `Remaining balance for next ${activeAnalytics.daysRemaining} days`}
              </p>
            </div>

            {/* Visual Progress Bar */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-[11px] font-semibold mb-1">
                <span className="text-slate-500">
                  Cut: <b className="text-slate-800">Rs. {activeAnalytics.spent.toLocaleString()}</b>
                </span>
                <span className={progressText}>{percentUsed}% used</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                  style={{ width: `${percentUsed}%` }}
                />
              </div>
            </div>
          </div>

          {/* Daily Guidance */}
          <div className="mt-4 pt-3 border-t border-[#eaf1f9] flex items-center justify-between text-xs text-[#657790]">
            <span>Safe Daily Burn:</span>
            <b className="text-[#203248]">
              {activeAnalytics.remaining > 0
                ? `Rs. ${activeAnalytics.suggestedDailySpend.toLocaleString()} / day`
                : "Budget exhausted"}
            </b>
          </div>
        </div>

        {/* Column 3: Net Profit / Loss for Month or Week (4 cols) */}
        <div className="lg:col-span-4 bg-[#fbfcfe] border border-[#e9f0f8] rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#6a7c93] uppercase tracking-wider">
                {period === "month" ? "Month Profit / Loss" : "Week Profit / Loss"}
              </span>
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  activeAnalytics.isProfit
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200/70"
                    : "bg-rose-50 text-rose-700 border border-rose-200/70"
                }`}
              >
                {activeAnalytics.isProfit ? (
                  <>
                    <TrendingUp size={12} /> Net Profit
                  </>
                ) : (
                  <>
                    <TrendingDown size={12} /> Net Loss
                  </>
                )}
              </span>
            </div>

            {/* Calculated Net Profit / Loss Amount */}
            <div className="mt-2">
              <div
                className={`text-2xl md:text-3xl font-extrabold tracking-tight ${
                  activeAnalytics.isProfit ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {activeAnalytics.netProfit >= 0 ? "+" : "-"}Rs.{" "}
                {Math.abs(activeAnalytics.netProfit).toLocaleString()}
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                <span>
                  Margin:{" "}
                  <b className={activeAnalytics.isProfit ? "text-emerald-700" : "text-rose-700"}>
                    {activeAnalytics.profitMargin}%
                  </b>
                </span>
                <span>•</span>
                <span>{activeAnalytics.transactionCount} total entries</span>
              </div>
            </div>

            {/* Inflow vs Outflow Mini Summary */}
            <div className="mt-3 grid grid-cols-2 gap-2 bg-white p-2 rounded-lg border border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Inflow</span>
                <span className="text-xs font-bold text-blue-600">
                  +Rs. {activeAnalytics.income.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Outflow</span>
                <span className="text-xs font-bold text-rose-600">
                  -Rs. {activeAnalytics.spent.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Breakdown Toggle */}
          <div className="mt-4 pt-3 border-t border-[#eaf1f9] flex items-center justify-between text-xs">
            <span className="text-[#657790]">Auto-cut records:</span>
            <button
              type="button"
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="text-[#2f6bff] font-semibold hover:underline flex items-center gap-1"
            >
              <Receipt size={12} />
              <span>{showBreakdown ? "Hide details" : `View ${activeAnalytics.expenseCount} cuts`}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Collapsible Deduction Details Breakdown */}
      {showBreakdown && (
        <div className="mt-5 pt-4 border-t border-[#edf2f7] animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Automatic Deductions Applied to {activeAnalytics.title}
            </h3>
            <span className="text-xs text-slate-500">
              Total cut: <b className="text-rose-600">Rs. {activeAnalytics.spent.toLocaleString()}</b>
            </span>
          </div>

          {activeAnalytics.expenses.length === 0 ? (
            <div className="p-4 text-center rounded-xl bg-slate-50 text-xs text-slate-500">
              No expense transactions recorded for this {period} yet. Use "+ Record a movement" or "Quick Cut" above to start auto-deducting.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
              {activeAnalytics.expenses.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3 bg-white hover:bg-slate-50/80 transition-colors flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                      <ArrowDownRight size={14} />
                    </div>
                    <div>
                      <b className="text-slate-800 font-semibold block">{tx.description}</b>
                      <span className="text-[11px] text-slate-400">
                        {tx.category || "General Expense"} • {tx.date}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-rose-600 block">
                      -Rs. {Number(tx.amount).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400">Cut from budget</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
