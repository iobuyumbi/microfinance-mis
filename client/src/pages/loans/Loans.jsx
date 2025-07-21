import { useEffect, useState } from "react";
import { loanService } from "../../services/loanService";
import LoanForm from "../../components/custom/LoanForm";

export default function Loans() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchLoans = () => {
    setLoading(true);
    loanService
      .getAll()
      .then((data) => setLoans(data.loans || data || []))
      .catch((err) =>
        setError(err.response?.data?.message || "Failed to load loans")
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleCreate = async (form) => {
    setFormLoading(true);
    try {
      await loanService.create(form);
      setModalOpen(false);
      fetchLoans();
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to create loan");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async (form) => {
    setFormLoading(true);
    try {
      await loanService.update(editingLoan.id || editingLoan._id, form);
      setModalOpen(false);
      setEditingLoan(null);
      fetchLoans();
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to update loan");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this loan?")) return;
    setDeletingId(id);
    try {
      await loanService.remove(id);
      fetchLoans();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete loan");
    } finally {
      setDeletingId(null);
    }
  };

  const openCreateModal = () => {
    setEditingLoan(null);
    setModalOpen(true);
  };

  const openEditModal = (loan) => {
    setEditingLoan(loan);
    setModalOpen(true);
  };

  if (loading) return <div>Loading loans...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Loans</h1>
        <button
          className="bg-primary text-primary-foreground px-4 py-2 rounded font-semibold hover:bg-primary/90 transition"
          onClick={openCreateModal}
        >
          New Loan
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b text-left">Borrower</th>
              <th className="px-4 py-2 border-b text-left">Amount</th>
              <th className="px-4 py-2 border-b text-left">Status</th>
              <th className="px-4 py-2 border-b text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loans.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="text-center py-4 text-muted-foreground"
                >
                  No loans found.
                </td>
              </tr>
            ) : (
              loans.map((l) => (
                <tr key={l.id || l._id} className="border-b">
                  <td className="px-4 py-2">
                    {l.borrower?.name || l.borrower || "-"}
                  </td>
                  <td className="px-4 py-2">{l.amount}</td>
                  <td className="px-4 py-2">{l.status}</td>
                  <td className="px-4 py-2">
                    <button
                      className="text-primary underline mr-2"
                      onClick={() => openEditModal(l)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-destructive underline"
                      onClick={() => handleDelete(l.id || l._id)}
                      disabled={deletingId === (l.id || l._id)}
                    >
                      {deletingId === (l.id || l._id)
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Modal for New/Edit Loan */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card rounded shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
              onClick={() => {
                setModalOpen(false);
                setEditingLoan(null);
              }}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold mb-4">
              {editingLoan ? "Edit Loan" : "New Loan"}
            </h2>
            <LoanForm
              initialValues={editingLoan || {}}
              onSubmit={editingLoan ? handleEdit : handleCreate}
              onCancel={() => {
                setModalOpen(false);
                setEditingLoan(null);
              }}
              loading={formLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
}
