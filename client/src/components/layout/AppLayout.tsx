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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserProfileMenu } from "@/components/UserProfileMenu";
import { AddTransactionModal } from "@/components/AddTransactionModal";
import { CompassMark } from "@/components/LedgerIllustration";
import { MonthRangePicker } from "@/components/MonthRangePicker";
import { useAuth } from "@/contexts/AuthContext";
import { useFinancialData } from "@/contexts/FinancialDataContext";

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
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRange, setSelectedRange] = useState("This month");

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
      }}
    >
      <div className="app-shell">
        {/* Left Sidebar */}
        <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
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
            <button
              className="mobile-close icon-btn"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>

          <div className="workspace-switch">
            <div className="workspace-avatar">{userInitial}</div>
            <div>
              <b>{displayName}'s workspace</b>
              <span>Personal + business</span>
            </div>
            <ChevronDown size={15} className="text-[#8b98aa]" />
          </div>

          <div className="nav-search">
            <Search size={15} />
            <input
              placeholder="Find a page"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="nav-group-label">Workspace</div>
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
          </nav>

          <div className="sidebar-bottom">
            <div className="support-card">
              <div className="support-icon">
                <HelpCircle size={16} />
              </div>
              <div>
                <b>Need a hand?</b>
                <span>See how FinTrack works</span>
              </div>
              <ArrowUpRight size={14} />
            </div>
            <div className="profile">
              <UserProfileMenu position="bottom-left" />
            </div>
          </div>
        </aside>

        {mobileOpen && (
          <div className="sidebar-scrim" onClick={() => setMobileOpen(false)} />
        )}

        {/* Main Content Area */}
        <main className="main-content">
          {/* Topbar */}
          <header className="topbar">
            <button
              className="mobile-menu icon-btn"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={19} />
            </button>
            <div className="breadcrumbs">
              <span>Workspace</span>
              <span className="crumb-slash">/</span>
              <b>{activeSection}</b>
            </div>
            <div className="top-actions">
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
