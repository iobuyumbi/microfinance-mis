import { useEffect, useState } from "react";
import { notificationService } from "../../services/notificationService";
import NotificationForm from "../../components/custom/NotificationForm";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchNotifications = () => {
    setLoading(true);
    notificationService
      .getAll()
      .then((data) => setNotifications(data.notifications || data || []))
      .catch((err) =>
        setError(err.response?.data?.message || "Failed to load notifications")
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleCreate = async (form) => {
    setFormLoading(true);
    try {
      await notificationService.create(form);
      setModalOpen(false);
      fetchNotifications();
    } catch (err) {
      throw new Error(
        err.response?.data?.message || "Failed to create notification"
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async (form) => {
    setFormLoading(true);
    try {
      await notificationService.update(
        editingNotification.id || editingNotification._id,
        form
      );
      setModalOpen(false);
      setEditingNotification(null);
      fetchNotifications();
    } catch (err) {
      throw new Error(
        err.response?.data?.message || "Failed to update notification"
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notification?"))
      return;
    setDeletingId(id);
    try {
      await notificationService.remove(id);
      fetchNotifications();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete notification");
    } finally {
      setDeletingId(null);
    }
  };

  const openCreateModal = () => {
    setEditingNotification(null);
    setModalOpen(true);
  };

  const openEditModal = (notification) => {
    setEditingNotification(notification);
    setModalOpen(true);
  };

  if (loading) return <div>Loading notifications...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <button
          className="bg-primary text-primary-foreground px-4 py-2 rounded font-semibold hover:bg-primary/90 transition"
          onClick={openCreateModal}
        >
          New Notification
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b text-left">Message</th>
              <th className="px-4 py-2 border-b text-left">Date</th>
              <th className="px-4 py-2 border-b text-left">Read</th>
              <th className="px-4 py-2 border-b text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {notifications.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="text-center py-4 text-muted-foreground"
                >
                  No notifications found.
                </td>
              </tr>
            ) : (
              notifications.map((n) => (
                <tr key={n.id || n._id} className="border-b">
                  <td className="px-4 py-2">{n.message}</td>
                  <td className="px-4 py-2">
                    {n.date ? new Date(n.date).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-4 py-2">{n.read ? "Yes" : "No"}</td>
                  <td className="px-4 py-2">
                    <button
                      className="text-primary underline mr-2"
                      onClick={() => openEditModal(n)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-destructive underline"
                      onClick={() => handleDelete(n.id || n._id)}
                      disabled={deletingId === (n.id || n._id)}
                    >
                      {deletingId === (n.id || n._id)
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
      {/* Modal for New/Edit Notification */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card rounded shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
              onClick={() => {
                setModalOpen(false);
                setEditingNotification(null);
              }}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold mb-4">
              {editingNotification ? "Edit Notification" : "New Notification"}
            </h2>
            <NotificationForm
              initialValues={editingNotification || {}}
              onSubmit={editingNotification ? handleEdit : handleCreate}
              onCancel={() => {
                setModalOpen(false);
                setEditingNotification(null);
              }}
              loading={formLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
}
