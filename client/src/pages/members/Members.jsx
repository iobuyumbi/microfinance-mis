import { useEffect, useState } from "react";
import { memberService } from "../../services/memberService";
import MemberForm from "../../components/custom/MemberForm";

export default function Members() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchMembers = () => {
    setLoading(true);
    memberService
      .getAll()
      .then((data) => setMembers(data.members || data || []))
      .catch((err) =>
        setError(err.response?.data?.message || "Failed to load members")
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleCreate = async (form) => {
    setFormLoading(true);
    try {
      await memberService.create(form);
      setModalOpen(false);
      fetchMembers();
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to create member");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async (form) => {
    setFormLoading(true);
    try {
      await memberService.update(editingMember.id || editingMember._id, form);
      setModalOpen(false);
      setEditingMember(null);
      fetchMembers();
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to update member");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this member?")) return;
    setDeletingId(id);
    try {
      await memberService.remove(id);
      fetchMembers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete member");
    } finally {
      setDeletingId(null);
    }
  };

  const openCreateModal = () => {
    setEditingMember(null);
    setModalOpen(true);
  };

  const openEditModal = (member) => {
    setEditingMember(member);
    setModalOpen(true);
  };

  if (loading) return <div>Loading members...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Members</h1>
        <button
          className="bg-primary text-primary-foreground px-4 py-2 rounded font-semibold hover:bg-primary/90 transition"
          onClick={openCreateModal}
        >
          New Member
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b text-left">Name</th>
              <th className="px-4 py-2 border-b text-left">Email</th>
              <th className="px-4 py-2 border-b text-left">Phone</th>
              <th className="px-4 py-2 border-b text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="text-center py-4 text-muted-foreground"
                >
                  No members found.
                </td>
              </tr>
            ) : (
              members.map((m) => (
                <tr key={m.id || m._id} className="border-b">
                  <td className="px-4 py-2">{m.name}</td>
                  <td className="px-4 py-2">{m.email}</td>
                  <td className="px-4 py-2">{m.phone}</td>
                  <td className="px-4 py-2">
                    <button
                      className="text-primary underline mr-2"
                      onClick={() => openEditModal(m)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-destructive underline"
                      onClick={() => handleDelete(m.id || m._id)}
                      disabled={deletingId === (m.id || m._id)}
                    >
                      {deletingId === (m.id || m._id)
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
      {/* Modal for New/Edit Member */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card rounded shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
              onClick={() => {
                setModalOpen(false);
                setEditingMember(null);
              }}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold mb-4">
              {editingMember ? "Edit Member" : "New Member"}
            </h2>
            <MemberForm
              initialValues={editingMember || {}}
              onSubmit={editingMember ? handleEdit : handleCreate}
              onCancel={() => {
                setModalOpen(false);
                setEditingMember(null);
              }}
              loading={formLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
}
