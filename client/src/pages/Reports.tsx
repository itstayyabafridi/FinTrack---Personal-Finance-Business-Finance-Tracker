import { useState } from "react";
import { CalendarDays, Download, BarChart3, FileText, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Reports() {
  const [range, setRange] = useState("This month");
  const [reportType, setReportType] = useState("overview");

  return (
    <div className="page-container">
      <section className="page-heading">
        <div>
          <div className="eyebrow">Analytics</div>
          <h1>Reports</h1>
          <p>Deep insights into your financial performance across all workspaces.</p>
        </div>
        <div className="heading-actions">
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-[180px]">
              <CalendarDays size={15} />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Today">Today</SelectItem>
              <SelectItem value="This week">This week</SelectItem>
              <SelectItem value="This month">This month</SelectItem>
              <SelectItem value="Last month">Last month</SelectItem>
              <SelectItem value="Last 3 months">Last 3 months</SelectItem>
              <SelectItem value="This year">This year</SelectItem>
              <SelectItem value="Custom range">Custom range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download size={15} /> Export
          </Button>
        </div>
      </section>

      <div className="module-card card-surface">
        <div className="module-hero">
          <div className="module-icon">
            <BarChart3 size={20} />
          </div>
          <div>
            <div className="eyebrow">FinTrack module</div>
            <h2>Reports</h2>
            <p>This workspace is ready for your records. Add an entry to keep your personal and business books connected.</p>
          </div>
        </div>

        <div className="report-tabs">
          <button className={reportType === "overview" ? "active" : ""} onClick={() => setReportType("overview")}>
            Overview
          </button>
          <button className={reportType === "income" ? "active" : ""} onClick={() => setReportType("income")}>
            Income Analysis
          </button>
          <button className={reportType === "expenses" ? "active" : ""} onClick={() => setReportType("expenses")}>
            Expense Breakdown
          </button>
          <button className={reportType === "cashflow" ? "active" : ""} onClick={() => setReportType("cashflow")}>
            Cash Flow
          </button>
          <button className={reportType === "profitability" ? "active" : ""} onClick={() => setReportType("profitability")}>
            Profitability
          </button>
        </div>

        <div className="empty-table" style={{ minHeight: "300px" }}>
          <div className="empty-marker">✦</div>
          <div>
            <h3>No data available for this report</h3>
            <p>Add transactions to generate meaningful financial reports.</p>
          </div>
        </div>
      </div>
    </div>
  );
}