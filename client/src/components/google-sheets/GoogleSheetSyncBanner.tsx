import React, { useState } from "react";
import { useGoogleSheets } from "@/contexts/GoogleSheetsContext";
import { useFinancialData } from "@/contexts/FinancialDataContext";
import { Button } from "@/components/ui/button";
import {
  FileSpreadsheet,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FolderOpen,
  Power,
  Sparkles,
  ChevronRight,
  X,
} from "lucide-react";
import { toast } from "sonner";

export function GoogleSheetSyncBanner() {
  const {
    activeSheet,
    setIsSelectorOpen,
    syncStatus,
    lastSyncTime,
    syncError,
    autoSyncEnabled,
    setAutoSyncEnabled,
    syncData,
    disconnectSheet,
  } = useGoogleSheets();

  const financialData = useFinancialData();
  const [isDismissed, setIsDismissed] = useState(false);

  const handleManualSync = async () => {
    const payload = {
      totalIncome: financialData.totalIncome,
      totalExpenses: financialData.totalExpenses,
      netProfit: financialData.netProfit,
      receivables: financialData.receivables,
      payables: financialData.payables,
      outstandingLoans: financialData.outstandingLoans,
      transactions: financialData.transactions,
      expenses: financialData.expenses,
      orders: financialData.orders,
      clients: financialData.clients,
      projects: financialData.projects,
      loans: financialData.loans,
      products: financialData.products,
      salesMetrics: financialData.salesMetrics,
    };
    await syncData(payload, false);
  };

  // 1. Not connected state
  if (!activeSheet) {
    if (isDismissed) return null;

    return (
      <section className="relative overflow-hidden rounded-2xl border border-emerald-200/70 bg-gradient-to-r from-emerald-50/90 via-teal-50/50 to-blue-50/40 p-4 sm:p-5 shadow-xs mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-white border border-emerald-200/80 shadow-xs flex items-center justify-center text-emerald-600 shrink-0">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  Google Workspace Sync
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-1">
                Connect your Google Sheet to auto-store dashboard & records
              </h3>
              <p className="text-xs text-slate-600 mt-0.5 max-w-2xl leading-relaxed">
                Select a document or create a new sheet. All income, expenses, transactions, and dashboard metrics will store automatically in real time.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
            <Button
              onClick={() => setIsSelectorOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold h-9 px-4 rounded-xl shadow-xs gap-1.5"
            >
              <FolderOpen className="w-4 h-4" />
              Select Google Sheet
            </Button>
            <button
              onClick={() => setIsDismissed(true)}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
              title="Dismiss prompt"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    );
  }

  // 2. Connected state (Live synchronization toolbar)
  return (
    <section className="rounded-2xl border border-slate-200 bg-white/90 backdrop-blur-xs p-3.5 sm:p-4 shadow-xs mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Left: Connected Sheet Info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 truncate">
                {activeSheet.title}
              </span>
              {activeSheet.webViewLink && (
                <a
                  href={activeSheet.webViewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 hover:text-emerald-800 hover:underline shrink-0"
                >
                  Open in Sheets
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
              <span className="inline-flex items-center gap-1">
                <span
                  className={`w-2 h-2 rounded-full ${
                    syncStatus === "syncing"
                      ? "bg-amber-500 animate-ping"
                      : syncStatus === "error"
                      ? "bg-rose-500"
                      : "bg-emerald-500"
                  }`}
                />
                {syncStatus === "syncing"
                  ? "Synchronizing data..."
                  : syncStatus === "error"
                  ? "Sync error"
                  : autoSyncEnabled
                  ? "Live Auto-Sync Active"
                  : "Auto-Sync Paused"}
              </span>
              <span>·</span>
              <span>
                {lastSyncTime ? `Last synced at ${lastSyncTime}` : "Ready to sync"}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Controls & Actions */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end">
          {syncError && (
            <span
              className="text-[11px] text-rose-600 truncate max-w-[200px]"
              title={syncError}
            >
              {syncError}
            </span>
          )}

          <Button
            size="sm"
            variant="outline"
            disabled={syncStatus === "syncing"}
            onClick={handleManualSync}
            className="text-xs h-8 px-3 gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-slate-500 ${
                syncStatus === "syncing" ? "animate-spin" : ""
              }`}
            />
            Sync Now
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsSelectorOpen(true)}
            className="text-xs h-8 px-2.5 text-slate-600 hover:text-slate-900"
          >
            Change Sheet
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              if (window.confirm("Are you sure you want to disconnect this Google Sheet?")) {
                disconnectSheet();
              }
            }}
            className="text-xs h-8 px-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
            title="Disconnect Google Sheet"
          >
            <Power className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </section>
  );
}
