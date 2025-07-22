import { useEffect, useState } from "react";
import { meetingService } from "@/services/meetingService";
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Input, Label } from '@/components/ui';
import MeetingForm from "@/components/custom/MeetingForm";
import { toast } from 'sonner';

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
      .catch((err) => {
        setError(err.message || "Failed to load meetings");
        toast.error(err.message || "Failed to load meetings");
      })
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
      toast.success("Meeting created successfully.");
    } catch (err) {
      toast.error(err.message || "Failed to create meeting");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async (form) => {
    setFormLoading(true);
    try {
      await meetingService.update(editingMeeting.id || editingMeeting._id, form);
      setModalOpen(false);
      setEditingMeeting(null);
      fetchMeetings();
      toast.success("Meeting updated successfully.");
    } catch (err) {
      toast.error(err.message || "Failed to update meeting");
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
      toast.success("Meeting deleted successfully.");
    } catch (err) {
      toast.error(err.message || "Failed to delete meeting");
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
        <Button onClick={openCreateModal}>New Meeting</Button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Group</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {meetings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                  No meetings found.
                </TableCell>
              </TableRow>
            ) : (
              meetings.map((m) => (
                <TableRow key={m.id || m._id}>
                  <TableCell>{m.group?.name || m.group || "-"}</TableCell>
                  <TableCell>{m.date ? new Date(m.date).toLocaleDateString() : "-"}</TableCell>
                  <TableCell>{m.location}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => openEditModal(m)}>
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(m.id || m._id)} disabled={deletingId === (m.id || m._id)}>
                      {deletingId === (m.id || m._id) ? "Deleting..." : "Delete"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {/* Modal for New/Edit Meeting */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingMeeting ? "Edit Meeting" : "New Meeting"}</DialogTitle>
          </DialogHeader>
          <MeetingForm
            initialValues={editingMeeting || {}}
            onSubmit={editingMeeting ? handleEdit : handleCreate}
            onCancel={() => {
              setModalOpen(false);
              setEditingMeeting(null);
            }}
            loading={formLoading}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
