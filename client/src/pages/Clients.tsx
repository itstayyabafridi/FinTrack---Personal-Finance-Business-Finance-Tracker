import { useState } from "react";
import { Plus, Search, Users, Briefcase, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Clients() {
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="page-container">
      <section className="page-heading">
        <div>
          <div className="eyebrow">Clients</div>
          <h1>Clients</h1>
          <p>Manage client relationships, contact details, and project associations.</p>
        </div>
        <div className="heading-actions">
          <div className="search-wrap">
            <Search size={15} />
            <Input
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={() => setShowAdd(true)} className="primary-btn">
            <Plus size={16} /> Add Client
          </Button>
        </div>
      </section>

      <div className="module-card card-surface">
        <div className="module-hero">
          <div className="module-icon">
            <Users size={20} />
          </div>
          <div>
            <div className="eyebrow">FinTrack module</div>
            <h2>Clients</h2>
            <p>This workspace is ready for your records. Add an entry to keep your personal and business books connected.</p>
          </div>
          <Button onClick={() => setShowAdd(true)} className="primary-btn">
            <Plus size={16} /> Add record
          </Button>
        </div>
        <div className="module-stats">
          <div>
            <span>Total Clients</span>
            <b>0</b>
          </div>
          <div>
            <span>Active Projects</span>
            <b>0</b>
          </div>
          <div>
            <span>Total Receivable</span>
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
            <h3>Your clients workspace is clear</h3>
            <p>Choose a first record and we'll keep the next step visible.</p>
          </div>
          <Button onClick={() => setShowAdd(true)} className="primary-btn">
            <Plus size={16} /> Add first record
          </Button>
        </div>
      </div>
    </div>
  );
}