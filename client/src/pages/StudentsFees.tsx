import { useState } from "react";
import { GraduationCap, Plus, Trash2, Search, CheckCircle2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { LedgerIllustration } from "@/components/LedgerIllustration";
import { useFinancialData } from "@/contexts/FinancialDataContext";

export default function StudentsFees() {
  const { students, addStudent, deleteStudent, addTransaction } = useFinancialData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Add student form state
  const [name, setName] = useState("");
  const [course, setCourse] = useState("");
  const [totalFee, setTotalFee] = useState("");
  const [initialPaid, setInitialPaid] = useState("");
  const [phone, setPhone] = useState("");

  const totalFeesAll = students.reduce((sum, s) => sum + Number(s.total_fee || 0), 0);
  const collectedAll = students.reduce((sum, s) => sum + Number(s.received_amount || 0), 0);
  const pendingAll = totalFeesAll - collectedAll;

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !totalFee) return;

    const std = addStudent({
      name: name.trim(),
      course: course.trim() || "Full Stack",
      total_fee: parseFloat(totalFee) || 0,
      received_amount: parseFloat(initialPaid) || 0,
      phone: phone.trim() || undefined,
    });

    if (parseFloat(initialPaid) > 0) {
      addTransaction({
        description: `Tuition Fee - ${name.trim()}`,
        amount: parseFloat(initialPaid),
        type: "student_fee",
        date: new Date().toISOString().split("T")[0],
        category: "Tuition Fee",
        payment_method: "bank_transfer",
        reference_id: std.id,
      });
    }

    setName("");
    setCourse("");
    setTotalFee("");
    setInitialPaid("");
    setPhone("");
    setShowAddModal(false);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !paymentAmount || parseFloat(paymentAmount) <= 0) return;

    const amt = parseFloat(paymentAmount);
    selectedStudent.received_amount = (Number(selectedStudent.received_amount) || 0) + amt;

    addTransaction({
      description: `Tuition Fee - ${selectedStudent.name}`,
      amount: amt,
      type: "student_fee",
      date: new Date().toISOString().split("T")[0],
      category: "Tuition Fee",
      payment_method: "bank_transfer",
      reference_id: selectedStudent.id,
    });

    setShowPaymentModal(false);
    setPaymentAmount("");
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.course && s.course.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="module-card card-surface">
      {/* Module Hero */}
      <div className="module-hero">
        <div className="module-icon">
          <GraduationCap size={20} />
        </div>
        <div>
          <div className="eyebrow">FINTRACK MODULE</div>
          <h2>Students & Fees</h2>
          <p>Track student enrollments, fee structures, and collection records across all batches.</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="primary-btn">
          <Plus size={16} />
          Add student
        </Button>
      </div>

      {/* 3-Column Stats Row */}
      <div className="module-stats">
        <div>
          <span>TOTAL STUDENTS</span>
          <b>{students.length}</b>
        </div>
        <div>
          <span>COLLECTED</span>
          <b>Rs. {collectedAll.toLocaleString()}</b>
        </div>
        <div>
          <span>OUTSTANDING FEES</span>
          <b>Rs. {pendingAll.toLocaleString()}</b>
        </div>
      </div>

      {/* Main Body */}
      {students.length === 0 ? (
        <div className="empty-table">
          <div className="empty-marker">✦</div>
          <LedgerIllustration />
          <div>
            <h3>Your students & fees workspace is clear</h3>
            <p>Choose a first record and we'll keep the next step visible.</p>
          </div>
          <Button onClick={() => setShowAddModal(true)} className="primary-btn">
            <Plus size={16} />
            Add first student
          </Button>
        </div>
      ) : (
        <div className="pt-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
              <Input
                placeholder="Search students or course..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-10 bg-[#f8fbfe] border-[#e2e8f0] text-xs rounded-xl"
              />
            </div>
          </div>

          <div className="border border-[#eef2f7] rounded-xl overflow-hidden bg-white">
            <table className="w-full text-left text-xs text-[#334155]">
              <thead className="bg-[#f8fafc] border-b border-[#eef2f7]">
                <tr className="text-[11px] font-semibold text-[#8b98aa] uppercase tracking-wider">
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-3">Course</th>
                  <th className="py-3 px-3 text-right">Total Fee</th>
                  <th className="py-3 px-3 text-right">Paid</th>
                  <th className="py-3 px-3 text-right">Remaining</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {filteredStudents.map((s) => {
                  const remaining = Number(s.total_fee) - Number(s.received_amount || 0);
                  return (
                    <tr key={s.id} className="hover:bg-[#fbfcfe] transition">
                      <td className="py-3.5 px-4 font-semibold text-[#0f172a]">{s.name}</td>
                      <td className="py-3.5 px-3 text-[#64748b]">{s.course || "General"}</td>
                      <td className="py-3.5 px-3 text-right font-medium">Rs. {Number(s.total_fee).toLocaleString()}</td>
                      <td className="py-3.5 px-3 text-right text-[#059669] font-medium">Rs. {Number(s.received_amount || 0).toLocaleString()}</td>
                      <td className="py-3.5 px-3 text-right font-bold text-xs">
                        {remaining <= 0 ? (
                          <span className="text-[#059669]">Paid</span>
                        ) : (
                          <span className="text-[#ea580c]">Rs. {remaining.toLocaleString()}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        {remaining > 0 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedStudent(s);
                              setShowPaymentModal(true);
                            }}
                            className="h-8 text-[11px] px-2.5 rounded-lg border-[#e2e8f0]"
                          >
                            + Collect Fee
                          </Button>
                        )}
                        <button
                          onClick={() => deleteStudent(s.id)}
                          className="text-[#94a3b8] hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-[460px] p-6 rounded-2xl bg-white border border-[#e2e8f0] shadow-2xl">
          <DialogTitle className="text-lg font-bold text-[#0f172a]">Add New Student</DialogTitle>
          <form onSubmit={handleCreateStudent} className="space-y-3.5 mt-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-[#1e293b]">Student Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ali Ahmed"
                required
                className="h-10 text-xs rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-[#1e293b]">Course / Batch</Label>
              <Input
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="e.g. Full Stack Development"
                className="h-10 text-xs rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-[#1e293b]">Total Fee (Rs.)</Label>
                <Input
                  type="number"
                  value={totalFee}
                  onChange={(e) => setTotalFee(e.target.value)}
                  placeholder="30000"
                  required
                  className="h-10 text-xs rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-[#1e293b]">Initial Paid (Rs.)</Label>
                <Input
                  type="number"
                  value={initialPaid}
                  onChange={(e) => setInitialPaid(e.target.value)}
                  placeholder="15000"
                  className="h-10 text-xs rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-[#1e293b]">Phone Number (Optional)</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+92 300 0000000"
                className="h-10 text-xs rounded-xl"
              />
            </div>
            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3.5 py-2 text-xs font-medium text-[#475569] hover:bg-[#f1f5f9] rounded-xl"
              >
                Cancel
              </button>
              <Button type="submit" className="h-10 px-4 bg-[#2563eb] text-white text-xs rounded-xl font-semibold">
                Save Student
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Collect Fee Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="max-w-[400px] p-6 rounded-2xl bg-white border border-[#e2e8f0] shadow-2xl">
          <DialogTitle className="text-lg font-bold text-[#0f172a]">
            Collect Fee - {selectedStudent?.name}
          </DialogTitle>
          <form onSubmit={handleRecordPayment} className="space-y-3.5 mt-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-[#1e293b]">Amount to Collect (Rs.)</Label>
              <Input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Enter amount"
                required
                autoFocus
                className="h-10 text-xs rounded-xl"
              />
            </div>
            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="px-3.5 py-2 text-xs font-medium text-[#475569] hover:bg-[#f1f5f9] rounded-xl"
              >
                Cancel
              </button>
              <Button type="submit" className="h-10 px-4 bg-[#2563eb] text-white text-xs rounded-xl font-semibold">
                Record Payment
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
