import { useEffect, useState } from "react";
import { userService } from "../../services/userService";
import UserForm from "../../components/custom/UserForm";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchUsers = () => {
    setLoading(true);
    userService
      .getAll()
      .then((data) => setUsers(data.users || data || []))
      .catch((err) =>
        setError(err.response?.data?.message || "Failed to load users")
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (form) => {
    setFormLoading(true);
    try {
      await userService.create(form);
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to create user");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async (form) => {
    setFormLoading(true);
    try {
      await userService.update(editingUser.id || editingUser._id, form);
      setModalOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to update user");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    setDeletingId(id);
    try {
      await userService.remove(id);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete user");
    } finally {
      setDeletingId(null);
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  if (loading) return <div>Loading users...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Users</h1>
        <button
          className="bg-primary text-primary-foreground px-4 py-2 rounded font-semibold hover:bg-primary/90 transition"
          onClick={openCreateModal}
        >
          New User
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b text-left">Name</th>
              <th className="px-4 py-2 border-b text-left">Email</th>
              <th className="px-4 py-2 border-b text-left">Role</th>
              <th className="px-4 py-2 border-b text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="text-center py-4 text-muted-foreground"
                >
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id || u._id} className="border-b">
                  <td className="px-4 py-2">{u.name || "-"}</td>
                  <td className="px-4 py-2">{u.email || "-"}</td>
                  <td className="px-4 py-2">{u.role || "-"}</td>
                  <td className="px-4 py-2">
                    <button
                      className="text-primary underline mr-2"
                      onClick={() => openEditModal(u)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-destructive underline"
                      onClick={() => handleDelete(u.id || u._id)}
                      disabled={deletingId === (u.id || u._id)}
                    >
                      {deletingId === (u.id || u._id)
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
      {/* Modal for New/Edit User */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card rounded shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
              onClick={() => {
                setModalOpen(false);
                setEditingUser(null);
              }}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold mb-4">
              {editingUser ? "Edit User" : "New User"}
            </h2>
            <UserForm
              initialValues={editingUser || {}}
              onSubmit={editingUser ? handleEdit : handleCreate}
              onCancel={() => {
                setModalOpen(false);
                setEditingUser(null);
              }}
              loading={formLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
}
