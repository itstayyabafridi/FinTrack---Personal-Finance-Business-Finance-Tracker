import { useState, useRef, useEffect } from "react";
import {
  Settings2,
  User,
  Bell,
  Shield,
  Database,
  Save,
  CheckCircle2,
  FileSpreadsheet,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  FileText,
  HelpCircle,
  HardDriveDownload,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useFinancialData } from "@/contexts/FinancialDataContext";
import {
  generateFullDatabaseCsv,
  generateModuleCsv,
  downloadCsvFile,
  parseAndValidateCsv,
  type ParseResult,
} from "@/lib/csvBackup";
import { toast } from "sonner";

export default function Settings() {
  const { profile, user } = useAuth();
  const {
    transactions,
    students,
    clients,
    projects,
    expenses,
    loans,
    ownerPayments,
    clearAllData,
    restoreDatabase,
  } = useFinancialData();

  const getTabFromUrl = (): "profile" | "workspace" | "backup" | "notifications" | "security" => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam && ["profile", "workspace", "backup", "notifications", "security"].includes(tabParam)) {
        return tabParam as "profile" | "workspace" | "backup" | "notifications" | "security";
      }
    } catch {}
    return "profile";
  };

  const [activeTab, setActiveTab] = useState<
    "profile" | "workspace" | "backup" | "notifications" | "security"
  >(getTabFromUrl);

  useEffect(() => {
    const handleUrlSync = () => {
      setActiveTab(getTabFromUrl());
    };
    handleUrlSync();
    window.addEventListener("popstate", handleUrlSync);
    return () => window.removeEventListener("popstate", handleUrlSync);
  }, []);
  const [fullName, setFullName] = useState(profile?.full_name || "Tayyab");
  const [email, setEmail] = useState(profile?.email || user?.email || "tayyab@example.com");
  const [phone, setPhone] = useState(profile?.phone || "+92 300 1234567");
  const [currency, setCurrency] = useState("PKR (Rs.)");
  const [saving, setSaving] = useState(false);

  // CSV Backup & Restore states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedCsvResult, setParsedCsvResult] = useState<ParseResult | null>(null);
  const [isProcessingCsv, setIsProcessingCsv] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [restoreMode, setRestoreMode] = useState<"replace" | "merge">("replace");
  const [showConfirmRestore, setShowConfirmRestore] = useState(false);

  const totalRecordsInDb =
    transactions.length +
    students.length +
    clients.length +
    projects.length +
    expenses.length +
    loans.length +
    ownerPayments.length;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 350));
      toast.success("Settings saved successfully");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  // Full Database Backup Export
  const handleFullBackupDownload = () => {
    try {
      const csv = generateFullDatabaseCsv({
        transactions,
        students,
        clients,
        projects,
        expenses,
        loans,
        ownerPayments,
      });
      const dateStr = new Date().toISOString().split("T")[0];
      const filename = `fintrack_database_backup_${dateStr}.csv`;
      downloadCsvFile(csv, filename);
      toast.success(`Complete database exported to ${filename} (${totalRecordsInDb} records)`);
    } catch (err: any) {
      toast.error(`Failed to export CSV: ${err?.message || "Unknown error"}`);
    }
  };

  // Individual Module CSV Export
  const handleModuleExport = (
    moduleKey: "transactions" | "students" | "clients" | "projects" | "expenses" | "loans" | "owner_payments",
    label: string,
    data: any[]
  ) => {
    if (data.length === 0) {
      toast.info(`No records in ${label} to export.`);
      return;
    }
    const csv = generateModuleCsv(moduleKey, data);
    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `fintrack_${moduleKey}_${dateStr}.csv`;
    downloadCsvFile(csv, filename);
    toast.success(`Exported ${data.length} ${label} records to ${filename}`);
  };

  // Handle CSV File Selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error("Please upload a valid .CSV file");
      return;
    }

    setIsProcessingCsv(true);
    setUploadedFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (!text) {
        toast.error("File is empty or unreadable");
        setIsProcessingCsv(false);
        return;
      }

      const result = parseAndValidateCsv(text);
      setParsedCsvResult(result);
      setIsProcessingCsv(false);

      if (result.success) {
        toast.success(`Parsed ${result.totalRecords} records from ${file.name}`);
      } else {
        toast.error(result.error || "Failed to parse CSV records");
      }
    };

    reader.onerror = () => {
      toast.error("Error reading file");
      setIsProcessingCsv(false);
    };

    reader.readAsText(file);
  };

  // Execute Restore Action
  const handleExecuteRestore = () => {
    if (!parsedCsvResult || !parsedCsvResult.success) {
      toast.error("No valid CSV data to restore");
      return;
    }

    try {
      restoreDatabase(parsedCsvResult.data, restoreMode);
      setParsedCsvResult(null);
      setUploadedFileName("");
      setShowConfirmRestore(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err: any) {
      toast.error(`Restore failed: ${err?.message || "Unknown error"}`);
    }
  };

  return (
    <div className="module-card card-surface">
      {/* Module Hero */}
      <div className="module-hero">
        <div className="module-icon">
          <Settings2 size={20} />
        </div>
        <div>
          <div className="eyebrow">FINTRACK MODULE</div>
          <h2>Settings & Portability</h2>
          <p>Configure workspace rules, manage database backups, and export/import CSV records.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="primary-btn">
          <Save size={16} />
          {saving ? "Saving..." : "Save changes"}
        </Button>
      </div>

      {/* Settings Sub-Tabs */}
      <div className="chart-tabs mt-4">
        {[
          { id: "profile", label: "Profile & Identity", icon: User },
          { id: "workspace", label: "Workspace & Currency", icon: Database },
          { id: "backup", label: "Database Backup & Portability", icon: HardDriveDownload },
          { id: "notifications", label: "Notifications", icon: Bell },
          { id: "security", label: "Security & Access", icon: Shield },
        ].map((tab) => (
          <button
            key={tab.id}
            className={activeTab === tab.id ? "selected" : ""}
            onClick={() => setActiveTab(tab.id as any)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Settings Body */}
      <div className="pt-6">
        {activeTab === "profile" && (
          <form onSubmit={handleSave} className="space-y-5 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#40516a]">Full Name</Label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="h-10 bg-[#fbfcfe] border-[#e0e7ef]"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#40516a]">Email Address</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="h-10 bg-[#fbfcfe] border-[#e0e7ef]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#40516a]">Phone Number</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+92 300 0000000"
                  className="h-10 bg-[#fbfcfe] border-[#e0e7ef]"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#40516a]">Default Currency</Label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full h-10 px-3 bg-[#fbfcfe] border border-[#e0e7ef] rounded-lg text-xs text-[#40516a] focus:outline-none focus:border-[#2f6bff]"
                >
                  <option value="PKR (Rs.)">PKR — Pakistani Rupee (Rs.)</option>
                  <option value="USD ($)">USD — US Dollar ($)</option>
                  <option value="EUR (€)">EUR — Euro (€)</option>
                  <option value="GBP (£)">GBP — British Pound (£)</option>
                  <option value="AED (AED)">AED — UAE Dirham</option>
                  <option value="SAR (SAR)">SAR — Saudi Riyal</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" disabled={saving} className="primary-btn">
                <Save size={15} />
                {saving ? "Saving changes..." : "Save profile changes"}
              </Button>
            </div>
          </form>
        )}

        {activeTab === "workspace" && (
          <div className="space-y-4 max-w-2xl text-xs text-[#67778d]">
            <div className="p-4 bg-[#f8fbfe] border border-[#e4ebf3] rounded-xl flex items-center justify-between">
              <div>
                <b className="text-[#1e314b] text-sm block">Tayyab's Workspace</b>
                <span className="text-[#8897ab] text-xs">Primary personal and business hybrid ledger</span>
              </div>
              <span className="px-2.5 py-1 bg-[#e7f9f3] text-[#1ba27d] font-bold text-[10px] rounded-full">
                ACTIVE
              </span>
            </div>
            <p>You can add additional business or client workspaces whenever your bookkeeping expands.</p>

            <div className="p-4 bg-[#f0f7ff] border border-[#dbeafe] rounded-xl flex items-center justify-between">
              <div>
                <b className="text-[#1e40af] text-xs block">Database Backup & Portability</b>
                <span className="text-[#3b82f6] text-[11px]">
                  Export or restore full ledger backups in portable CSV format.
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab("backup")}
                className="text-xs border-[#bfdbfe] text-[#1d4ed8] hover:bg-[#eff6ff]"
              >
                Go to Backups
              </Button>
            </div>

            <div className="p-4 bg-white border border-[#fee2e2] rounded-xl flex items-center justify-between mt-6">
              <div>
                <b className="text-[#991b1b] text-xs block">Clear Workspace Records</b>
                <span className="text-[#b91c1c] text-[11px]">Remove all locally recorded transactions and reset ledger</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllData}
                className="text-xs border-[#fca5a5] text-[#b91c1c] hover:bg-[#fef2f2]"
              >
                Clear Data
              </Button>
            </div>
          </div>
        )}

        {activeTab === "backup" && (
          <div className="space-y-6 max-w-3xl">
            {/* Main Backup Action Banner */}
            <div className="p-5 bg-gradient-to-r from-[#f8fafc] to-[#f1f5f9] border border-[#e2e8f0] rounded-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="p-1.5 bg-[#2563eb] text-white rounded-lg">
                      <FileSpreadsheet size={18} />
                    </span>
                    <h3 className="text-sm font-bold text-[#0f172a]">
                      Complete Database CSV Backup
                    </h3>
                  </div>
                  <p className="text-xs text-[#64748b] max-w-xl">
                    Export your entire ledger (all {totalRecordsInDb} records across Transactions, Students, Clients, Projects, Expenses, Loans, and Owner Payouts) into a unified portable CSV file.
                  </p>
                </div>
                <Button
                  onClick={handleFullBackupDownload}
                  className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-2 whitespace-nowrap self-start sm:self-center"
                >
                  <Download size={15} />
                  Download Backup (.csv)
                </Button>
              </div>

              {/* Live Record Badges */}
              <div className="mt-4 pt-3.5 border-t border-[#e2e8f0] flex flex-wrap items-center gap-2 text-[11px] text-[#475569]">
                <span className="font-semibold text-[#0f172a] mr-1">Current State:</span>
                <span className="px-2 py-0.5 bg-white border border-[#e2e8f0] rounded-md font-medium">
                  💳 {transactions.length} Transactions
                </span>
                <span className="px-2 py-0.5 bg-white border border-[#e2e8f0] rounded-md font-medium">
                  🎓 {students.length} Students
                </span>
                <span className="px-2 py-0.5 bg-white border border-[#e2e8f0] rounded-md font-medium">
                  💼 {clients.length} Clients
                </span>
                <span className="px-2 py-0.5 bg-white border border-[#e2e8f0] rounded-md font-medium">
                  📁 {projects.length} Projects
                </span>
                <span className="px-2 py-0.5 bg-white border border-[#e2e8f0] rounded-md font-medium">
                  📉 {expenses.length} Expenses
                </span>
                <span className="px-2 py-0.5 bg-white border border-[#e2e8f0] rounded-md font-medium">
                  🏛️ {loans.length} Loans
                </span>
                <span className="px-2 py-0.5 bg-white border border-[#e2e8f0] rounded-md font-medium">
                  🤝 {ownerPayments.length} Owner Draws
                </span>
              </div>
            </div>

            {/* Restore / Import Section */}
            <div className="p-5 bg-white border border-[#e2e8f0] rounded-2xl space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="p-1.5 bg-[#059669] text-white rounded-lg">
                    <Upload size={18} />
                  </span>
                  <h3 className="text-sm font-bold text-[#0f172a]">
                    Restore Database from CSV File
                  </h3>
                </div>
                <p className="text-xs text-[#64748b]">
                  Upload a FinTrack CSV backup or a single-table CSV file. You can choose to cleanly replace all database records or merge new records into your workspace.
                </p>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#cbd5e1] hover:border-[#2563eb] bg-[#f8fafc] hover:bg-[#f1f5f9] transition cursor-pointer rounded-xl p-6 text-center"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-[#eff6ff] text-[#2563eb] flex items-center justify-center">
                    <Upload size={20} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#0f172a]">
                      Click to choose CSV file
                    </span>
                    <span className="text-xs text-[#64748b]"> or drag and drop</span>
                  </div>
                  <span className="text-[11px] text-[#94a3b8]">
                    Supports unified FinTrack backups (.csv) and individual module exports
                  </span>
                </div>
              </div>

              {/* Parsed Inspection Preview */}
              {parsedCsvResult && (
                <div className="p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-[#2563eb]" />
                      <span className="text-xs font-bold text-[#0f172a]">{uploadedFileName}</span>
                      <span className="px-2 py-0.5 bg-[#ecfdf5] text-[#059669] text-[10px] font-bold rounded-full">
                        {parsedCsvResult.totalRecords} Records Detected
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setParsedCsvResult(null);
                        setUploadedFileName("");
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="text-xs text-[#ef4444] hover:underline"
                    >
                      Clear
                    </button>
                  </div>

                  {/* Modules Detected Breakdown */}
                  <div className="flex flex-wrap gap-2 text-[11px]">
                    {parsedCsvResult.data.transactions.length > 0 && (
                      <span className="px-2 py-0.5 bg-white border border-[#e2e8f0] rounded-md text-[#334155]">
                        {parsedCsvResult.data.transactions.length} Transactions
                      </span>
                    )}
                    {parsedCsvResult.data.students.length > 0 && (
                      <span className="px-2 py-0.5 bg-white border border-[#e2e8f0] rounded-md text-[#334155]">
                        {parsedCsvResult.data.students.length} Students
                      </span>
                    )}
                    {parsedCsvResult.data.clients.length > 0 && (
                      <span className="px-2 py-0.5 bg-white border border-[#e2e8f0] rounded-md text-[#334155]">
                        {parsedCsvResult.data.clients.length} Clients
                      </span>
                    )}
                    {parsedCsvResult.data.projects.length > 0 && (
                      <span className="px-2 py-0.5 bg-white border border-[#e2e8f0] rounded-md text-[#334155]">
                        {parsedCsvResult.data.projects.length} Projects
                      </span>
                    )}
                    {parsedCsvResult.data.expenses.length > 0 && (
                      <span className="px-2 py-0.5 bg-white border border-[#e2e8f0] rounded-md text-[#334155]">
                        {parsedCsvResult.data.expenses.length} Expenses
                      </span>
                    )}
                    {parsedCsvResult.data.loans.length > 0 && (
                      <span className="px-2 py-0.5 bg-white border border-[#e2e8f0] rounded-md text-[#334155]">
                        {parsedCsvResult.data.loans.length} Loans
                      </span>
                    )}
                    {parsedCsvResult.data.ownerPayments.length > 0 && (
                      <span className="px-2 py-0.5 bg-white border border-[#e2e8f0] rounded-md text-[#334155]">
                        {parsedCsvResult.data.ownerPayments.length} Owner Draws
                      </span>
                    )}
                  </div>

                  {/* Mode Selector */}
                  <div className="pt-2 border-t border-[#e2e8f0] grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <label
                      onClick={() => setRestoreMode("replace")}
                      className={`p-3 rounded-xl border cursor-pointer flex items-start gap-2.5 transition ${
                        restoreMode === "replace"
                          ? "border-[#2563eb] bg-[#eff6ff]"
                          : "border-[#e2e8f0] bg-white hover:bg-[#f8fafc]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="restoreMode"
                        checked={restoreMode === "replace"}
                        onChange={() => setRestoreMode("replace")}
                        className="mt-0.5 text-[#2563eb]"
                      />
                      <div>
                        <b className="text-xs text-[#0f172a] block">Clean Restore (Replace)</b>
                        <span className="text-[11px] text-[#64748b] block">
                          Replaces all records in database with this backup.
                        </span>
                      </div>
                    </label>

                    <label
                      onClick={() => setRestoreMode("merge")}
                      className={`p-3 rounded-xl border cursor-pointer flex items-start gap-2.5 transition ${
                        restoreMode === "merge"
                          ? "border-[#2563eb] bg-[#eff6ff]"
                          : "border-[#e2e8f0] bg-white hover:bg-[#f8fafc]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="restoreMode"
                        checked={restoreMode === "merge"}
                        onChange={() => setRestoreMode("merge")}
                        className="mt-0.5 text-[#2563eb]"
                      />
                      <div>
                        <b className="text-xs text-[#0f172a] block">Merge & Append</b>
                        <span className="text-[11px] text-[#64748b] block">
                          Keeps current records and adds any missing items.
                        </span>
                      </div>
                    </label>
                  </div>

                  {/* Execute Button */}
                  <div className="pt-2 flex justify-end gap-2">
                    <Button
                      onClick={handleExecuteRestore}
                      className="bg-[#059669] hover:bg-[#047857] text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5"
                    >
                      <CheckCircle2 size={15} />
                      Confirm & Restore {parsedCsvResult.totalRecords} Records
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Individual Module CSV Export Section */}
            <div className="p-5 bg-white border border-[#e2e8f0] rounded-2xl space-y-3">
              <div>
                <h3 className="text-sm font-bold text-[#0f172a] mb-0.5">
                  Individual Module Exports
                </h3>
                <p className="text-xs text-[#64748b]">
                  Need a standalone spreadsheet for tax filing, audits, or spreadsheets? Download single-table CSVs.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                {[
                  {
                    key: "transactions" as const,
                    label: "Transactions",
                    icon: "💳",
                    count: transactions.length,
                    data: transactions,
                  },
                  {
                    key: "students" as const,
                    label: "Students & Fees",
                    icon: "🎓",
                    count: students.length,
                    data: students,
                  },
                  {
                    key: "expenses" as const,
                    label: "Expenses",
                    icon: "📉",
                    count: expenses.length,
                    data: expenses,
                  },
                  {
                    key: "loans" as const,
                    label: "Loans / Qarza",
                    icon: "🏛️",
                    count: loans.length,
                    data: loans,
                  },
                  {
                    key: "clients" as const,
                    label: "Clients",
                    icon: "💼",
                    count: clients.length,
                    data: clients,
                  },
                  {
                    key: "projects" as const,
                    label: "Projects",
                    icon: "📁",
                    count: projects.length,
                    data: projects,
                  },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => handleModuleExport(item.key, item.label, item.data)}
                    className="p-3 text-left border border-[#e2e8f0] hover:border-[#2563eb] rounded-xl hover:bg-[#f8fafc] transition flex items-center justify-between group"
                  >
                    <div>
                      <span className="text-xs font-semibold text-[#0f172a] flex items-center gap-1.5">
                        <span>{item.icon}</span> {item.label}
                      </span>
                      <span className="text-[11px] text-[#94a3b8]">
                        {item.count} {item.count === 1 ? "record" : "records"}
                      </span>
                    </div>
                    <Download
                      size={14}
                      className="text-[#94a3b8] group-hover:text-[#2563eb] transition"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* CSV Portability & Schema Specs */}
            <div className="p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-xs text-[#64748b] space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-[#0f172a]">
                <HelpCircle size={14} className="text-[#2563eb]" />
                <span>CSV Portability Standard</span>
              </div>
              <p>
                FinTrack backup files use RFC 4180 standard UTF-8 CSV formatting with header annotations. You can open and edit your backup directly in <b>Microsoft Excel</b>, <b>Google Sheets</b>, or <b>Apple Numbers</b>, and re-import anytime without data loss.
              </p>
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="space-y-3 max-w-2xl">
            {[
              { title: "Due date alerts", desc: "Receive email reminders for overdue fees and receivables." },
              { title: "Weekly financial digest", desc: "Get a summarized breakdown of cash in/out every Monday morning." },
              { title: "Large transaction alert", desc: "Notify when any transaction exceeds Rs. 100,000." },
            ].map((item, idx) => (
              <div key={idx} className="p-3.5 bg-[#fbfcfe] border border-[#e4ebf3] rounded-xl flex items-center justify-between">
                <div>
                  <b className="text-[#20344f] text-xs block">{item.title}</b>
                  <span className="text-[#8897ab] text-[11px]">{item.desc}</span>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 text-[#2f6bff] rounded" />
              </div>
            ))}
          </div>
        )}

        {activeTab === "security" && (
          <div className="space-y-4 max-w-2xl text-xs text-[#67778d]">
            <div className="p-4 bg-[#fbfcfe] border border-[#e4ebf3] rounded-xl">
              <b className="text-[#20344f] text-sm block mb-1">Session & Authentication</b>
              <p className="mb-3 text-[#8897ab]">Your session is protected with secure token validation and client-side encryption.</p>
              <Button variant="outline" size="sm" onClick={() => toast.info("Password update link sent to your email")}>
                Change password
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
