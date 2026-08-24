import { useState } from "react";
import { Plus, Search, HandCoins, DollarSign, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddTransactionModal } from "@/components/AddTransactionModal";

export default function OwnerPayments() {
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="page-container">
      <section className="page-heading">
        <div>
          <div className="eyebrow">Owner Payments</div>
          <h1>Owner Payments</h1>
          <p>Manage profit distributions and owner withdrawals.</p>
        </div>
        <div className="heading-actions">
          <div className="search-wrap">
            <Search size={15} />
            <Input
              placeholder="Search owner payments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={() => setShowAdd(true)} className="primary-btn">
            <Plus size={16} /> Add Payment
          </Button>
        </div>
      </section>

      <div className="module-card card-surface">
        <div className="module-hero">
          <div className="module-icon">
            <HandCoins size={20} />
          </div>
          <div>
            <div className="eyebrow">FinTrack module</div>
            <h2>Owner Payments</h2>
            <p>This workspace is ready for your records. Add an entry to keep your personal and business books connected.</p>
          </div>
          <Button onClick={() => setShowAdd(true)} className="primary-btn">
            <Plus size={16} /> Add record
          </Button>
        </div>
        <div className="module-stats">
          <div>
            <span>Total Payable</span>
            <b>Rs. 0</b>
          </div>
          <div>
            <span>Paid This Period</span>
            <b>Rs. 0</b>
          </div>
          <div>
            <span>Owners</span>
            <b>0</b>
          </div>
          <div>
            <span>Pending</span>
            <b>Rs. 0</b>
          </div>
        </div>

        <div className="empty-table">
          <div className="empty-marker">✦</div>
          <div>
            <h3>Your owner payments workspace is clear</h3>
            <p>Choose a first record and we'll keep the next step visible.</p>
          </div>
          <Button onClick={() => setShowAdd(true)} className="primary-btn">
            <Plus size={16} /> Add first record
          </Button>
        </div>
      </div>

      {showAdd && <AddTransactionModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}