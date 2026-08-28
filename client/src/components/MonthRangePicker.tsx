import { useState, useMemo } from "react";
import {
  CalendarDays,
  ChevronDown,
  Check,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export interface DateRangeBounds {
  start?: string; // YYYY-MM-DD
  end?: string;   // YYYY-MM-DD
  type: string;
}

interface MonthRangePickerProps {
  value: string;
  onChange: (value: string, bounds?: DateRangeBounds) => void;
  className?: string;
}

const PRESET_OPTIONS = [
  { id: "today", label: "Today", subtitle: "Current day activity" },
  { id: "this_week", label: "This week", subtitle: "Last 7 days" },
  { id: "this_month", label: "This month", subtitle: "Current billing cycle", isCurrent: true },
  { id: "last_month", label: "Last month", subtitle: "Previous full month" },
  { id: "last_3_months", label: "Last 3 months", subtitle: "Quarterly view" },
  { id: "this_year", label: "This year", subtitle: "Jan 1 - Dec 31, 2026" },
  { id: "all_time", label: "All time", subtitle: "Complete transaction history" },
];

const MONTH_NAMES = [
  { short: "Jan", full: "January", index: 0 },
  { short: "Feb", full: "February", index: 1 },
  { short: "Mar", full: "March", index: 2 },
  { short: "Apr", full: "April", index: 3 },
  { short: "May", full: "May", index: 4 },
  { short: "Jun", full: "June", index: 5 },
  { short: "Jul", full: "July", index: 6 },
  { short: "Aug", full: "August", index: 7 },
  { short: "Sep", full: "September", index: 8 },
  { short: "Oct", full: "October", index: 9 },
  { short: "Nov", full: "November", index: 10 },
  { short: "Dec", full: "December", index: 11 },
];

export function MonthRangePicker({ value, onChange, className = "" }: MonthRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"presets" | "months" | "custom">("presets");

  // For specific month selector
  const currentActualYear = new Date().getFullYear();
  const currentActualMonth = new Date().getMonth();
  const [selectedYear, setSelectedYear] = useState<number>(currentActualYear);

  // For custom range inputs
  const [customStart, setCustomStart] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split("T")[0];
  });
  const [customEnd, setCustomEnd] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  const handleSelectPreset = (preset: typeof PRESET_OPTIONS[0]) => {
    onChange(preset.label);
    setIsOpen(false);
  };

  const handleSelectMonth = (monthIndex: number) => {
    const monthObj = MONTH_NAMES[monthIndex];
    const label = `${monthObj.full} ${selectedYear}`;
    
    // Calculate start and end date for that month
    const start = new Date(selectedYear, monthIndex, 1).toISOString().split("T")[0];
    const end = new Date(selectedYear, monthIndex + 1, 0).toISOString().split("T")[0];

    onChange(label, { start, end, type: "specific_month" });
    setIsOpen(false);
  };

  const handleApplyCustom = () => {
    if (!customStart || !customEnd) return;
    const startFormatted = new Date(customStart).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const endFormatted = new Date(customEnd).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const label = `${startFormatted} – ${endFormatted}`;
    
    onChange(label, { start: customStart, end: customEnd, type: "custom" });
    setIsOpen(false);
  };

  const handleApplyQuickRange = (days: number, labelPrefix: string) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    const startIso = start.toISOString().split("T")[0];
    const endIso = end.toISOString().split("T")[0];
    setCustomStart(startIso);
    setCustomEnd(endIso);
    onChange(labelPrefix, { start: startIso, end: endIso, type: "custom" });
    setIsOpen(false);
  };

  const isPresetActive = (label: string) => value === label;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Select month or date range"
          className={`group flex items-center gap-2.5 h-[38px] px-3.5 bg-white hover:bg-[#f8fafc] active:bg-[#f1f5f9] text-[#334155] border border-[#e2e8f0] hover:border-[#cbd5e1] rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_2px_4px_rgba(0,0,0,0.06)] transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[#2f6bff]/20 ${className}`}
        >
          <div className="w-6 h-6 rounded-lg bg-[#eff6ff] text-[#2f6bff] flex items-center justify-center transition-colors group-hover:bg-[#dbeafe]">
            <CalendarDays size={14} className="stroke-[2.2]" />
          </div>
          
          <span className="text-xs font-semibold text-[#1e293b] tracking-tight whitespace-nowrap">
            {value || "This month"}
          </span>

          <ChevronDown
            size={14}
            className={`text-[#94a3b8] transition-transform duration-200 ml-0.5 ${
              isOpen ? "rotate-180 text-[#2f6bff]" : "group-hover:text-[#64748b]"
            }`}
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={6}
        className="w-[340px] sm:w-[370px] p-0 bg-white border border-[#e2e8f0] rounded-2xl shadow-xl shadow-slate-900/10 overflow-hidden animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 duration-150 z-50"
      >
        {/* Header with Navigation Tabs */}
        <div className="p-3 bg-[#f8fafc] border-b border-[#edf2f7]">
          <div className="flex items-center justify-between mb-2.5 px-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#0f172a]">
              <Clock size={13} className="text-[#2f6bff]" />
              <span>Timeframe & Months</span>
            </div>
            {value !== "This month" && (
              <button
                type="button"
                onClick={() => {
                  onChange("This month");
                  setIsOpen(false);
                }}
                className="text-[10px] font-semibold text-[#2f6bff] hover:text-[#1d4ed8] flex items-center gap-1 hover:underline cursor-pointer"
              >
                <RotateCcw size={10} />
                Reset to Current
              </button>
            )}
          </div>

          {/* Segmented Mode Selector */}
          <div className="grid grid-cols-3 gap-1 bg-[#e2e8f0]/70 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab("presets")}
              className={`py-1.5 text-[11px] font-semibold rounded-lg transition-all duration-150 text-center ${
                activeTab === "presets"
                  ? "bg-white text-[#0f172a] shadow-xs"
                  : "text-[#64748b] hover:text-[#0f172a]"
              }`}
            >
              Presets
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("months")}
              className={`py-1.5 text-[11px] font-semibold rounded-lg transition-all duration-150 text-center ${
                activeTab === "months"
                  ? "bg-white text-[#0f172a] shadow-xs"
                  : "text-[#64748b] hover:text-[#0f172a]"
              }`}
            >
              Pick Month
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("custom")}
              className={`py-1.5 text-[11px] font-semibold rounded-lg transition-all duration-150 text-center ${
                activeTab === "custom"
                  ? "bg-white text-[#0f172a] shadow-xs"
                  : "text-[#64748b] hover:text-[#0f172a]"
              }`}
            >
              Custom Range
            </button>
          </div>
        </div>

        {/* Tab 1: Presets */}
        {activeTab === "presets" && (
          <div className="p-2 space-y-0.5 max-h-[290px] overflow-y-auto">
            {PRESET_OPTIONS.map((preset) => {
              const isSelected = isPresetActive(preset.label);
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? "bg-[#eff6ff] text-[#1e40af]"
                      : "hover:bg-[#f8fafc] text-[#334155]"
                  }`}
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold ${isSelected ? "text-[#1d4ed8]" : "text-[#1e293b]"}`}>
                        {preset.label}
                      </span>
                      {preset.isCurrent && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[#dcfce7] text-[#15803d] rounded-md tracking-tight">
                          Current
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[#94a3b8] mt-0.5">
                      {preset.subtitle}
                    </span>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-[#2f6bff] text-white flex items-center justify-center">
                      <Check size={12} strokeWidth={2.8} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Tab 2: Specific Month Picker Grid */}
        {activeTab === "months" && (
          <div className="p-3">
            {/* Year Selector Control */}
            <div className="flex items-center justify-between mb-3 px-1">
              <button
                type="button"
                onClick={() => setSelectedYear((y) => y - 1)}
                className="w-7 h-7 rounded-lg border border-[#e2e8f0] bg-white hover:bg-[#f1f5f9] flex items-center justify-center text-[#64748b] transition-colors"
                aria-label="Previous year"
              >
                <ChevronLeft size={14} />
              </button>

              <div className="flex items-center gap-1.5">
                <CalendarIcon size={14} className="text-[#2f6bff]" />
                <span className="text-xs font-bold text-[#0f172a] tracking-tight">
                  {selectedYear}
                </span>
                {selectedYear === currentActualYear && (
                  <span className="text-[9px] font-medium bg-[#f1f5f9] text-[#64748b] px-1.5 py-0.5 rounded-md">
                    This Year
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedYear((y) => y + 1)}
                className="w-7 h-7 rounded-lg border border-[#e2e8f0] bg-white hover:bg-[#f1f5f9] flex items-center justify-center text-[#64748b] transition-colors"
                aria-label="Next year"
              >
                <ChevronRight size={14} />
              </button>
            </div>

            {/* 3x4 Month Grid */}
            <div className="grid grid-cols-3 gap-2">
              {MONTH_NAMES.map((m) => {
                const monthLabel = `${m.full} ${selectedYear}`;
                const isSelected = value === monthLabel;
                const isCurrentMonth =
                  selectedYear === currentActualYear && m.index === currentActualMonth;

                return (
                  <button
                    key={m.short}
                    type="button"
                    onClick={() => handleSelectMonth(m.index)}
                    className={`relative py-2.5 px-2 rounded-xl text-center transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? "bg-[#2f6bff] text-white font-bold shadow-sm shadow-[#2f6bff]/20"
                        : isCurrentMonth
                        ? "bg-[#eff6ff] text-[#2f6bff] font-semibold border border-[#bfdbfe]"
                        : "bg-[#f8fafc] hover:bg-[#eef2f6] text-[#334155] font-medium border border-transparent hover:border-[#e2e8f0]"
                    }`}
                  >
                    <div className="text-xs">{m.short}</div>
                    <div
                      className={`text-[9px] mt-0.5 tracking-tight ${
                        isSelected ? "text-blue-100" : "text-[#94a3b8]"
                      }`}
                    >
                      {m.full.substring(0, 4)}
                    </div>
                    {isCurrentMonth && !isSelected && (
                      <span className="absolute top-1 right-1.5 w-1.5 h-1.5 rounded-full bg-[#2f6bff]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Custom Date Range */}
        {activeTab === "custom" && (
          <div className="p-3.5 space-y-3">
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] font-bold text-[#64748b] uppercase tracking-wider mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full h-9 px-2.5 text-xs bg-[#f8fafc] border border-[#e2e8f0] focus:border-[#2f6bff] focus:bg-white rounded-xl text-[#1e293b] outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#64748b] uppercase tracking-wider mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full h-9 px-2.5 text-xs bg-[#f8fafc] border border-[#e2e8f0] focus:border-[#2f6bff] focus:bg-white rounded-xl text-[#1e293b] outline-none transition-all"
                />
              </div>
            </div>

            {/* Quick Presets for Custom */}
            <div>
              <span className="block text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-1.5">
                Quick Shortcuts
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleApplyQuickRange(7, "Last 7 Days")}
                  className="px-2.5 py-1 text-[10px] font-medium bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#334155] rounded-lg transition-colors"
                >
                  Last 7 Days
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyQuickRange(30, "Last 30 Days")}
                  className="px-2.5 py-1 text-[10px] font-medium bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#334155] rounded-lg transition-colors"
                >
                  Last 30 Days
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyQuickRange(90, "Last 90 Days")}
                  className="px-2.5 py-1 text-[10px] font-medium bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#334155] rounded-lg transition-colors"
                >
                  Last 90 Days
                </button>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleApplyCustom}
              className="w-full h-9 bg-[#2f6bff] hover:bg-[#245fe8] text-white font-semibold text-xs rounded-xl shadow-xs transition-all"
            >
              Apply Custom Range
            </Button>
          </div>
        )}

        {/* Footer info bar */}
        <div className="px-3.5 py-2 bg-[#f8fafc] border-t border-[#edf2f7] flex items-center justify-between text-[10px] text-[#64748b]">
          <div className="flex items-center gap-1.5 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
            <span className="truncate">Active: <b className="text-[#1e293b] font-semibold">{value}</b></span>
          </div>
          <span className="text-[#94a3b8] text-[9px] shrink-0 font-medium">FinTrack Filter</span>
        </div>
      </PopoverContent>
    </Popover>
  );
}
