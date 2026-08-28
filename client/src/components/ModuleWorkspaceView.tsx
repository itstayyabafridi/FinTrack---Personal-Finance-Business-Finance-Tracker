import { type ReactNode } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LedgerIllustration } from "@/components/LedgerIllustration";
import { useAppLayout } from "@/components/layout/AppLayout";

export interface StatItem {
  label: string;
  value: string | number;
}

interface ModuleWorkspaceViewProps {
  moduleName: string;
  moduleIcon: ReactNode;
  description?: string;
  stats?: StatItem[];
  emptyTitle?: string;
  emptySubtitle?: string;
  buttonLabel?: string;
  onAddClick?: () => void;
  children?: ReactNode;
  hasData?: boolean;
}

export function ModuleWorkspaceView({
  moduleName,
  moduleIcon,
  description = "This workspace is ready for your records. Add an entry to keep your personal and business books connected.",
  stats = [
    { label: "RECORDS", value: "0" },
    { label: "IN PROGRESS", value: "0" },
    { label: "NEEDS ATTENTION", value: "0" },
  ],
  emptyTitle,
  emptySubtitle = "Choose a first record and we'll keep the next step visible.",
  buttonLabel = "Add record",
  onAddClick,
  children,
  hasData = false,
}: ModuleWorkspaceViewProps) {
  const { openAddModal } = useAppLayout();

  const handleAdd = () => {
    if (onAddClick) {
      onAddClick();
    } else {
      openAddModal();
    }
  };

  const defaultEmptyTitle =
    moduleName === "Transactions"
      ? "Your ledger is waiting for its first signal"
      : `Your ${moduleName.toLowerCase()} workspace is clear`;

  return (
    <div className="module-card card-surface">
      {/* Module Card Top Header */}
      <div className="module-hero">
        <div className="module-icon">{moduleIcon}</div>
        <div>
          <div className="eyebrow">FINTRACK MODULE</div>
          <h2>{moduleName}</h2>
          <p>{description}</p>
        </div>
        <Button onClick={handleAdd} className="primary-btn">
          <Plus size={16} />
          {buttonLabel}
        </Button>
      </div>

      {/* Module 3-Column Stats Row */}
      <div className="module-stats">
        {stats.map((stat, idx) => (
          <div key={idx}>
            <span>{stat.label}</span>
            <b>{stat.value}</b>
          </div>
        ))}
      </div>

      {/* Main Body: Either Data Children or Empty State */}
      {hasData && children ? (
        <div className="mt-6">{children}</div>
      ) : (
        <div className="empty-table">
          <div className="empty-marker">✦</div>
          <LedgerIllustration />
          <div>
            <h3>{emptyTitle || defaultEmptyTitle}</h3>
            <p>{emptySubtitle}</p>
          </div>
          <Button onClick={handleAdd} className="primary-btn">
            <Plus size={16} />
            Add first record
          </Button>
        </div>
      )}
    </div>
  );
}
