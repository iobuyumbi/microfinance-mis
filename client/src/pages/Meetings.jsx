import { useEffect, useState } from "react";
import { meetingService } from "../services/meetingService";
import MeetingForm from "../../components/custom/MeetingForm";

export default function Meetings() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchMeetings = () => {
    setLoading(true);
    meetingService
      .getAll()
      .then((data) => setMeetings(data.meetings || data || []))
      .catch((err) =>
        setError(err.response?.data?.message || "Failed to load meetings")
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleCreate = async (form) => {
    setFormLoading(true);
    try {
      await meetingService.create(form);
      setModalOpen(false);
      fetchMeetings();
    } catch (err) {
      throw new Error(
        err.response?.data?.message || "Failed to create meeting"
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async (form) => {
    setFormLoading(true);
    try {
      await meetingService.update(
        editingMeeting.id || editingMeeting._id,
        form
      );
      setModalOpen(false);
      setEditingMeeting(null);
      fetchMeetings();
    } catch (err) {
      throw new Error(
        err.response?.data?.message || "Failed to update meeting"
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this meeting?"))
      return;
    setDeletingId(id);
    try {
      await meetingService.remove(id);
      fetchMeetings();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete meeting");
    } finally {
      setDeletingId(null);
    }
  };

  const openCreateModal = () => {
    setEditingMeeting(null);
    setModalOpen(true);
  };

  const openEditModal = (meeting) => {
    setEditingMeeting(meeting);
    setModalOpen(true);
  };

  if (loading) return <div>Loading meetings...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Meetings</h1>
        <button
          className="bg-primary text-primary-foreground px-4 py-2 rounded font-semibold hover:bg-primary/90 transition"
          onClick={openCreateModal}
        >
          New Meeting
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b text-left">Group</th>
              <th className="px-4 py-2 border-b text-left">Date</th>
              <th className="px-4 py-2 border-b text-left">Location</th>
              <th className="px-4 py-2 border-b text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {meetings.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="text-center py-4 text-muted-foreground"
                >
                  No meetings found.
                </td>
              </tr>
            ) : (
              meetings.map((m) => (
                <tr key={m.id || m._id} className="border-b">
                  <td className="px-4 py-2">
                    {m.group?.name || m.group || "-"}
                  </td>
                  <td className="px-4 py-2">
                    {m.date ? new Date(m.date).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-4 py-2">{m.location}</td>
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
      {/* Modal for New/Edit Meeting */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card rounded shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
              onClick={() => {
                setModalOpen(false);
                setEditingMeeting(null);
              }}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold mb-4">
              {editingMeeting ? "Edit Meeting" : "New Meeting"}
            </h2>
            <MeetingForm
              initialValues={editingMeeting || {}}
              onSubmit={editingMeeting ? handleEdit : handleCreate}
              onCancel={() => {
                setModalOpen(false);
                setEditingMeeting(null);
              }}
              loading={formLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
}
