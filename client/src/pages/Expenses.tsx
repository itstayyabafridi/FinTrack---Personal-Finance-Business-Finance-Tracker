import { useState } from "react";
import { Plus, Search, CreditCard, ReceiptText, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddTransactionModal } from "@/components/AddTransactionModal";

export default function Expenses() {
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="page-container">
      <section className="page-heading">
        <div>
          <div className="eyebrow">Expenses</div>
          <h1>Expenses</h1>
          <p>Track and categorize all your business and personal expenses.</p>
        </div>
        <div className="heading-actions">
          <div className="search-wrap">
            <Search size={15} />
            <Input
              placeholder="Search expenses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={() => setShowAdd(true)} className="primary-btn">
            <Plus size={16} /> Add Expense
          </Button>
        </div>
      </section>

      <div className="module-card card-surface">
        <div className="module-hero">
          <div className="module-icon">
            <CreditCard size={20} />
          </div>
          <div>
            <div className="eyebrow">FinTrack module</div>
            <h2>Expenses</h2>
            <p>This workspace is ready for your records. Add an entry to keep your personal and business books connected.</p>
          </div>
          <Button onClick={() => setShowAdd(true)} className="primary-btn">
            <Plus size={16} /> Add record
          </Button>
        </div>
        <div className="module-stats">
          <div>
            <span>Total Expenses</span>
            <b>Rs. 0</b>
          </div>
          <div>
            <span>This Month</span>
            <b>Rs. 0</b>
          </div>
          <div>
            <span>Categories</span>
            <b>0</b>
          </div>
          <div>
            <span>Pending Review</span>
            <b>0</b>
          </div>
        </div>

        <div className="empty-table">
          <div className="empty-marker">✦</div>
          <div>
            <h3>Your expenses workspace is clear</h3>
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