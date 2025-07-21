import { useEffect, useState } from "react";
import { transactionService } from "../../services/transactionService";
import TransactionForm from "../../components/custom/TransactionForm";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchTransactions = () => {
    setLoading(true);
    transactionService
      .getAll()
      .then((data) => setTransactions(data.transactions || data || []))
      .catch((err) =>
        setError(err.response?.data?.message || "Failed to load transactions")
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleCreate = async (form) => {
    setFormLoading(true);
    try {
      await transactionService.create(form);
      setModalOpen(false);
      fetchTransactions();
    } catch (err) {
      throw new Error(
        err.response?.data?.message || "Failed to create transaction"
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async (form) => {
    setFormLoading(true);
    try {
      await transactionService.update(
        editingTransaction.id || editingTransaction._id,
        form
      );
      setModalOpen(false);
      setEditingTransaction(null);
      fetchTransactions();
    } catch (err) {
      throw new Error(
        err.response?.data?.message || "Failed to update transaction"
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction?"))
      return;
    setDeletingId(id);
    try {
      await transactionService.remove(id);
      fetchTransactions();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete transaction");
    } finally {
      setDeletingId(null);
    }
  };

  const openCreateModal = () => {
    setEditingTransaction(null);
    setModalOpen(true);
  };

  const openEditModal = (t) => {
    setEditingTransaction(t);
    setModalOpen(true);
  };

  if (loading) return <div>Loading transactions...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <button
          className="bg-primary text-primary-foreground px-4 py-2 rounded font-semibold hover:bg-primary/90 transition"
          onClick={openCreateModal}
        >
          New Transaction
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b text-left">Type</th>
              <th className="px-4 py-2 border-b text-left">Amount</th>
              <th className="px-4 py-2 border-b text-left">Date</th>
              <th className="px-4 py-2 border-b text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="text-center py-4 text-muted-foreground"
                >
                  No transactions found.
                </td>
              </tr>
            ) : (
              transactions.map((t) => (
                <tr key={t.id || t._id} className="border-b">
                  <td className="px-4 py-2">{t.type}</td>
                  <td className="px-4 py-2">{t.amount}</td>
                  <td className="px-4 py-2">
                    {t.date ? new Date(t.date).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      className="text-primary underline mr-2"
                      onClick={() => openEditModal(t)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-destructive underline"
                      onClick={() => handleDelete(t.id || t._id)}
                      disabled={deletingId === (t.id || t._id)}
                    >
                      {deletingId === (t.id || t._id)
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
      {/* Modal for New/Edit Transaction */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card rounded shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
              onClick={() => {
                setModalOpen(false);
                setEditingTransaction(null);
              }}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold mb-4">
              {editingTransaction ? "Edit Transaction" : "New Transaction"}
            </h2>
            <TransactionForm
              initialValues={editingTransaction || {}}
              onSubmit={editingTransaction ? handleEdit : handleCreate}
              onCancel={() => {
                setModalOpen(false);
                setEditingTransaction(null);
              }}
              loading={formLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
}
