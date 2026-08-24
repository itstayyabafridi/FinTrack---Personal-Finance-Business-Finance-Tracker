import { useState } from "react";
import { Plus, Search, Filter, ChevronDown, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AddTransactionModal } from "@/components/AddTransactionModal";

export default function Transactions() {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showAdd, setShowAdd] = useState(false);

  const transactionTypes = ["all", "income", "expense", "student_fee", "client_payment", "loan_received", "loan_repayment", "owner_payment", "other_income"];

  return (
    <div className="page-container">
      <section className="page-heading">
        <div>
          <div className="eyebrow">Ledger</div>
          <h1>Transactions</h1>
          <p>All your financial movements in one place. Filter, search, and manage every record.</p>
        </div>
        <div className="heading-actions">
          <div className="search-wrap">
            <Search size={15} />
            <Input
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              {transactionTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type === "all" ? "All Types" : type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setShowAdd(true)} className="primary-btn">
            <Plus size={16} /> Add Transaction
          </Button>
        </div>
      </section>

      <div className="transactions-card card-surface">
        <div className="card-header table-header">
          <div>
            <div className="eyebrow">Ledger</div>
            <h2>Recent Transactions</h2>
            <p>Your latest income, expenses, and payments in one place.</p>
          </div>
        </div>

        <div className="table-container">
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Type</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Payment Method</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={7} className="empty-state">
                  <div className="empty-table">
                    <div className="empty-marker">✦</div>
                    <div>
                      <h3>Your ledger is waiting for its first signal</h3>
                      <p>Choose a first record and we'll keep the next step visible.</p>
                    </div>
                    <Button onClick={() => setShowAdd(true)} className="primary-btn">
                      <Plus size={16} /> Add first record
                    </Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && <AddTransactionModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}