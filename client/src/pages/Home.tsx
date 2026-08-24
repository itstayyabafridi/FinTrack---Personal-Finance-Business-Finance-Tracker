/* Harbor OS: calm cartographic finance workspace with asymmetrical analytical surfaces, navy focus panels, and precise signals. */
import { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate } from "wouter";
import {
  ArrowDownRight, ArrowUpRight, BarChart3, Bell, BookOpen, BriefcaseBusiness, CalendarDays,
  ChevronDown, CircleDollarSign, CreditCard, FileText, HelpCircle, LayoutDashboard, Menu,
  MoreHorizontal, Plus, ReceiptText, Search, Settings2, Sparkles, Tags, TrendingUp, Users,
  WalletCards, X, Landmark, GraduationCap, HandCoins, SlidersHorizontal
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { UserProfileMenu } from "@/components/UserProfileMenu";
import { AddTransactionModal } from "@/components/AddTransactionModal";

const CompassMark = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="14" cy="14" r="12" stroke="#2F6BFF" strokeWidth="2"/>
    <path d="M14 4L16.5 9.5H11.5L14 4Z" fill="#2F6BFF"/>
    <path d="M14 24L16.5 18.5H11.5L14 24Z" fill="#2F6BFF" opacity="0.5"/>
    <path d="M4 14L9.5 16.5V11.5L4 14Z" fill="#2F6BFF" opacity="0.5"/>
    <path d="M24 14L18.5 16.5V11.5L24 14Z" fill="#2F6BFF"/>
    <circle cx="14" cy="14" r="3" fill="#2F6BFF"/>
  </svg>
);

const EmptyStateArt = () => (
  <svg width="92" height="70" viewBox="0 0 92 70" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="88" height="66" rx="8" stroke="#E6EDF5" strokeWidth="1.5" strokeDasharray="8 6"/>
    <path d="M46 14L54 26H38L46 14Z" fill="#2F6BFF" opacity="0.3"/>
    <circle cx="46" cy="46" r="12" stroke="#2F6BFF" strokeWidth="1.5" opacity="0.3"/>
    <path d="M46 38V46M46 50H46.01" stroke="#2F6BFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
  </svg>
);

const DashboardTexture = () => (
  <svg width="780" height="400" viewBox="0 0 780 400" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E8EEF6" strokeWidth="0.5"/>
      </pattern>
    </defs>
    <rect width="780" height="400" fill="url(#grid)" opacity="0.5"/>
  </svg>
);

const RouteArt = () => (
  <svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="routeGradient" x1="0" y1="0" x2="400" y2="300">
        <stop offset="0%" stopColor="#0D2A54" stopOpacity="0.98"/>
        <stop offset="100%" stopColor="#154588" stopOpacity="0.94"/>
      </linearGradient>
    </defs>
    <rect width="400" height="300" fill="url(#routeGradient)"/>
    <path d="M50 200 Q150 100 250 150 Q350 200 350 250" stroke="#66D8B6" strokeWidth="2" fill="none" opacity="0.6" strokeDasharray="8 6"/>
    <circle cx="50" cy="200" r="4" fill="#66D8B6" opacity="0.8"/>
    <circle cx="250" cy="150" r="4" fill="#66D8B6" opacity="0.8"/>
    <circle cx="350" cy="250" r="4" fill="#66D8B6" opacity="0.8"/>
  </svg>
);

type Section = "Overview" | "Transactions" | "Students & Fees" | "Clients" | "Projects" | "Expenses" | "Owner Payments" | "Loans / Qarza" | "Reports" | "Settings";

const nav: { label: Section; icon: any; group?: string }[] = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Transactions", icon: ReceiptText },
  { label: "Students & Fees", icon: GraduationCap },
  { label: "Clients", icon: Users },
  { label: "Projects", icon: BriefcaseBusiness },
  { label: "Expenses", icon: CreditCard },
  { label: "Owner Payments", icon: HandCoins },
  { label: "Loans / Qarza", icon: Landmark },
  { label: "Reports", icon: BarChart3 },
  { label: "Settings", icon: Settings2 },
];

const chartData = [
  { day: "01", income: 0, expenses: 0, profit: 0 }, { day: "05", income: 0, expenses: 0, profit: 0 },
  { day: "09", income: 0, expenses: 0, profit: 0 }, { day: "13", income: 0, expenses: 0, profit: 0 },
  { day: "17", income: 0, expenses: 0, profit: 0 }, { day: "21", income: 0, expenses: 0, profit: 0 },
  { day: "25", income: 0, expenses: 0, profit: 0 }, { day: "31", income: 0, expenses: 0, profit: 0 },
];

const metrics = [
  { label: "Total income", amount: "Rs. 0", helper: "No income recorded", icon: TrendingUp, tint: "blue" },
  { label: "Total expenses", amount: "Rs. 0", helper: "No expenses recorded", icon: CreditCard, tint: "coral" },
  { label: "Net profit", amount: "Rs. 0", helper: "Add transactions to calculate", icon: CircleDollarSign, tint: "mint" },
  { label: "Receivables", amount: "Rs. 0", helper: "Nothing outstanding", icon: WalletCards, tint: "lilac" },
  { label: "Payables", amount: "Rs. 0", helper: "Nothing due", icon: HandCoins, tint: "apricot" },
  { label: "Outstanding loans", amount: "Rs. 0", helper: "No active loans", icon: Landmark, tint: "navy" },
];

function MetricCard({ item }: { item: typeof metrics[number] }) {
  const Icon = item.icon;
  return <div className="metric-card">
    <div className={`metric-icon ${item.tint}`}><Icon size={17} strokeWidth={2.2} /></div>
    <div className="metric-label">{item.label}</div>
    <div className="metric-amount">{item.amount}</div>
    <div className="metric-helper"><span className="status-dot" />{item.helper}</div>
  </div>;
}

function EmptyTable({ section }: { section: Section }) {
  return <div className="empty-table">
    <div className="empty-marker">✦</div><EmptyStateArt />
    <div>
      <h3>{section === "Transactions" ? "Your ledger is waiting for its first signal" : `Your ${section.toLowerCase()} workspace is clear`}</h3>
      <p>Choose a first record and we’ll keep the next step visible.</p>
    </div>
    <Button onClick={() => toast.success("Transaction form is ready for your first record.")} className="primary-btn"><Plus size={16} />Add first record</Button>
  </div>;
}


// Map URL paths to section labels
const pathToSection: Record<string, Section> = {
  "/": "Overview",
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

const sectionToPath: Record<Section, string> = {
  "Overview": "/",
  "Transactions": "/transactions",
  "Students & Fees": "/students-fees",
  "Clients": "/clients",
  "Projects": "/projects",
  "Expenses": "/expenses",
  "Owner Payments": "/owner-payments",
  "Loans / Qarza": "/loans",
  "Reports": "/reports",
  "Settings": "/settings",
};

export default function Home() {
  const [location, navigate] = useLocation();
  const active = useMemo(() => pathToSection[location] || "Overview", [location]);
  const [range, setRange] = useState("This month");
  const [chartTab, setChartTab] = useState("Income");
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const navItems = useMemo(() => nav.filter(item => item.label.toLowerCase().includes(search.toLowerCase())), [search]);
  const activeMetric = chartTab === "Expenses" ? "expenses" : chartTab === "Profit" ? "profit" : "income";

  const handleNavClick = (section: Section) => {
    const path = sectionToPath[section];
    if (path) {
      navigate(path);
      setMobileOpen(false);
    }
  };

  return <div className="app-shell">
    <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
      <div className="brand"><div className="brand-mark"><CompassMark /></div><div><div className="brand-name">Fin<span>Track</span></div><div className="brand-sub">Personal & Business Finance OS</div></div><button className="mobile-close icon-btn" onClick={() => setMobileOpen(false)}><X size={18} /></button></div>
      <div className="workspace-switch"><div className="workspace-avatar">T</div><div><b>Tayyab's workspace</b><span>Personal + business</span></div><ChevronDown size={15} /></div>
      <div className="nav-search"><Search size={15} /><input placeholder="Find a page" value={search} onChange={e => setSearch(e.target.value)} /></div>
      <div className="nav-group-label">Workspace</div>
      <nav>{navItems.map(item => { const Icon = item.icon; return <button key={item.label} className={`nav-item ${active === item.label ? "active" : ""}`} onClick={() => handleNavClick(item.label)}><Icon size={17} /><span>{item.label}</span>{item.label === "Transactions" && <span className="nav-count">0</span>}</button>; })}</nav>
      <div className="sidebar-bottom"><div className="support-card"><div className="support-icon"><HelpCircle size={16} /></div><div><b>Need a hand?</b><span>See how FinTrack works</span></div><ArrowUpRight size={14} /></div><div className="profile"><UserProfileMenu position="bottom-left" /></div></div>
    </aside>
    {mobileOpen && <div className="sidebar-scrim" onClick={() => setMobileOpen(false)} />}
    <main className="main-content">
      <header className="topbar"><button className="mobile-menu icon-btn" onClick={() => setMobileOpen(true)}><Menu size={19} /></button><div className="breadcrumbs"><span>Workspace</span><span className="crumb-slash">/</span><b>{active}</b></div><div className="top-actions"><button className="top-icon icon-btn"><Bell size={17} /><i /></button><div className="top-divider" /><UserProfileMenu position="top-right" /></div></header>
      <div className="content-wrap" style={{ backgroundImage: `linear-gradient(180deg, rgba(246,249,253,.75), rgba(246,249,253,.96)), url("data:image/svg+xml;base64,${btoa('<svg width="780" height="400" viewBox="0 0 780 400" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E8EEF6" strokeWidth="0.5"/></pattern></defs><rect width="780" height="400" fill="url(#grid)" opacity="0.5"/></svg>')}` }}>
        <section className="page-heading"><div><div className="eyebrow">Friday, August 21, 2026 <span className="eyebrow-dot" /> Live workspace</div><h1>{active === "Overview" ? "Good morning, Tayyab" : active}</h1><p>{active === "Overview" ? "A clear read on what came in, what moved out, and what needs your attention." : `Keep your ${active.toLowerCase()} clear, current, and connected.`}</p></div><div className="heading-actions"><div className="select-wrap"><CalendarDays size={15} /><select value={range} onChange={e => setRange(e.target.value)}><option>Today</option><option>This week</option><option>This month</option><option>Last month</option><option>Last 3 months</option><option>This year</option><option>Custom range</option></select><ChevronDown size={14} /></div><Button onClick={() => setShowAdd(true)} className="primary-btn"><Plus size={16} />Add transaction</Button></div></section>
        {active === "Overview" ? <>
          <section className="position-strip"><div className="position-copy"><div className="eyebrow"><span className="compass-marker">✦</span> Position · {range}</div><h2>Know what moved.<br/><em>Choose the next record.</em></h2><p>Your workspace is clear right now. Start with the money that moved most recently and FinTrack will map the rest.</p><Button onClick={() => setShowAdd(true)} className="primary-btn"><Plus size={16} />Record a movement</Button></div><div className="position-coordinate"><span>FIN / 01</span><b>Rs. 0</b><small>Current financial position</small><div className="coordinate-line"><i /><i /><i /><i /><i /></div><div className="coordinate-footer"><span>LAT 24.8607</span><span>LONG 67.0011</span></div></div></section><section className="metric-grid">{metrics.map(item => <MetricCard key={item.label} item={item} />)}</section>
          <section className="analysis-grid"><div className="chart-card card-surface"><div className="card-header"><div><div className="eyebrow">Performance · {range}</div><h2>Financial performance</h2><p>Track your income, expenses and profit over time.</p></div><button className="icon-btn subtle"><SlidersHorizontal size={16} /></button></div><div className="chart-tabs">{["Income", "Expenses", "Profit", "Cash Flow"].map(tab => <button key={tab} className={chartTab === tab ? "selected" : ""} onClick={() => setChartTab(tab)}>{tab}</button>)}</div><div className="chart-area"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}><defs><linearGradient id="blueFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2F6BFF" stopOpacity={0.18}/><stop offset="100%" stopColor="#2F6BFF" stopOpacity={0}/></linearGradient></defs><CartesianGrid vertical={false} stroke="#e8eef6" strokeDasharray="4 5"/><XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "#9aa8bb", fontSize: 11 }} dy={8}/><YAxis tickLine={false} axisLine={false} tick={{ fill: "#9aa8bb", fontSize: 11 }} tickFormatter={v => `Rs.${v}`} /><Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e6ebf2", boxShadow: "0 10px 24px rgba(35,55,80,.08)" }} formatter={(value: any) => [`Rs. ${value.toLocaleString()}`, chartTab]} labelFormatter={label => `Aug ${label}, 2026`} /><Area type="monotone" dataKey={activeMetric} stroke="#2F6BFF" strokeWidth={2.5} fill="url(#blueFill)" dot={{ r: 3, fill: "#fff", stroke: "#2F6BFF", strokeWidth: 2 }} /></AreaChart></ResponsiveContainer><div className="chart-empty-note"><span>Not enough data to draw a trend</span><small>Add a transaction to see movement here</small></div></div><div className="chart-footer"><span><i className="legend-dot blue" />{chartTab}</span><span className="chart-footnote">Chart updates with your records</span></div></div>
            <div className="insight-card" style={{ backgroundImage: `linear-gradient(135deg, rgba(10,28,57,.98), rgba(14,47,88,.94)), url("data:image/svg+xml;base64,${btoa('<svg width=\"400\" height=\"300\" viewBox=\"0 0 400 300\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><defs><linearGradient id=\"routeGradient\" x1=\"0\" y1=\"0\" x2=\"400\" y2=\"300\"><stop offset=\"0%\" stopColor=\"#0D2A54\" stopOpacity=\"0.98\"/><stop offset=\"100%\" stopColor=\"#154588\" stopOpacity=\"0.94\"/></linearGradient></defs><rect width=\"400\" height=\"300\" fill=\"url(#routeGradient)\"/><path d=\"M50 200 Q150 100 250 150 Q350 200 350 250\" stroke=\"#66D8B6\" strokeWidth=\"2\" fill=\"none\" opacity=\"0.6\" strokeDasharray=\"8 6\"/><circle cx=\"50\" cy=\"200\" r=\"4\" fill=\"#66D8B6\" opacity=\"0.8\"/><circle cx=\"250\" cy=\"150\" r=\"4\" fill=\"#66D8B6\" opacity=\"0.8\"/><circle cx=\"350\" cy=\"250\" r=\"4\" fill=\"#66D8B6\" opacity=\"0.8\"/></svg>')}` }}><div className="insight-top"><div className="insight-orb"><Sparkles size={16} /></div><span>Signal check</span><button className="icon-btn dark"><MoreHorizontal size={18} /></button></div><h2>Financial insights</h2><p className="insight-lead">Your financial picture becomes clearer with every honest entry.</p><div className="insight-message"><div className="insight-pulse"><span /></div><div><b>Add transactions to unlock insights.</b><p>We’ll surface income trends, outstanding fees, and the next items that need your attention.</p></div></div><div className="insight-rule" /><div className="insight-footer"><span><i className="legend-dot mint" />Waiting for your first signal</span><ArrowUpRight size={16} /></div></div></section>
          <section className="transactions-card card-surface"><div className="card-header table-header"><div><div className="eyebrow">Ledger</div><h2>Recent transactions</h2><p>Your latest income, expenses, and payments in one place.</p></div><button className="text-btn" onClick={() => setActive("Transactions")}>View all <ArrowUpRight size={14} /></button></div><EmptyTable section="Transactions" /></section>
        </> : <section className="module-card card-surface"><div className="module-hero"><div className="module-icon"><Tags size={20}/></div><div><div className="eyebrow">FinTrack module</div><h2>{active}</h2><p>This workspace is ready for your records. Add an entry to keep your personal and business books connected.</p></div><Button onClick={() => setShowAdd(true)} className="primary-btn"><Plus size={16}/>Add record</Button></div><div className="module-stats"><div><span>Records</span><b>0</b></div><div><span>In progress</span><b>0</b></div><div><span>Needs attention</span><b>0</b></div></div><EmptyTable section={active} /></section>}
      </div>
    </main>
    <AddTransactionModal open={showAdd} onClose={() => setShowAdd(false)} />
  </div>;
}
