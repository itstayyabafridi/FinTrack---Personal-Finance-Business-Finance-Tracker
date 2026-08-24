import { useState } from "react";
import { Plus, Search, GraduationCap, DollarSign, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddTransactionModal } from "@/components/AddTransactionModal";

export default function StudentsFees() {
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="page-container">
      <section className="page-heading">
        <div>
          <div className="eyebrow">Students & Fees</div>
          <h1>Students & Fees</h1>
          <p>Track student enrollments, fee structures, and payment history.</p>
        </div>
        <div className="heading-actions">
          <div className="search-wrap">
            <Search size={15} />
            <Input
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={() => setShowAdd(true)} className="primary-btn">
            <Plus size={16} /> Add Student
          </Button>
        </div>
      </section>

      <div className="module-card card-surface">
        <div className="module-hero">
          <div className="module-icon">
            <GraduationCap size={20} />
          </div>
          <div>
            <div className="eyebrow">FinTrack module</div>
            <h2>Students & Fees</h2>
            <p>This workspace is ready for your records. Add an entry to keep your personal and business books connected.</p>
          </div>
          <Button onClick={() => setShowAdd(true)} className="primary-btn">
            <Plus size={16} /> Add record
          </Button>
        </div>
        <div className="module-stats">
          <div>
            <span>Total Students</span>
            <b>0</b>
          </div>
          <div>
            <span>Total Fees</span>
            <b>Rs. 0</b>
          </div>
          <div>
            <span>Received</span>
            <b>Rs. 0</b>
          </div>
          <div>
            <span>Outstanding</span>
            <b>Rs. 0</b>
          </div>
        </div>

        <div className="empty-table">
          <div className="empty-marker">✦</div>
          <div>
            <h3>Your students & fees workspace is clear</h3>
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