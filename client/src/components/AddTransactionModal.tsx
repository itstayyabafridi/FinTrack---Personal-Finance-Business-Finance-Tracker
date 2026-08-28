import { useState, useEffect } from "react";
import {
  X,
  TrendingUp,
  TrendingDown,
  GraduationCap,
  BriefcaseBusiness,
  CreditCard,
  HandCoins,
  Landmark,
  BookOpen,
  DollarSign,
  ChevronDown,
  Calendar,
  CheckCircle2,
  User,
  Users,
  Building,
  Sparkles,
  ShoppingBag,
  Megaphone,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useFinancialData } from "@/contexts/FinancialDataContext";
import type { TransactionType, PaymentMethod } from "@shared/types";

interface AddTransactionModalProps {
  open: boolean;
  onClose: () => void;
  defaultType?: TransactionType;
}

const TRANSACTION_TYPES: {
  value: TransactionType;
  label: string;
  icon: any;
  direction: "in" | "out";
  hasPersonField: boolean;
  personLabel?: string;
  personPlaceholder?: string;
  personSubtitle?: string;
}[] = [
  {
    value: "income",
    label: "Income",
    icon: TrendingUp,
    direction: "in",
    hasPersonField: false,
  },
  {
    value: "expense",
    label: "Expense",
    icon: TrendingDown,
    direction: "out",
    hasPersonField: false,
  },
  {
    value: "product_sale",
    label: "Product Sale",
    icon: ShoppingBag,
    direction: "in",
    hasPersonField: true,
    personLabel: "Customer Name (Buyer)",
    personPlaceholder: "e.g. Hamza Tariq, Online Customer",
    personSubtitle: "Name of customer or buyer who purchased product",
  },
  {
    value: "ad_spend",
    label: "Ad Spend / Marketing",
    icon: Megaphone,
    direction: "out",
    hasPersonField: true,
    personLabel: "Campaign / Platform Name",
    personPlaceholder: "e.g. Meta Ads Retargeting, TikTok UGC Boost",
    personSubtitle: "Advertising campaign name or marketing channel",
  },
  {
    value: "loan_received",
    label: "Loan Received",
    icon: Landmark,
    direction: "in",
    hasPersonField: true,
    personLabel: "Lender Name (Received From)",
    personPlaceholder: "e.g. Bank Alfalah, Ahmad Khan, Brother, Investor",
    personSubtitle: "Enter name of person, lender, or bank providing this loan",
  },
  {
    value: "owner_payment",
    label: "Owner Payment",
    icon: HandCoins,
    direction: "out",
    hasPersonField: true,
    personLabel: "Recipient Name (Owner / Partner)",
    personPlaceholder: "e.g. Tayyab Afridi, Co-Founder Name",
    personSubtitle: "Enter name of owner or partner receiving this withdrawal",
  },
  {
    value: "loan_repayment",
    label: "Loan Repayment",
    icon: BookOpen,
    direction: "out",
    hasPersonField: true,
    personLabel: "Lender / Creditor Name (Paid To)",
    personPlaceholder: "e.g. Bank Alfalah, Hamza",
    personSubtitle: "Name of the lender or creditor being repaid",
  },
  {
    value: "client_payment",
    label: "Client Payment",
    icon: BriefcaseBusiness,
    direction: "in",
    hasPersonField: true,
    personLabel: "Client / Customer Name",
    personPlaceholder: "e.g. Acme Corp, TechSoft Inc., John Doe",
    personSubtitle: "Client or organization sending payment",
  },
  {
    value: "student_fee",
    label: "Student Fee",
    icon: GraduationCap,
    direction: "in",
    hasPersonField: true,
    personLabel: "Student Name",
    personPlaceholder: "e.g. Sarah Khan, Muhammad Ali",
    personSubtitle: "Student submitting tuition or admission fee",
  },
  {
    value: "other_income",
    label: "Other Income",
    icon: DollarSign,
    direction: "in",
    hasPersonField: false,
  },
];

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cash", label: "Cash" },
  { value: "easypaisa", label: "Easypaisa" },
  { value: "jazzcash", label: "JazzCash" },
  { value: "card", label: "Card" },
  { value: "other", label: "Other" },
];

const CATEGORY_SUGGESTIONS: Record<string, string[]> = {
  income: ["Salary", "Freelance", "Consulting", "Dividends", "Rental Income", "General Income"],
  expense: ["Software & Tools", "Office Rent", "Marketing & Ads", "Utilities", "Travel & Transport", "Hardware", "Office Supplies"],
  product_sale: ["E-Commerce Sales", "Digital Product", "Physical Product", "Course Sales", "Shopify Store"],
  ad_spend: ["Meta Ads", "Google Search Ads", "TikTok Ads", "Influencer Marketing", "YouTube Promotion"],
  client_payment: ["Milestone Payment", "Advance Deposit", "Retainer Fee", "Project Delivery", "Hourly Billing"],
  student_fee: ["Monthly Tuition", "Admission Fee", "Course Enrollment", "Exam Fee", "Lab Fee"],
  owner_payment: ["Owner Draw", "Profit Distribution", "Partner Dividend", "Personal Withdrawal", "Reimbursement"],
  loan_received: ["Bank Loan", "Friend & Family Loan", "Business Credit", "Working Capital Loan"],
  loan_repayment: ["Principal Payment", "Monthly Installment", "Full Settlement"],
  other_income: ["Gift", "Tax Refund", "Bank Interest", "Bonus"],
};

export function AddTransactionModal({
  open,
  onClose,
  defaultType = "income",
}: AddTransactionModalProps) {
  const { addTransaction, students, clients, loans, owners, customers, products, adCampaigns } = useFinancialData();

  const [type, setType] = useState<TransactionType>(defaultType);
  const [personName, setPersonName] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [category, setCategory] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bank_transfer");
  const [notes, setNotes] = useState("");
  const [selectedRefId, setSelectedRefId] = useState<string>("");

  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showMethodDropdown, setShowMethodDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("");

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{
    personName?: string;
    description?: string;
    amount?: string;
  }>({});

  useEffect(() => {
    if (open) {
      setType(defaultType);
      setPersonName("");
      setDescription("");
      setAmount("");
      setDate(new Date().toISOString().split("T")[0]);
      setCategory("");
      setPaymentMethod("bank_transfer");
      setNotes("");
      setSelectedRefId("");
      setErrors({});
      setShowTypeDropdown(false);
      setShowMethodDropdown(false);
      setShowCategoryDropdown(false);

      if (defaultType === "owner_payment" && owners.length > 0) {
        setPersonName(owners[0].name || "Tayyab Afridi");
        setDescription(`Owner Payment - ${owners[0].name || "Tayyab Afridi"}`);
        setCategory("Owner Draw");
      } else if (defaultType === "loan_received") {
        setDescription("Loan Received");
        setCategory("Bank Loan");
      }
    }
  }, [open, defaultType, owners]);

  const activeTypeConfig =
    TRANSACTION_TYPES.find((t) => t.value === type) || TRANSACTION_TYPES[0];
  const TypeIcon = activeTypeConfig.icon;

  const currentCategories = CATEGORY_SUGGESTIONS[type] || CATEGORY_SUGGESTIONS.income;
  const filteredCategories = currentCategories.filter((c) =>
    c.toLowerCase().includes(categoryFilter.toLowerCase())
  );

  // Handle switching transaction type
  const handleTypeSelect = (newType: TransactionType) => {
    setType(newType);
    setShowTypeDropdown(false);
    setSelectedRefId("");

    if (newType === "owner_payment") {
      const defaultOwner = owners[0]?.name || "Tayyab Afridi";
      setPersonName(defaultOwner);
      setDescription(`Owner Payment - ${defaultOwner}`);
      setCategory("Owner Draw");
    } else if (newType === "loan_received") {
      setPersonName("");
      setDescription("Loan Received");
      setCategory("Bank Loan");
    } else if (newType === "loan_repayment") {
      setPersonName("");
      setDescription("Loan Repayment");
      setCategory("Principal Payment");
    } else if (newType === "product_sale") {
      setPersonName("");
      setDescription("Product Sale");
      setCategory("E-Commerce Sales");
    } else if (newType === "ad_spend") {
      setPersonName("");
      setDescription("Ad Campaign Spend");
      setCategory("Marketing & Ads");
    } else if (newType === "student_fee") {
      setPersonName("");
      setDescription("Student Fee");
      setCategory("Monthly Tuition");
    } else if (newType === "client_payment") {
      setPersonName("");
      setDescription("Client Payment");
      setCategory("Milestone Payment");
    } else if (newType === "income") {
      setDescription("");
      setCategory("General Income");
    } else if (newType === "expense") {
      setDescription("");
      setCategory("Software & Tools");
    }

    setErrors({});
  };

  // Sync description automatically when person name changes
  const handlePersonNameChange = (nameVal: string, refId?: string) => {
    setPersonName(nameVal);
    if (refId) setSelectedRefId(refId);
    if (errors.personName) setErrors((prev) => ({ ...prev, personName: undefined }));

    const trimmed = nameVal.trim();
    if (type === "owner_payment") {
      setDescription(trimmed ? `Owner Payment - ${trimmed}` : "Owner Payment");
    } else if (type === "loan_received") {
      setDescription(trimmed ? `Loan received from ${trimmed}` : "Loan Received");
    } else if (type === "loan_repayment") {
      setDescription(trimmed ? `Loan Repayment - ${trimmed}` : "Loan Repayment");
    } else if (type === "product_sale") {
      setDescription(trimmed ? `Product Sale - ${trimmed}` : "Product Sale");
    } else if (type === "ad_spend") {
      setDescription(trimmed ? `Ad Spend - ${trimmed}` : "Ad Campaign Spend");
    } else if (type === "student_fee") {
      setDescription(trimmed ? `Student Fee - ${trimmed}` : "Student Fee");
    } else if (type === "client_payment") {
      setDescription(trimmed ? `Client Payment - ${trimmed}` : "Client Payment");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { personName?: string; description?: string; amount?: string } = {};

    if (activeTypeConfig.hasPersonField && !personName.trim()) {
      newErrors.personName = `Please enter ${activeTypeConfig.personLabel?.toLowerCase() || "the name"}`;
    }

    if (!description.trim()) {
      newErrors.description = "Please enter a description";
    }

    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = "Please enter a valid amount greater than 0";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      let finalNotes = notes.trim();
      if (personName.trim()) {
        if (type === "loan_received") {
          finalNotes = `Lender: ${personName.trim()}${finalNotes ? ` | ${finalNotes}` : ""}`;
        } else if (type === "owner_payment") {
          finalNotes = `Recipient: ${personName.trim()}${finalNotes ? ` | ${finalNotes}` : ""}`;
        } else if (type === "product_sale") {
          finalNotes = `Customer: ${personName.trim()}${finalNotes ? ` | ${finalNotes}` : ""}`;
        } else if (type === "ad_spend") {
          finalNotes = `Campaign: ${personName.trim()}${finalNotes ? ` | ${finalNotes}` : ""}`;
        }
      }

      addTransaction({
        type,
        amount: numAmount,
        description: description.trim(),
        category: category.trim() || undefined,
        date,
        payment_method: paymentMethod,
        notes: finalNotes || undefined,
        reference_id: selectedRefId || undefined,
        reference_type:
          type === "student_fee"
            ? "student"
            : type === "client_payment"
            ? "client"
            : type === "loan_repayment" || type === "loan_received"
            ? "loan"
            : type === "owner_payment"
            ? "owner_payment"
            : type === "product_sale"
            ? "product"
            : type === "ad_spend"
            ? "ad_campaign"
            : undefined,
      });

      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="p-0 max-w-lg bg-white border border-[#e2e8f0] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
        <DialogTitle className="sr-only">Add Transaction</DialogTitle>

        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#f1f5f9] mb-5">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  activeTypeConfig.direction === "in"
                    ? "bg-[#eff6ff] text-[#2563eb]"
                    : "bg-[#fff7ed] text-[#ea580c]"
                }`}
              >
                <TypeIcon size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#0f172a] leading-snug">
                  Add Transaction
                </h2>
                <p className="text-xs text-[#64748b]">
                  {activeTypeConfig.direction === "in"
                    ? "Record income, sales, fee or loan received"
                    : "Record business expense, ad spend or withdrawal"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-[#94a3b8] hover:text-[#475569] hover:bg-[#f1f5f9] p-1.5 rounded-lg transition"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Row 1: Transaction Type & Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Type dropdown */}
              <div className="space-y-1.5 relative">
                <Label className="text-xs font-semibold text-[#1e293b]">Transaction Type</Label>
                <button
                  type="button"
                  onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                  className="w-full h-11 px-3.5 bg-white border border-[#e2e8f0] rounded-xl flex items-center justify-between text-xs text-[#0f172a] hover:border-[#cbd5e1] focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 transition"
                >
                  <div className="flex items-center gap-2 truncate">
                    <TypeIcon
                      size={15}
                      className={activeTypeConfig.direction === "in" ? "text-[#2563eb]" : "text-[#ea580c]"}
                    />
                    <span className="font-medium">{activeTypeConfig.label}</span>
                  </div>
                  <ChevronDown size={14} className="text-[#94a3b8] shrink-0" />
                </button>

                {showTypeDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setShowTypeDropdown(false)}
                    />
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-[#e2e8f0] rounded-xl shadow-xl z-40 py-1.5 max-h-64 overflow-y-auto">
                      {TRANSACTION_TYPES.map((t) => {
                        const Icon = t.icon;
                        const isSelected = t.value === type;
                        return (
                          <button
                            key={t.value}
                            type="button"
                            onClick={() => handleTypeSelect(t.value)}
                            className={`w-full px-3.5 py-2.5 flex items-center justify-between text-xs text-left transition ${
                              isSelected ? "bg-[#eff6ff] text-[#2563eb] font-semibold" : "text-[#334155] hover:bg-[#f8fafc]"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                                  t.direction === "in" ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"
                                }`}
                              >
                                <Icon size={13} />
                              </div>
                              <div>
                                <span className="font-medium text-xs text-[#0f172a] block">{t.label}</span>
                                <span className="text-[10px] text-[#94a3b8] block">
                                  {t.direction === "in" ? "Money In / Inflow" : "Money Out / Outflow"}
                                </span>
                              </div>
                            </div>
                            {isSelected && <span className="w-2 h-2 rounded-full bg-[#2563eb]" />}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Date Input */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#1e293b]">Date</Label>
                <div className="relative">
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-11 rounded-xl bg-white border border-[#e2e8f0] text-xs text-[#0f172a] pr-10 focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 transition"
                  />
                  <Calendar
                    size={15}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none"
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Dedicated Name Input (When applicable: Loan Received, Owner Payment, Repayment, Fee, Client, Product Sale, Ad Spend) */}
            {activeTypeConfig.hasPersonField && (
              <div className="p-3.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-[#0f172a] flex items-center gap-1.5">
                    <User size={14} className="text-[#2563eb]" />
                    {activeTypeConfig.personLabel}
                    <span className="text-red-500 font-bold">*</span>
                  </Label>
                  <span className="text-[10px] text-[#94a3b8]">Required</span>
                </div>

                <Input
                  value={personName}
                  onChange={(e) => handlePersonNameChange(e.target.value)}
                  placeholder={activeTypeConfig.personPlaceholder}
                  autoFocus
                  className={`h-11 rounded-xl bg-white border text-xs text-[#0f172a] placeholder:text-[#94a3b8] transition ${
                    errors.personName
                      ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      : "border-[#cbd5e1] focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20"
                  }`}
                />

                <p className="text-[11px] text-[#64748b]">
                  {activeTypeConfig.personSubtitle}
                </p>

                {errors.personName && (
                  <span className="text-[11px] text-red-500 font-medium block">
                    {errors.personName}
                  </span>
                )}

                {/* Quick Selection Shortcuts for Known Entities */}
                {type === "owner_payment" && (
                  <div className="flex items-center gap-1.5 pt-1 overflow-x-auto">
                    <span className="text-[10px] font-semibold text-[#64748b] shrink-0">Quick Select:</span>
                    {owners.map((o) => (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => handlePersonNameChange(o.name)}
                        className={`px-2 py-0.5 text-[11px] font-medium rounded-lg border transition ${
                          personName === o.name
                            ? "bg-[#eff6ff] text-[#2563eb] border-[#bfdbfe]"
                            : "bg-white text-[#475569] border-[#e2e8f0] hover:bg-[#f1f5f9]"
                        }`}
                      >
                        {o.name}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => handlePersonNameChange("Tayyab Afridi")}
                      className={`px-2 py-0.5 text-[11px] font-medium rounded-lg border transition ${
                        personName === "Tayyab Afridi"
                          ? "bg-[#eff6ff] text-[#2563eb] border-[#bfdbfe]"
                          : "bg-white text-[#475569] border-[#e2e8f0] hover:bg-[#f1f5f9]"
                      }`}
                    >
                      Tayyab Afridi
                    </button>
                  </div>
                )}

                {type === "loan_received" && loans.length > 0 && (
                  <div className="flex items-center gap-1.5 pt-1 overflow-x-auto">
                    <span className="text-[10px] font-semibold text-[#64748b] shrink-0">Existing Lenders:</span>
                    {Array.from(new Set(loans.map((l) => l.lender))).map((lender) => (
                      <button
                        key={lender}
                        type="button"
                        onClick={() => handlePersonNameChange(lender)}
                        className={`px-2 py-0.5 text-[11px] font-medium rounded-lg border transition ${
                          personName === lender
                            ? "bg-[#eff6ff] text-[#2563eb] border-[#bfdbfe]"
                            : "bg-white text-[#475569] border-[#e2e8f0] hover:bg-[#f1f5f9]"
                        }`}
                      >
                        {lender}
                      </button>
                    ))}
                  </div>
                )}

                {type === "product_sale" && customers.length > 0 && (
                  <div className="flex items-center gap-1.5 pt-1 overflow-x-auto">
                    <span className="text-[10px] font-semibold text-[#64748b] shrink-0">Recent Customers:</span>
                    {customers.slice(0, 4).map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handlePersonNameChange(c.name, c.id)}
                        className={`px-2 py-0.5 text-[11px] font-medium rounded-lg border transition ${
                          personName === c.name
                            ? "bg-[#eff6ff] text-[#2563eb] border-[#bfdbfe]"
                            : "bg-white text-[#475569] border-[#e2e8f0] hover:bg-[#f1f5f9]"
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                )}

                {type === "ad_spend" && adCampaigns.length > 0 && (
                  <div className="flex items-center gap-1.5 pt-1 overflow-x-auto">
                    <span className="text-[10px] font-semibold text-[#64748b] shrink-0">Active Campaigns:</span>
                    {adCampaigns.slice(0, 3).map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => handlePersonNameChange(a.name, a.id)}
                        className={`px-2 py-0.5 text-[11px] font-medium rounded-lg border transition ${
                          personName === a.name
                            ? "bg-[#eff6ff] text-[#2563eb] border-[#bfdbfe]"
                            : "bg-white text-[#475569] border-[#e2e8f0] hover:bg-[#f1f5f9]"
                        }`}
                      >
                        {a.name}
                      </button>
                    ))}
                  </div>
                )}

                {type === "student_fee" && students.length > 0 && (
                  <div className="flex items-center gap-1.5 pt-1 overflow-x-auto">
                    <span className="text-[10px] font-semibold text-[#64748b] shrink-0">Students:</span>
                    {students.slice(0, 4).map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handlePersonNameChange(s.name, s.id)}
                        className={`px-2 py-0.5 text-[11px] font-medium rounded-lg border transition ${
                          personName === s.name
                            ? "bg-[#eff6ff] text-[#2563eb] border-[#bfdbfe]"
                            : "bg-white text-[#475569] border-[#e2e8f0] hover:bg-[#f1f5f9]"
                        }`}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                )}

                {type === "client_payment" && clients.length > 0 && (
                  <div className="flex items-center gap-1.5 pt-1 overflow-x-auto">
                    <span className="text-[10px] font-semibold text-[#64748b] shrink-0">Clients:</span>
                    {clients.slice(0, 4).map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handlePersonNameChange(c.name, c.id)}
                        className={`px-2 py-0.5 text-[11px] font-medium rounded-lg border transition ${
                          personName === c.name
                            ? "bg-[#eff6ff] text-[#2563eb] border-[#bfdbfe]"
                            : "bg-white text-[#475569] border-[#e2e8f0] hover:bg-[#f1f5f9]"
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Row 3: Description & Amount */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#1e293b]">Description</Label>
                <Input
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (errors.description) setErrors((prev) => ({ ...prev, description: undefined }));
                  }}
                  placeholder="e.g. Monthly salary, SaaS tool subscription"
                  className={`h-11 rounded-xl bg-white border text-xs text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 transition ${
                    errors.description ? "border-red-400" : "border-[#e2e8f0]"
                  }`}
                />
                {errors.description && (
                  <span className="text-[11px] text-red-500 font-medium">{errors.description}</span>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#1e293b]">Amount (PKR / Rs.)</Label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#64748b]">
                    Rs.
                  </span>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      if (errors.amount) setErrors((prev) => ({ ...prev, amount: undefined }));
                    }}
                    placeholder="0.00"
                    className={`h-11 rounded-xl bg-white border text-xs font-semibold text-[#0f172a] pl-10 pr-3.5 placeholder:text-[#94a3b8] focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 transition ${
                      errors.amount ? "border-red-400" : "border-[#e2e8f0]"
                    }`}
                  />
                </div>
                {errors.amount && (
                  <span className="text-[11px] text-red-500 font-medium">{errors.amount}</span>
                )}
              </div>
            </div>

            {/* Row 4: Category & Payment Method */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category selector */}
              <div className="space-y-1.5 relative">
                <Label className="text-xs font-semibold text-[#1e293b]">Category</Label>
                <div className="relative">
                  <Input
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      setCategoryFilter(e.target.value);
                    }}
                    onFocus={() => setShowCategoryDropdown(true)}
                    placeholder="Select or type category..."
                    className="h-11 rounded-xl bg-white border border-[#e2e8f0] text-xs text-[#0f172a] pr-8 focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#475569] p-1"
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>

                {showCategoryDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setShowCategoryDropdown(false)}
                    />
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-[#e2e8f0] rounded-xl shadow-xl z-40 p-1.5 max-h-48 overflow-y-auto">
                      <div className="text-[10px] font-semibold text-[#94a3b8] px-2 py-1 uppercase tracking-wider">
                        Suggested Categories
                      </div>
                      {filteredCategories.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => {
                            setCategory(c);
                            setShowCategoryDropdown(false);
                          }}
                          className={`w-full px-2.5 py-1.5 text-xs text-left rounded-lg transition ${
                            category === c ? "bg-[#eff6ff] text-[#2563eb] font-semibold" : "text-[#334155] hover:bg-[#f8fafc]"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Payment Method selector */}
              <div className="space-y-1.5 relative">
                <Label className="text-xs font-semibold text-[#1e293b]">Payment Method</Label>
                <button
                  type="button"
                  onClick={() => setShowMethodDropdown(!showMethodDropdown)}
                  className="w-full h-11 px-3.5 bg-white border border-[#e2e8f0] rounded-xl flex items-center justify-between text-xs text-[#0f172a] hover:border-[#cbd5e1] focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 transition"
                >
                  <span className="font-medium capitalize">
                    {PAYMENT_METHODS.find((m) => m.value === paymentMethod)?.label || paymentMethod}
                  </span>
                  <ChevronDown size={14} className="text-[#94a3b8]" />
                </button>

                {showMethodDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setShowMethodDropdown(false)}
                    />
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-[#e2e8f0] rounded-xl shadow-xl z-40 py-1.5 max-h-48 overflow-y-auto">
                      {PAYMENT_METHODS.map((m) => (
                        <button
                          key={m.value}
                          type="button"
                          onClick={() => {
                            setPaymentMethod(m.value);
                            setShowMethodDropdown(false);
                          }}
                          className={`w-full px-3.5 py-2 text-xs text-left transition ${
                            paymentMethod === m.value
                              ? "bg-[#eff6ff] text-[#2563eb] font-semibold"
                              : "text-[#334155] hover:bg-[#f8fafc]"
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Row 5: Notes */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#1e293b]">
                Additional Notes <span className="text-[#94a3b8] font-normal">(Optional)</span>
              </Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Invoice number, payment reference, tracking ID..."
                className="h-10 rounded-xl bg-white border border-[#e2e8f0] text-xs text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 transition"
              />
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#f1f5f9]">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="h-11 px-5 rounded-xl border-[#e2e8f0] text-xs font-medium text-[#475569] hover:bg-[#f8fafc]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="h-11 px-6 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold shadow-sm transition"
              >
                {saving ? "Saving..." : "Save Transaction"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
