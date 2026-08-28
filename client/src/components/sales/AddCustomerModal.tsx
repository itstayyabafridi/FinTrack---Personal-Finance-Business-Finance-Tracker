import { useState, useEffect } from "react";
import { X, User, Mail, Phone, MapPin, Tag } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useFinancialData } from "@/contexts/FinancialDataContext";
import type { Customer, CustomerStatus } from "@shared/types";

interface AddCustomerModalProps {
  open: boolean;
  onClose: () => void;
  customerToEdit?: Customer | null;
}

export function AddCustomerModal({ open, onClose, customerToEdit }: AddCustomerModalProps) {
  const { addCustomer, updateCustomer } = useFinancialData();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState<CustomerStatus>("new");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (customerToEdit) {
        setName(customerToEdit.name);
        setEmail(customerToEdit.email || "");
        setPhone(customerToEdit.phone || "");
        setWhatsapp(customerToEdit.whatsapp || "");
        setCity(customerToEdit.city || "");
        setAddress(customerToEdit.address || "");
        setStatus(customerToEdit.status);
        setNotes(customerToEdit.notes || "");
      } else {
        setName("");
        setEmail("");
        setPhone("");
        setWhatsapp("");
        setCity("");
        setAddress("");
        setStatus("new");
        setNotes("");
      }
      setErrors({});
    }
  }, [open, customerToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = "Customer name is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      if (customerToEdit) {
        updateCustomer(customerToEdit.id, {
          name: name.trim(),
          email: email.trim() || null,
          phone: phone.trim() || null,
          whatsapp: whatsapp.trim() || null,
          city: city.trim() || null,
          address: address.trim() || null,
          status,
          notes: notes.trim() || null,
        });
      } else {
        addCustomer({
          name: name.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          whatsapp: whatsapp.trim() || undefined,
          city: city.trim() || undefined,
          address: address.trim() || undefined,
          status,
          notes: notes.trim() || undefined,
        });
      }
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="p-0 max-w-md bg-white border border-[#e2e8f0] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
        <DialogTitle className="sr-only">
          {customerToEdit ? "Edit Customer" : "Add Customer"}
        </DialogTitle>

        <div className="p-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#f1f5f9] mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#eff6ff] text-[#2563eb] flex items-center justify-center">
                <User size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#0f172a]">
                  {customerToEdit ? "Edit Customer" : "Add Customer"}
                </h2>
                <p className="text-xs text-[#64748b]">
                  Maintain contact information and order history.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-[#94a3b8] hover:text-[#475569] hover:bg-[#f1f5f9] p-1.5 rounded-lg transition"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-[#1e293b]">
                Customer Name <span className="text-red-500">*</span>
              </Label>
              <Input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                }}
                placeholder="e.g. Sarah Khan"
                className={`h-10 rounded-xl bg-white border text-xs text-[#0f172a] ${
                  errors.name ? "border-red-400" : "border-[#e2e8f0]"
                }`}
              />
              {errors.name && <span className="text-[11px] text-red-500">{errors.name}</span>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-[#1e293b]">Email Address</Label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sarah@example.com"
                  className="h-9 rounded-xl bg-white border border-[#e2e8f0] text-xs text-[#0f172a]"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-[#1e293b]">Phone / Mobile</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+92 300 1234567"
                  className="h-9 rounded-xl bg-white border border-[#e2e8f0] text-xs text-[#0f172a]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-[#1e293b]">WhatsApp</Label>
                <Input
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+92 300 1234567"
                  className="h-9 rounded-xl bg-white border border-[#e2e8f0] text-xs text-[#0f172a]"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-[#1e293b]">City</Label>
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Karachi, Lahore, Islamabad"
                  className="h-9 rounded-xl bg-white border border-[#e2e8f0] text-xs text-[#0f172a]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-[#1e293b]">Customer Tier</Label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as CustomerStatus)}
                  className="w-full h-9 px-3 bg-white border border-[#e2e8f0] rounded-xl text-xs text-[#0f172a] outline-none"
                >
                  <option value="new">New Customer</option>
                  <option value="active">Active Regular</option>
                  <option value="vip">VIP Buyer</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-[#1e293b]">Shipping Address</Label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, Area, House #"
                  className="h-9 rounded-xl bg-white border border-[#e2e8f0] text-xs text-[#0f172a]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-[#1e293b]">
                Notes <span className="text-[#94a3b8] font-normal">(Optional)</span>
              </Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Preferred payment method, delivery instructions..."
                className="h-9 rounded-xl bg-white border border-[#e2e8f0] text-xs text-[#0f172a]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#f1f5f9]">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="h-10 px-5 rounded-xl border-[#e2e8f0] text-xs text-[#475569]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="h-10 px-6 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold shadow-xs"
              >
                {saving ? "Saving..." : customerToEdit ? "Update Customer" : "Add Customer"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
