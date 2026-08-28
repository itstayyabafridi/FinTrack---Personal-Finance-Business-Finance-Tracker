import { useState, useMemo, createContext, useContext, type ReactNode } from "react";
import { useLocation } from "wouter";
import {
  LayoutDashboard,
  ReceiptText,
  ShoppingBag,
  GraduationCap,
  Users,
  BriefcaseBusiness,
  CreditCard,
  HandCoins,
  Landmark,
  BarChart3,
  Settings2,
  Search,
  ChevronDown,
  HelpCircle,
  ArrowUpRight,
  Menu,
  Bell,
  X,
  CalendarDays,
  Plus,
  FileSpreadsheet,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserProfileMenu } from "@/components/UserProfileMenu";
import { AddTransactionModal } from "@/components/AddTransactionModal";
import { CompassMark } from "@/components/LedgerIllustration";
import { MonthRangePicker } from "@/components/MonthRangePicker";
import { useAuth } from "@/contexts/AuthContext";
import { useFinancialData } from "@/contexts/FinancialDataContext";
import { useGoogleSheets } from "@/contexts/GoogleSheetsContext";

export type NavSection =
  | "Overview"
  | "Sales & Business"
  | "Transactions"
  | "Students & Fees"
  | "Clients"
  | "Projects"
  | "Expenses"
  | "Owner Payments"
  | "Loans / Qarza"
  | "Reports"
  | "Settings";

interface NavItemConfig {
  label: NavSection;
  path: string;
  icon: any;
  hasCount?: boolean;
}

export const NAV_ITEMS: NavItemConfig[] = [
  { label: "Overview", path: "/", icon: LayoutDashboard },
  { label: "Sales & Business", path: "/sales-business", icon: ShoppingBag },
  { label: "Transactions", path: "/transactions", icon: ReceiptText, hasCount: true },
  { label: "Students & Fees", path: "/students-fees", icon: GraduationCap },
  { label: "Clients", path: "/clients", icon: Users },
  { label: "Projects", path: "/projects", icon: BriefcaseBusiness },
  { label: "Expenses", path: "/expenses", icon: CreditCard },
  { label: "Owner Payments", path: "/owner-payments", icon: HandCoins },
  { label: "Loans / Qarza", path: "/loans", icon: Landmark },
  { label: "Reports", path: "/reports", icon: BarChart3 },
  { label: "Settings", path: "/settings", icon: Settings2 },
];

const pathToSection: Record<string, NavSection> = {
  "/": "Overview",
  "/sales-business": "Sales & Business",
  "/sales": "Sales & Business",
  "/products": "Sales & Business",
  "/transactions": "Transactions",
  "/students-fees": "Students & Fees",
  "/clients": "Clients",
  "/projects": "Projects",
  "/expenses": "Expenses",
  "/owner-payments": "Owner Payments",
  "/loans": "Loans / Qarza",
  "/reports": "Reports",
  "/settings": "Settings",
};

interface LayoutContextType {
  openAddModal: () => void;
  selectedRange: string;
  setSelectedRange: (range: string) => void;
  activeSection: NavSection;
  collapsed: boolean;
  toggleSidebar: () => void;
}

const LayoutContext = createContext<LayoutContextType | null>(null);

export const useAppLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error("useAppLayout must be used within AppLayout");
  }
  return context;
};

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [location, navigate] = useLocation();
  const { profile, user } = useAuth();
  const { transactions } = useFinancialData();
  const { activeSheet, setIsSelectorOpen, syncStatus } = useGoogleSheets();
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRange, setSelectedRange] = useState("This month");
  const [collapsed, setCollapsed] = useState<boolean>(false);

  const toggleSidebar = () => {
    setCollapsed((prev) => !prev);
  };

  const activeSection = useMemo(() => {
    return pathToSection[location] || "Overview";
  }, [location]);

  const filteredNavItems = useMemo(() => {
    if (!search.trim()) return NAV_ITEMS;
    return NAV_ITEMS.filter((item) =>
      item.label.toLowerCase().includes(search.toLowerCase().trim())
    );
  }, [search]);

  const handleNavClick = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Tayyab";
  const userInitial = displayName.charAt(0).toUpperCase();

  // Dynamic formatted date e.g. "FRIDAY, AUGUST 21, 2026"
  const formattedDate = useMemo(() => {
    try {
      const now = new Date();
      return now.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }).toUpperCase();
    } catch {
      return "FRIDAY, AUGUST 21, 2026";
    }
  }, []);

  const pageSubtitles: Record<NavSection, string> = {
    Overview: "A clear read on what came in, what moved out, and what needs your attention.",
    "Sales & Business": "Track physical and digital products, orders, real net profit, advertising ROAS, inventory, and customer lifetime value.",
    Transactions: "Keep your transactions clear, current, and connected.",
    "Students & Fees": "Track student enrollments, fee structures, and payment history.",
    Clients: "Keep your client relationships and billing clear, current, and connected.",
    Projects: "Keep your projects, deliverables, and budgets clear, current, and connected.",
    Expenses: "Keep your personal and business expenses clear, current, and connected.",
    "Owner Payments": "Manage profit distributions, owner withdrawals, and partner capital.",
    "Loans / Qarza": "Track borrowed amounts, repayments, and outstanding balances.",
    Reports: "Deep insights into your financial performance across all workspaces.",
    Settings: "Configure currency, workspace preferences, profile, and categories.",
  };

  const isOverview = activeSection === "Overview";

  return (
    <LayoutContext.Provider
      value={{
        openAddModal: () => setShowAddModal(true),
        selectedRange,
        setSelectedRange,
        activeSection,
        collapsed,
        toggleSidebar,
      }}
    >
      <div className="app-shell">
        {/* Left Sidebar */}
        <aside className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "open" : ""}`}>
          {collapsed ? (
            <div className="flex flex-col h-full w-full items-center justify-between py-2">
              <div className="flex flex-col items-center w-full gap-2">
                {/* Expand toggle button */}
                <button
                  type="button"
                  onClick={toggleSidebar}
                  className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/80 hover:bg-blue-100 flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                  title="Show sidebar"
                  aria-label="Show sidebar"
                >
                  <PanelLeftOpen size={19} />
                </button>

                <div className="w-8 h-px bg-slate-200 my-0.5" />

                {/* Avatar */}
                <div
                  className="w-9 h-9 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-xs shrink-0"
                  title={`${displayName}'s workspace`}
                >
                  {userInitial}
                </div>

                {/* Nav icons */}
                <nav className="w-full flex flex-col items-center gap-1.5 py-1">
                  {filteredNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.label;
                    return (
                      <button
                        key={item.label}
                        type="button"
                        className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                          isActive
                            ? "bg-[#eaf1ff] text-[#2f6bff] font-semibold before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-r-full before:bg-[#2f6bff]"
                            : "text-[#7b8a9e] hover:bg-[#f1f5fa] hover:text-[#2d3748]"
                        }`}
                        onClick={() => handleNavClick(item.path)}
                        title={item.label}
                        aria-label={item.label}
                      >
                        <Icon size={18} />
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    className="relative w-10 h-10 rounded-xl flex items-center justify-center text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                    onClick={() => {
                      setIsSelectorOpen(true);
                      setMobileOpen(false);
                    }}
                    title={activeSheet ? `Google Sheets: ${activeSheet.title}` : "Connect Google Sheets"}
                    aria-label="Google Sheets"
                  >
                    <FileSpreadsheet size={18} />
                    {activeSheet && (
                      <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
                    )}
                  </button>
                </nav>
              </div>

              {/* Bottom profile avatar */}
              <div className="sidebar-bottom w-full flex flex-col items-center pt-2">
                <UserProfileMenu position="bottom-left" />
              </div>
            </div>
          ) : (
            <>
              {/* Brand Header with Collapse Toggle */}
              <div className="brand">
                <div className="brand-mark">
                  <CompassMark />
                </div>
                <div>
                  <div className="brand-name">
                    Fin<span>Track</span>
                  </div>
                  <div className="brand-sub">Personal & Business Finance OS</div>
                </div>

                {/* Desktop Collapse Button */}
                <button
                  type="button"
                  onClick={toggleSidebar}
                  className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-colors ml-auto shrink-0 cursor-pointer"
                  title="Hide sidebar"
                  aria-label="Hide sidebar"
                >
                  <PanelLeftClose size={17} />
                </button>

                {/* Mobile Close Button */}
                <button
                  className="mobile-close icon-btn"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Find a page */}
              <div className="nav-search">
                <Search size={15} />
                <input
                  placeholder="Find a page"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Scrollable Navigation List */}
              <nav>
                {filteredNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.label;
                  return (
                    <button
                      key={item.label}
                      className={`nav-item ${isActive ? "active" : ""}`}
                      onClick={() => handleNavClick(item.path)}
                    >
                      <Icon size={17} />
                      <span>{item.label}</span>
                      {item.hasCount && <span className="nav-count">{transactions.length}</span>}
                    </button>
                  );
                })}

                <button
                  type="button"
                  className="nav-item"
                  onClick={() => {
                    setIsSelectorOpen(true);
                    setMobileOpen(false);
                  }}
                >
                  <FileSpreadsheet size={17} className="text-emerald-600" />
                  <span>Google Sheets</span>
                  {activeSheet ? (
                    <span className="nav-count" style={{ background: "#d1fae5", color: "#065f46" }}>
                      Live
                    </span>
                  ) : (
                    <span className="nav-count">Sync</span>
                  )}
                </button>
              </nav>

              {/* Anchored Bottom Section */}
              <div className="sidebar-bottom">
                <div className="support-card">
                  <div className="support-icon">
                    <HelpCircle size={15} />
                  </div>
                  <div>
                    <b>Need a hand?</b>
                    <span>FinTrack guide & docs</span>
                  </div>
                  <ArrowUpRight size={13} />
                </div>
                <div className="profile">
                  <UserProfileMenu
                    position="bottom-left"
                    trigger={
                      <button
                        type="button"
                        className="flex items-center gap-2.5 w-full text-left p-1.5 rounded-lg hover:bg-slate-100/70 transition-colors cursor-pointer"
                      >
                        <div className="profile-avatar shrink-0">{userInitial}</div>
                        <div className="min-w-0 flex-1">
                          <b className="truncate text-xs text-slate-700 block">{displayName}</b>
                          <span className="text-[10px] text-slate-400 block truncate">
                            {user?.email || "Personal & Business"}
                          </span>
                        </div>
                        <ChevronDown size={14} className="text-slate-400 shrink-0 ml-auto" />
                      </button>
                    }
                  />
                </div>
              </div>
            </>
          )}
        </aside>

        {mobileOpen && (
          <div className="sidebar-scrim" onClick={() => setMobileOpen(false)} />
        )}

        {/* Main Content Area */}
        <main className={`main-content ${collapsed ? "collapsed" : ""}`}>
          {/* Topbar */}
          <header className="topbar">
            {/* Mobile-only menu button */}
            <button
              type="button"
              className="mobile-menu icon-btn"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={19} />
            </button>

            <div className="breadcrumbs">
              <span>FinTrack</span>
              <span className="crumb-slash">/</span>
              <b>{activeSection}</b>
            </div>
            <div className="top-actions">
              <button
                onClick={() => setIsSelectorOpen(true)}
                className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                  activeSheet
                    ? "bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 border-emerald-200"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
                }`}
                title={activeSheet ? `Connected to ${activeSheet.title}` : "Connect Google Sheet"}
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="max-w-[120px] truncate">
                  {activeSheet ? activeSheet.title : "Google Sheets"}
                </span>
                {activeSheet && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      syncStatus === "syncing"
                        ? "bg-amber-500 animate-pulse"
                        : syncStatus === "error"
                        ? "bg-rose-500"
                        : "bg-emerald-500"
                    }`}
                  />
                )}
              </button>

              <button className="top-icon icon-btn" aria-label="Notifications">
                <Bell size={17} />
                <i />
              </button>
              <div className="top-divider" />
              <UserProfileMenu position="top-right" />
            </div>
          </header>

          {/* Page Content Container */}
          <div
            className="content-wrap"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(246,249,253,.75), rgba(246,249,253,.96)), url("data:image/svg+xml;base64,${btoa(
                '<svg width="780" height="400" viewBox="0 0 780 400" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E8EEF6" strokeWidth="0.5"/></pattern></defs><rect width="780" height="400" fill="url(#grid)" opacity="0.5"/></svg>'
              )}")`,
            }}
          >
            {/* Top Page Heading (Consistent across all sections) */}
            <section className="page-heading">
              <div>
                <div className="eyebrow">
                  {formattedDate} <span className="eyebrow-dot" /> Live workspace
                </div>
                <h1>
                  {isOverview ? `Good morning, ${displayName}` : activeSection}
                </h1>
                <p>{pageSubtitles[activeSection]}</p>
              </div>

              <div className="heading-actions">
                <MonthRangePicker
                  value={selectedRange}
                  onChange={(val) => setSelectedRange(val)}
                />
                <Button
                  onClick={() => setShowAddModal(true)}
                  className="primary-btn"
                >
                  <Plus size={16} />
                  Add transaction
                </Button>
              </div>
            </section>

            {/* Render Current Section Content */}
            {children}
          </div>
        </main>

        <AddTransactionModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
        />
      </div>
    </LayoutContext.Provider>
  );
}
