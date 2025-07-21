import { useEffect, useState } from "react";
import { savingsService } from "../../services/savingsService";
import SavingsForm from "../../components/custom/SavingsForm";

export default function Savings() {
  const [savings, setSavings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editingSavings, setEditingSavings] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchSavings = () => {
    setLoading(true);
    savingsService
      .getAll()
      .then((data) => setSavings(data.savings || data || []))
      .catch((err) =>
        setError(err.response?.data?.message || "Failed to load savings")
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSavings();
  }, []);

  const handleCreate = async (form) => {
    setFormLoading(true);
    try {
      await savingsService.create(form);
      setModalOpen(false);
      fetchSavings();
    } catch (err) {
      throw new Error(
        err.response?.data?.message || "Failed to create savings record"
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async (form) => {
    setFormLoading(true);
    try {
      await savingsService.update(
        editingSavings.id || editingSavings._id,
        form
      );
      setModalOpen(false);
      setEditingSavings(null);
      fetchSavings();
    } catch (err) {
      throw new Error(
        err.response?.data?.message || "Failed to update savings record"
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this savings record?"))
      return;
    setDeletingId(id);
    try {
      await savingsService.remove(id);
      fetchSavings();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete savings record");
    } finally {
      setDeletingId(null);
    }
  };

  const openCreateModal = () => {
    setEditingSavings(null);
    setModalOpen(true);
  };

  const openEditModal = (s) => {
    setEditingSavings(s);
    setModalOpen(true);
  };

  if (loading) return <div>Loading savings...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Savings</h1>
        <button
          className="bg-primary text-primary-foreground px-4 py-2 rounded font-semibold hover:bg-primary/90 transition"
          onClick={openCreateModal}
        >
          New Savings
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b text-left">Member</th>
              <th className="px-4 py-2 border-b text-left">Amount</th>
              <th className="px-4 py-2 border-b text-left">Date</th>
              <th className="px-4 py-2 border-b text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {savings.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="text-center py-4 text-muted-foreground"
                >
                  No savings found.
                </td>
              </tr>
            ) : (
              savings.map((s) => (
                <tr key={s.id || s._id} className="border-b">
                  <td className="px-4 py-2">
                    {s.member?.name || s.member || "-"}
                  </td>
                  <td className="px-4 py-2">{s.amount}</td>
                  <td className="px-4 py-2">
                    {s.date ? new Date(s.date).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      className="text-primary underline mr-2"
                      onClick={() => openEditModal(s)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-destructive underline"
                      onClick={() => handleDelete(s.id || s._id)}
                      disabled={deletingId === (s.id || s._id)}
                    >
                      {deletingId === (s.id || s._id)
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
      {/* Modal for New/Edit Savings */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card rounded shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
              onClick={() => {
                setModalOpen(false);
                setEditingSavings(null);
              }}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold mb-4">
              {editingSavings ? "Edit Savings" : "New Savings"}
            </h2>
            <SavingsForm
              initialValues={editingSavings || {}}
              onSubmit={editingSavings ? handleEdit : handleCreate}
              onCancel={() => {
                setModalOpen(false);
                setEditingSavings(null);
              }}
              loading={formLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
}
