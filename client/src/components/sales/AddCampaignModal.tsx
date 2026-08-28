import { useState, useEffect } from "react";
import { X, Megaphone, DollarSign, Target, TrendingUp, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useFinancialData } from "@/contexts/FinancialDataContext";
import type { AdCampaign, AdPlatform, AdCampaignStatus } from "@shared/types";

interface AddCampaignModalProps {
  open: boolean;
  onClose: () => void;
  campaignToEdit?: AdCampaign | null;
}

const CAMPAIGN_PLATFORMS: { value: AdPlatform; label: string }[] = [
  { value: "meta", label: "Meta (Facebook & Instagram)" },
  { value: "google", label: "Google Search & Shopping" },
  { value: "tiktok", label: "TikTok Ads" },
  { value: "pinterest", label: "Pinterest Ads" },
  { value: "other", label: "Other Marketing Channel" },
];

export function AddCampaignModal({ open, onClose, campaignToEdit }: AddCampaignModalProps) {
  const { addAdCampaign, updateAdCampaign } = useFinancialData();

  const [name, setName] = useState("");
  const [platform, setPlatform] = useState<AdPlatform>("meta");
  const [budget, setBudget] = useState("");
  const [actualSpend, setActualSpend] = useState("");
  const [attributedRevenue, setAttributedRevenue] = useState("");
  const [ordersCount, setOrdersCount] = useState("0");
  const [clicks, setClicks] = useState("0");
  const [impressions, setImpressions] = useState("0");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<AdCampaignStatus>("active");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (campaignToEdit) {
        setName(campaignToEdit.name);
        setPlatform(campaignToEdit.platform);
        setBudget(String(campaignToEdit.budget));
        setActualSpend(String(campaignToEdit.actual_spend));
        setAttributedRevenue(String(campaignToEdit.attributed_revenue));
        setOrdersCount(String(campaignToEdit.orders_count));
        setClicks(String(campaignToEdit.clicks));
        setImpressions(String(campaignToEdit.impressions));
        setStartDate(campaignToEdit.start_date);
        setEndDate(campaignToEdit.end_date || "");
        setStatus(campaignToEdit.status);
        setNotes(campaignToEdit.notes || "");
      } else {
        setName("");
        setPlatform("meta");
        setBudget("");
        setActualSpend("");
        setAttributedRevenue("");
        setOrdersCount("0");
        setClicks("0");
        setImpressions("0");
        setStartDate(new Date().toISOString().split("T")[0]);
        setEndDate("");
        setStatus("active");
        setNotes("");
      }
      setErrors({});
    }
  }, [open, campaignToEdit]);

  const spendNum = parseFloat(actualSpend) || 0;
  const revNum = parseFloat(attributedRevenue) || 0;
  const roas = spendNum > 0 ? (revNum / spendNum).toFixed(2) : "0.00";
  const netCampaignProfit = revNum - spendNum;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = "Campaign name is required";
    if (isNaN(spendNum) || spendNum < 0) newErrors.actualSpend = "Valid spend is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      if (campaignToEdit) {
        updateAdCampaign(campaignToEdit.id, {
          name: name.trim(),
          platform,
          budget: parseFloat(budget) || spendNum,
          actual_spend: spendNum,
          attributed_revenue: revNum,
          orders_count: parseInt(ordersCount) || 0,
          clicks: parseInt(clicks) || 0,
          impressions: parseInt(impressions) || 0,
          start_date: startDate,
          end_date: endDate || null,
          status,
          notes: notes.trim() || null,
        });
      } else {
        addAdCampaign({
          name: name.trim(),
          platform,
          budget: parseFloat(budget) || spendNum,
          actual_spend: spendNum,
          attributed_revenue: revNum,
          orders_count: parseInt(ordersCount) || 0,
          clicks: parseInt(clicks) || 0,
          impressions: parseInt(impressions) || 0,
          start_date: startDate,
          end_date: endDate || undefined,
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
      <DialogContent className="p-0 max-w-lg bg-white border border-[#e2e8f0] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
        <DialogTitle className="sr-only">
          {campaignToEdit ? "Edit Ad Campaign" : "Add Ad Campaign"}
        </DialogTitle>

        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#f1f5f9] mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#eff6ff] text-[#2563eb] flex items-center justify-center">
                <Megaphone size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#0f172a]">
                  {campaignToEdit ? "Edit Marketing Campaign" : "Add Marketing Campaign"}
                </h2>
                <p className="text-xs text-[#64748b]">
                  Track ad spend, attributed revenue, and real-time ROAS.
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

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campaign Name & Platform */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#1e293b]">
                  Campaign Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                  }}
                  placeholder="e.g. Meta Ads - Summer Sale"
                  className={`h-10 rounded-xl bg-white border text-xs text-[#0f172a] ${
                    errors.name ? "border-red-400" : "border-[#e2e8f0]"
                  }`}
                />
                {errors.name && <span className="text-[11px] text-red-500">{errors.name}</span>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#1e293b]">Ad Platform</Label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as AdPlatform)}
                  className="w-full h-10 px-3 bg-white border border-[#e2e8f0] rounded-xl text-xs text-[#0f172a] outline-none"
                >
                  {CAMPAIGN_PLATFORMS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Financial Performance: Spend & Attributed Revenue */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#1e293b]">
                  Actual Spend (Rs.) <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  value={actualSpend}
                  onChange={(e) => setActualSpend(e.target.value)}
                  placeholder="0.00"
                  className="h-10 rounded-xl bg-white border border-[#e2e8f0] text-xs font-semibold text-[#0f172a]"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#1e293b]">
                  Attributed Sales (Rs.)
                </Label>
                <Input
                  type="number"
                  value={attributedRevenue}
                  onChange={(e) => setAttributedRevenue(e.target.value)}
                  placeholder="0.00"
                  className="h-10 rounded-xl bg-white border border-[#e2e8f0] text-xs font-semibold text-[#0f172a]"
                />
              </div>

              <div className="space-y-1 flex flex-col justify-center">
                <span className="text-[10px] uppercase font-bold text-[#64748b] tracking-wider">
                  Campaign ROAS
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-base font-extrabold ${
                      parseFloat(roas) >= 2.0
                        ? "text-[#16a34a]"
                        : parseFloat(roas) >= 1.0
                        ? "text-[#2563eb]"
                        : "text-[#dc2626]"
                    }`}
                  >
                    {roas}x
                  </span>
                  <span className="text-[10px] font-semibold text-[#64748b]">
                    Net: Rs. {netCampaignProfit.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Metrics: Orders, Clicks, Budget */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-[#1e293b]">Orders Generated</Label>
                <Input
                  type="number"
                  value={ordersCount}
                  onChange={(e) => setOrdersCount(e.target.value)}
                  className="h-9 rounded-xl bg-white border border-[#e2e8f0] text-xs text-[#0f172a]"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-[#1e293b]">Clicks</Label>
                <Input
                  type="number"
                  value={clicks}
                  onChange={(e) => setClicks(e.target.value)}
                  className="h-9 rounded-xl bg-white border border-[#e2e8f0] text-xs text-[#0f172a]"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-[#1e293b]">Allocated Budget</Label>
                <Input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="0.00"
                  className="h-9 rounded-xl bg-white border border-[#e2e8f0] text-xs text-[#0f172a]"
                />
              </div>
            </div>

            {/* Dates & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-[#1e293b]">Start Date</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-9 rounded-xl bg-white border border-[#e2e8f0] text-xs text-[#0f172a]"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-[#1e293b]">End Date (Optional)</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-9 rounded-xl bg-white border border-[#e2e8f0] text-xs text-[#0f172a]"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-[#1e293b]">Status</Label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as AdCampaignStatus)}
                  className="w-full h-9 px-3 bg-white border border-[#e2e8f0] rounded-xl text-xs text-[#0f172a] outline-none"
                >
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-[#1e293b]">
                Campaign Notes <span className="text-[#94a3b8] font-normal">(Optional)</span>
              </Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Target audience, creative angles, discount codes..."
                className="h-9 rounded-xl bg-white border border-[#e2e8f0] text-xs text-[#0f172a]"
              />
            </div>

            {/* Actions */}
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
                {saving ? "Saving..." : campaignToEdit ? "Update Campaign" : "Save Campaign"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
