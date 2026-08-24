import { useState, useEffect } from "react";
import { X, Plus, CheckCircle2, ArrowUpRight, User, Building2, CreditCard, Landmark, HandCoins, BookOpen, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import type { TransactionType, PaymentMethod } from "@shared/types";

interface AddTransactionModalProps {
  open: boolean;
  onClose: () => void;
}

const TRANSACTION_TYPES: { value: TransactionType; label: string; icon: any; description: string }[] = [
  { value: "income", label: "Income", icon: TrendingUp, description: "General income (salary, freelance, etc.)" },
  { value: "other_income", label: "Other Income", icon: DollarSign, description: "Miscellaneous income sources" },
  { value: "student_fee", label: "Student Fee", icon: User, description: "Fee received from a student" },
  { value: "client_payment", label: "Client Payment", icon: Building2, description: "Payment received from a client" },
  { value: "expense", label: "Expense", icon: CreditCard, description: "Business or personal expense" },
  { value: "owner_payment", label: "Owner Payment", icon: HandCoins, description: "Payment to business owner/partner" },
  { value: "loan_received", label: "Loan Received", icon: Landmark, description: "Money borrowed (increases cash, not income)" },
  { value: "loan_repayment", label: "Loan Repayment", icon: BookOpen, description: "Repayment of borrowed money" },
];

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "easypaisa", label: "Easypaisa" },
  { value: "jazzcash", label: "JazzCash" },
  { value: "card", label: "Card" },
  { value: "other", label: "Other" },
];

const CATEGORIES = {
  income: ["Salary", "Freelance", "Business Revenue", "Investment Returns", "Rental Income", "Other Income"],
  expense: ["Software", "Transport", "Office Supplies", "Marketing", "Utilities", "Rent", "Meals", "Travel", "Equipment", "Other"],
  student_fee: ["Tuition Fee", "Admission Fee", "Exam Fee", "Material Fee", "Other"],
  client_payment: ["Milestone Payment", "Full Payment", "Advance", "Retainer", "Other"],
  loan_received: ["Bank Loan", "Personal Loan", "Business Loan", "Family/Friends", "Other"],
  loan_repayment: ["Principal Repayment", "Interest Payment", "Full Settlement", "Other"],
  owner_payment: ["Profit Distribution", "Salary/Draw", "Reimbursement", "Other"],
  other_income: ["Gift", "Refund", "Interest Earned", "Dividends", "Other"],
};

export function AddTransactionModal({ open, onClose }: AddTransactionModalProps) {
  const { user } = useAuth();
  const [type, setType] = useState<TransactionType>("income");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bank_transfer");
  const [notes, setNotes] = useState("");
  const [referenceId, setReferenceId] = useState("");
  const [referenceType, setReferenceType] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const currentTypeConfig = TRANSACTION_TYPES.find(t => t.value === type);
  const currentCategories = type ? CATEGORIES[type as keyof typeof CATEGORIES] || [] : [];
  const suggestions = currentCategories.filter(item =>
    item.toLowerCase().includes(category.toLowerCase())
  ).slice(0, 5);

  const referenceError =
    type === "student_fee"
      ? "Select a student."
      : type === "client_payment"
      ? "Select a project."
      : type === "loan_repayment"
      ? "Select a loan."
      : type === "owner_payment"
      ? "Select an owner."
      : "";

  const errors = {
    description: touched.description && description.trim().length < 3 ? "Add at least 3 characters." : "",
    amount: touched.amount && (!amount || Number(amount) <= 0) ? "Enter an amount greater than Rs. 0." : "",
    category: touched.category && category.trim().length < 2 ? "Choose or enter a category." : "",
    date: touched.date && !date ? "Choose a transaction date." : "",
    referenceId:
      touched.referenceId &&
      ["student_fee", "client_payment", "loan_repayment", "owner_payment"].includes(type) &&
      !referenceId
        ? referenceError
        : "",
  };

  const isValid = Object.values(errors).every(error => !error);

  const handleSubmit = async () => {
    const newTouched = {
      description: true,
      amount: true,
      category: true,
      date: true,
      referenceId: ["student_fee", "client_payment", "loan_repayment", "owner_payment"].includes(type),
    };
    setTouched(newTouched);

    if (!isValid) return;
    if (!user) {
      toast.error("You must be logged in to add transactions");
      return;
    }

    setSaving(true);
    try {
      // Get user's default workspace
      const { data: workspaces } = await supabase
        .from("workspaces")
        .select("id")
        .eq("owner_id", user.id)
        .limit(1);
      const workspaceId = workspaces?.[0]?.id || null;

      const transactionData = {
        user_id: user.id,
        workspace_id: workspaceId,
        type,
        amount: Number(amount),
        description: description.trim(),
        category: category.trim() || null,
        date,
        payment_method: paymentMethod,
        notes: notes.trim() || null,
        reference_id: referenceId || null,
        reference_type: referenceType || null,
      };

      const { data: transaction, error } = await supabase
        .from("transactions")
        .insert(transactionData)
        .select()
        .single();

      if (error) throw error;

      // Handle type-specific additional records
      if (type === "student_fee" && referenceId) {
        await supabase.from("student_payments").insert({
          student_id: referenceId,
          transaction_id: transaction.id,
          amount: Number(amount),
          date,
          payment_method: paymentMethod,
          notes: notes.trim() || null,
        });
        await supabase.rpc("increment_student_received", {
          student_id: referenceId,
          amount: Number(amount),
        });
      } else if (type === "client_payment" && referenceId) {
        await supabase.from("project_payments").insert({
          project_id: referenceId,
          transaction_id: transaction.id,
          amount: Number(amount),
          date,
          payment_method: paymentMethod,
          notes: notes.trim() || null,
        });
        await supabase.rpc("increment_project_received", {
          project_id: referenceId,
          amount: Number(amount),
        });
      } else if (type === "loan_received" && referenceId) {
        await supabase.from("loans").insert({
          user_id: user.id,
          workspace_id: workspaceId,
          lender: description,
          principal_amount: Number(amount),
          remaining_amount: Number(amount),
          due_date: date,
          status: "active",
          reason: notes.trim() || null,
        });
      } else if (type === "loan_repayment" && referenceId) {
        await supabase.from("loan_payments").insert({
          loan_id: referenceId,
          transaction_id: transaction.id,
          amount: Number(amount),
          date,
          payment_method: paymentMethod,
          notes: notes.trim() || null,
        });
        const { data: loan } = await supabase
          .from("loans")
          .select("remaining_amount")
          .eq("id", referenceId)
          .single();
        if (loan) {
          const newRemaining = Math.max(0, loan.remaining_amount - Number(amount));
          await supabase
            .from("loans")
            .update({
              remaining_amount: newRemaining,
              status: newRemaining === 0 ? "paid" : "active",
              updated_at: new Date().toISOString(),
            })
            .eq("id", referenceId);
        }
      } else if (type === "owner_payment" && referenceId) {
        await supabase.from("owner_payments").insert({
          owner_id: referenceId,
          transaction_id: transaction.id,
          amount: Number(amount),
          date,
          payment_method: paymentMethod,
          notes: notes.trim() || null,
        });
      }

      setSaved(true);
      toast.success("Transaction saved successfully");
      setTimeout(() => {
        setSaved(false);
        setType("income");
        setDescription("");
        setAmount("");
        setCategory("");
        setDate(new Date().toISOString().split("T")[0]);
        setPaymentMethod("bank_transfer");
        setNotes("");
        setReferenceId("");
        setReferenceType("");
        setTouched({});
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Error saving transaction:", error);
      toast.error("Failed to save transaction. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saved && !saving) {
      setSaved(false);
      setType("income");
      setDescription("");
      setAmount("");
      setCategory("");
      setDate(new Date().toISOString().split("T")[0]);
      setPaymentMethod("bank_transfer");
      setNotes("");
      setReferenceId("");
      setReferenceType("");
      setTouched({});
      onClose();
    }
  };

  if (saved) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 size={32} className="text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Transaction Saved</h3>
            <p className="text-gray-500 mt-1">Your transaction has been recorded successfully.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const showReferenceField = ["student_fee", "client_payment", "loan_repayment", "owner_payment"].includes(type);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl">Add Transaction</DialogTitle>
          <DialogDescription>Capture a movement once. FinTrack will keep the rest of the workspace aligned.</DialogDescription>
        </DialogHeader>
        <div className="px-6 pb-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="e.g. Client milestone payment"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => setTouched(t => ({ ...t, description: true }))}
                aria-invalid={!!(touched.description && errors.description)}
                className="mt-1"
              />
              {touched.description && errors.description && <p className="text-sm text-destructive mt-1">{errors.description}</p>}
            </div>

            <div>
              <Label htmlFor="amount">Amount (Rs.)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                onBlur={() => setTouched(t => ({ ...t, amount: true }))}
                aria-invalid={!!(touched.amount && errors.amount)}
                className="mt-1"
              />
              {touched.amount && errors.amount && <p className="text-sm text-destructive mt-1">{errors.amount}</p>}
            </div>

            <div>
              <Label htmlFor="type">Transaction Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="type" className="mt-1">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {TRANSACTION_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>
                      <div className="flex items-center gap-2">
                        <t.icon size={14} className="text-primary" />
                        <span>{t.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                onBlur={() => setTouched(t => ({ ...t, date: true }))}
                aria-invalid={!!(touched.date && errors.date)}
                className="mt-1"
              />
              {touched.date && errors.date && <p className="text-sm text-destructive mt-1">{errors.date}</p>}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="category">Category</Label>
              <div className="relative mt-1">
                <Input
                  id="category"
                  placeholder="Search or select category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  onFocus={() => setTouched(t => ({ ...t, category: true }))}
                  onBlur={() => setTouched(t => ({ ...t, category: true }))}
                  aria-invalid={!!(touched.category && errors.category)}
                  list="category-suggestions"
                />
                <datalist id="category-suggestions">
                  {currentCategories.map(cat => <option key={cat} value={cat} />)}
                </datalist>
                {touched.category && errors.category && <p className="text-sm text-destructive mt-1">{errors.category}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger id="paymentMethod" className="mt-1">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map(pm => (
                    <SelectItem key={pm.value} value={pm.value}>
                      {pm.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {showReferenceField && (
              <div className="md:col-span-2">
                <Label htmlFor="referenceId">
                  {type === "student_fee" ? "Student" :
                   type === "client_payment" ? "Project" :
                   type === "loan_repayment" ? "Loan" : "Owner"}
                </Label>
                <Select value={referenceId} onValueChange={setReferenceId}>
                  <SelectTrigger id="referenceId" className="mt-1">
                    <SelectValue placeholder={type === "student_fee" ? "Select student" : type === "client_payment" ? "Select project" : type === "loan_repayment" ? "Select loan" : "Select owner"} />
                  </SelectTrigger>
                  <SelectContent>
                    {type === "student_fee" && (
                      <>
                        <SelectItem value="">-- Select Student --</SelectItem>
                      </>
                    )}
                    {type === "client_payment" && (
                      <>
                        <SelectItem value="">-- Select Project --</SelectItem>
                      </>
                    )}
                    {type === "loan_repayment" && (
                      <>
                        <SelectItem value="">-- Select Loan --</SelectItem>
                      </>
                    )}
                    {type === "owner_payment" && (
                      <>
                        <SelectItem value="">-- Select Owner --</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
                {touched.referenceId && errors.referenceId && <p className="text-sm text-destructive mt-1">{errors.referenceId}</p>}
              </div>
            )}

            <div className="md:col-span-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                type="text"
                placeholder="Additional notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter className="pt-4 border-t">
            <Button variant="ghost" onClick={handleClose} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saving} className="primary-btn">
              {saving ? "Saving..." : <><CheckCircle2 size={16} className="mr-2" /> Save Transaction</>}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}