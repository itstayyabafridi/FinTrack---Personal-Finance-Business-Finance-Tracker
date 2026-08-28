import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGoogleSheets } from "@/contexts/GoogleSheetsContext";
import { useFinancialData } from "@/contexts/FinancialDataContext";
import { GoogleSignInButton } from "./GoogleSignInButton";
import {
  listSpreadsheets,
  type GoogleDriveFile,
  extractSpreadsheetId,
} from "@/lib/googleSheetsService";
import { getAccessToken } from "@/lib/googleAuth";
import {
  FileSpreadsheet,
  Plus,
  Search,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  FolderOpen,
  Link2,
  Sparkles,
  Loader2,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface GoogleSheetSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GoogleSheetSelectorModal({
  open,
  onOpenChange,
}: GoogleSheetSelectorModalProps) {
  const {
    user,
    isAuthenticated,
    isAuthenticating,
    signInWithGoogle,
    signOutGoogle,
    activeSheet,
    connectExistingSheet,
    createAndConnectNewSheet,
    syncData,
  } = useGoogleSheets();

  const financialData = useFinancialData();

  const [activeTab, setActiveTab] = useState<"browse" | "create" | "link">("browse");
  const [spreadsheets, setSpreadsheets] = useState<GoogleDriveFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [customTitle, setCustomTitle] = useState(
    `FinTrack Financial Ledger - ${new Date().toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    })}`
  );
  const [sheetUrlInput, setSheetUrlInput] = useState("");
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Fetch spreadsheets when authenticated & modal opens
  useEffect(() => {
    if (open && user) {
      loadDriveFiles();
    }
  }, [open, user]);

  const loadDriveFiles = async () => {
    setLoadingFiles(true);
    setFetchError(null);
    try {
      let token = await getAccessToken();
      if (!token) {
        token = await signInWithGoogle();
      }
      if (!token) {
        setLoadingFiles(false);
        return;
      }
      const files = await listSpreadsheets(token);
      setSpreadsheets(files);
    } catch (err: any) {
      console.error("Failed to list spreadsheets:", err);
      setFetchError(err?.message || "Could not load spreadsheets from Google Drive.");
    } finally {
      setLoadingFiles(false);
    }
  };

  const buildPayload = () => ({
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
  });

  const handleSelectFile = async (file: GoogleDriveFile) => {
    setIsSubmitting(true);
    try {
      const connected = await connectExistingSheet(file.id, file.name);
      toast.success(`Connected to "${file.name}"! Initializing sync...`);
      
      // Perform initial sync of current data
      await syncData(buildPayload(), false);
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to connect spreadsheet.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    setIsSubmitting(true);
    try {
      const connected = await createAndConnectNewSheet(customTitle.trim());
      toast.success(`New Google Sheet "${connected.title}" created in your Google Drive!`);
      
      // Perform immediate sync
      await syncData(buildPayload(), false);
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to create spreadsheet.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConnectByUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = extractSpreadsheetId(sheetUrlInput);
    if (!cleanId) {
      toast.error("Please paste a valid Google Sheet URL or spreadsheet ID.");
      return;
    }

    setIsSubmitting(true);
    try {
      const connected = await connectExistingSheet(cleanId);
      toast.success(`Connected to "${connected.title}"! Syncing records...`);
      
      // Sync data
      await syncData(buildPayload(), false);
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to connect to this Google Sheet URL.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredFiles = spreadsheets.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-2xl">
        {/* Modal Top Header */}
        <div className="p-6 pb-4 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 shadow-xs">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  Connect Google Sheets
                  {activeSheet && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                      Active
                    </span>
                  )}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 mt-0.5">
                  Select a document to store your dashboard data and synchronize financial records automatically.
                </DialogDescription>
              </div>
            </div>
          </div>

          {/* Current Google User Bar if logged in */}
          {user && (
            <div className="mt-4 flex items-center justify-between px-3 py-2 bg-slate-100/80 rounded-lg text-xs text-slate-600">
              <div className="flex items-center gap-2 truncate">
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                  {user.email?.[0]?.toUpperCase() || "G"}
                </div>
                <span className="truncate">
                  Signed in as <b>{user.email || user.displayName}</b>
                </span>
              </div>
              <button
                onClick={signOutGoogle}
                className="text-slate-500 hover:text-rose-600 font-medium transition-colors ml-2 shrink-0"
              >
                Sign out
              </button>
            </div>
          )}
        </div>

        {/* Body Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {!user ? (
            /* Step 1: Sign in with Google Screen */
            <div className="text-center py-6 px-4">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-base font-semibold text-slate-800 mb-1">
                Authorize Google Drive & Sheets Access
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
                Connect with permission to select existing spreadsheets from your Google Drive or generate a dedicated FinTrack financial sheet. All your transactions and dashboard updates will synchronize automatically.
              </p>

              <div className="flex justify-center">
                <GoogleSignInButton
                  onClick={async () => {
                    const token = await signInWithGoogle();
                    if (token) {
                      loadDriveFiles();
                    }
                  }}
                  isLoading={isAuthenticating}
                  text="Sign in with Google to Connect Sheets"
                />
              </div>

              <div className="mt-8 grid grid-cols-3 gap-3 text-left border-t border-slate-100 pt-6">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <b className="text-xs font-semibold text-slate-800 block mb-0.5">Live Dashboard Sync</b>
                  <p className="text-[11px] text-slate-500">Totals, profit margins, and metrics saved to Google Sheets.</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <b className="text-xs font-semibold text-slate-800 block mb-0.5">Automated Backups</b>
                  <p className="text-[11px] text-slate-500">Transactions and expense entries update automatically.</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <b className="text-xs font-semibold text-slate-800 block mb-0.5">Your Google Account</b>
                  <p className="text-[11px] text-slate-500">Your documents stay 100% in your personal Google Drive.</p>
                </div>
              </div>
            </div>
          ) : (
            /* Step 2: Tab Navigation & File Selector */
            <div>
              {/* Tab Selector */}
              <div className="flex border-b border-slate-200 mb-5 gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("browse")}
                  className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 transition-colors border-b-2 ${
                    activeTab === "browse"
                      ? "border-emerald-600 text-emerald-700"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  Select Existing Sheet
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("create")}
                  className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 transition-colors border-b-2 ${
                    activeTab === "create"
                      ? "border-emerald-600 text-emerald-700"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create New Sheet
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("link")}
                  className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 transition-colors border-b-2 ${
                    activeTab === "link"
                      ? "border-emerald-600 text-emerald-700"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Link2 className="w-3.5 h-3.5" />
                  Paste Link / ID
                </button>
              </div>

              {/* Tab 1: Browse Existing Sheets */}
              {activeTab === "browse" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <Input
                        placeholder="Search Google Sheets from your Drive..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 text-xs h-9 bg-slate-50 border-slate-200"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={loadDriveFiles}
                      disabled={loadingFiles}
                      className="h-9 px-3 text-xs gap-1.5 border-slate-200 text-slate-600"
                      title="Refresh file list"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loadingFiles ? "animate-spin" : ""}`} />
                      Refresh
                    </Button>
                  </div>

                  {fetchError && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                      <div>
                        <b>Could not list Drive spreadsheets:</b> {fetchError}
                        <div className="mt-1">
                          You can also create a new sheet using the tab above or paste its link directly.
                        </div>
                      </div>
                    </div>
                  )}

                  {loadingFiles ? (
                    <div className="py-12 text-center text-slate-500">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                      <p className="text-xs">Fetching your Google Sheets from Google Drive...</p>
                    </div>
                  ) : filteredFiles.length > 0 ? (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                      {filteredFiles.map((file) => {
                        const isCurrent = activeSheet?.id === file.id;
                        return (
                          <div
                            key={file.id}
                            className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                              isCurrent
                                ? "bg-emerald-50/60 border-emerald-300 ring-1 ring-emerald-400/30"
                                : "bg-white hover:bg-slate-50/80 border-slate-200"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                                <FileSpreadsheet className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-semibold text-slate-800 truncate flex items-center gap-1.5">
                                  {file.name}
                                  {isCurrent && (
                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-200 text-emerald-800 font-medium">
                                      Active
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400">
                                  {file.modifiedTime
                                    ? `Modified ${new Date(file.modifiedTime).toLocaleDateString()}`
                                    : "Google Spreadsheet"}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {file.webViewLink && (
                                <a
                                  href={file.webViewLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100"
                                  title="Open in Google Sheets"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                              <Button
                                size="sm"
                                variant={isCurrent ? "outline" : "default"}
                                disabled={isSubmitting}
                                onClick={() => handleSelectFile(file)}
                                className={`text-xs h-7 px-2.5 ${
                                  isCurrent
                                    ? "border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                                }`}
                              >
                                {isCurrent ? "Re-sync" : "Select & Sync"}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl">
                      <FileSpreadsheet className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      <p className="text-xs text-slate-600 font-medium">
                        {searchQuery ? "No matching spreadsheets found." : "No spreadsheets found in your Google Drive."}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Switch to "Create New Sheet" to instantly generate a dedicated FinTrack ledger.
                      </p>
                      <Button
                        size="sm"
                        onClick={() => setActiveTab("create")}
                        className="mt-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Create New Spreadsheet
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Create New Spreadsheet */}
              {activeTab === "create" && (
                <form onSubmit={handleCreateNew} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      New Spreadsheet Name
                    </label>
                    <Input
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      placeholder="e.g. FinTrack Financial Ledger"
                      className="text-xs h-9 bg-slate-50 border-slate-200"
                      required
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      This will create a new Google Sheet in your personal Google Drive with formatted tabs for Dashboard Summary, Transactions, Expenses, Sales, and Clients.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                    <b className="text-xs font-semibold text-slate-700 block">Pre-configured Sheet Tabs:</b>
                    <ul className="text-[11px] text-slate-600 grid grid-cols-2 gap-1 list-disc list-inside">
                      <li>Dashboard Summary</li>
                      <li>Transactions</li>
                      <li>Expenses</li>
                      <li>Sales & Orders</li>
                      <li>Clients & Projects</li>
                      <li>Loans</li>
                    </ul>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting || !customTitle.trim()}
                    className="w-full text-xs h-9 bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-medium"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating & Syncing to Google Sheets...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Create and Connect Spreadsheet
                      </>
                    )}
                  </Button>
                </form>
              )}

              {/* Tab 3: Paste Link or ID */}
              {activeTab === "link" && (
                <form onSubmit={handleConnectByUrl} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Google Sheet Link or ID
                    </label>
                    <Input
                      value={sheetUrlInput}
                      onChange={(e) => setSheetUrlInput(e.target.value)}
                      placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKv.../edit"
                      className="text-xs h-9 bg-slate-50 border-slate-200 font-mono"
                      required
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Open your Google Sheet in a browser and paste its URL from the address bar here.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting || !sheetUrlInput.trim()}
                    className="w-full text-xs h-9 bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-medium"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Verifying & Connecting...
                      </>
                    ) : (
                      <>
                        <Link2 className="w-4 h-4" />
                        Connect to Google Sheet
                      </>
                    )}
                  </Button>
                </form>
              )}

              {/* Safety & Disclosure Notice */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-start gap-2 text-[11px] text-slate-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  FinTrack safely updates the designated financial tabs. Any existing custom sheets in your spreadsheet remain preserved and untouched.
                </span>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
