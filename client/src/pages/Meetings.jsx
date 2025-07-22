import { useEffect, useState } from "react";
import { meetingService } from "@/services/meetingService";
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Input, Label, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui';
import MeetingForm from "@/components/custom/MeetingForm";
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

export default function Meetings() {
  const { user, groups } = useAuth();
  const isStaff = user && (user.role === 'admin' || user.role === 'officer');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchMeetings = async () => {
    setLoading(true);
    setError('');
    try {
      let params = {};
      if (!isStaff && groups.length > 0) {
        params.group = groups.map(g => g._id || g.id);
      } else if (isStaff && selectedGroup) {
        params.group = selectedGroup;
      }
      const data = await meetingService.getAll(params);
      setMeetings(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load meetings');
      toast.error(err.message || 'Failed to load meetings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  useEffect(() => {
    if (groups.length > 0 && !selectedGroup) {
      setSelectedGroup(groups[0]._id || groups[0].id);
    }
  }, [groups, selectedGroup]);

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
    <div className="p-6">
      {isStaff && (
        <div className="mb-4">
          <Label htmlFor="group">Group</Label>
          <Select value={selectedGroup} onValueChange={setSelectedGroup} id="group">
            <SelectTrigger>
              <SelectValue placeholder="Select group" />
            </SelectTrigger>
            <SelectContent>
              {groups.map((g) => (
                <SelectItem key={g._id || g.id} value={g._id || g.id}>{g.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
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
