// src/pages/Meetings.jsx
import { useEffect, useState } from "react";
import { meetingService } from "@/services/meetingService";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Input,
  Label,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  AlertDialog, // Import AlertDialog for delete confirmation
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui';
import MeetingForm from "@/components/custom/MeetingForm"; // Assuming this component exists
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { PageLayout, ContentCard } from '@/components/layouts/PageLayout'; // Import PageLayout and ContentCard
import { Plus, Edit, Trash, Loader2, Calendar } from 'lucide-react'; // Import icons

export default function Meetings() {
  const { user, groups, isAuthenticated, loading: authLoading } = useAuth(); // Get groups from useAuth
  const isStaff = user && (user.role === 'admin' || user.role === 'officer');

  const [selectedGroup, setSelectedGroup] = useState('');
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state for meetings data
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false); // For form submission
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [deletingId, setDeletingId] = useState(null); // For delete button loading state

  // Fetch meetings based on selected group or user's groups
  const fetchMeetings = async () => {
    setLoading(true);
    setError('');
    try {
      let params = {};
      if (!isStaff && groups.length > 0) {
        // If not staff, filter by user's groups
        params.group = groups.map(g => g._id || g.id);
      } else if (isStaff && selectedGroup) {
        // If staff, filter by selected group
        params.group = selectedGroup;
      } else if (isStaff && !selectedGroup && groups.length > 0) {
        // If staff and no specific group selected, but user has groups, default to first
        params.group = groups[0]._id || groups[0].id;
        setSelectedGroup(groups[0]._id || groups[0].id);
      } else if (isStaff && groups.length === 0) {
        // If staff but no groups exist, fetch all (if backend supports) or show empty
        // For now, if no groups, params will be empty, fetching all if backend allows.
        // Or you might want to prevent fetching if no groups are available to filter by.
      }

      const data = await meetingService.getAll(params);
      setMeetings(Array.isArray(data) ? data : []);
    } catch (err) {
      const errorMessage = err.message || 'Failed to load meetings';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on component mount and when auth status changes
  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        fetchMeetings();
      } else {
        setLoading(false);
        setError('You must be logged in to view meetings.');
      }
    }
  }, [isAuthenticated, authLoading]); // Re-fetch when auth status changes

  // Re-fetch meetings when selectedGroup changes for staff
  useEffect(() => {
    if (isStaff && selectedGroup) {
      fetchMeetings();
    }
  }, [selectedGroup, isStaff]); // Add isStaff to dependencies

  // Set initial selected group for staff if groups are loaded
  useEffect(() => {
    if (isStaff && groups.length > 0 && !selectedGroup) {
      setSelectedGroup(groups[0]._id || groups[0].id);
    }
  }, [groups, isStaff, selectedGroup]);


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
    setDeletingId(id); // Set deleting state for the specific item
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

  // Render loading and error states using PageLayout for consistent UI
  if (authLoading) {
    return (
      <PageLayout title="Meetings Management">
        <div className="p-6 text-center text-muted-foreground">Checking authentication...</div>
      </PageLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <PageLayout title="Meetings Management">
        <div className="p-6 text-center text-red-500">Access Denied: Please log in to view meetings.</div>
      </PageLayout>
    );
  }

  // Once authenticated, proceed with data loading or error display for meetings
  if (loading && meetings.length === 0) {
    return (
      <PageLayout title="Meetings Management">
        <div className="p-6 text-center text-muted-foreground">Loading meetings...</div>
      </PageLayout>
    );
  }

  if (error && meetings.length === 0) {
    return (
      <PageLayout title="Meetings Management">
        <div className="p-6 text-center text-red-500">{error}</div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Meetings Management"
      action={
        <Button onClick={openCreateModal} disabled={loading}>
          <Plus className="h-4 w-4 mr-2" />
          New Meeting
        </Button>
      }
    >
      {isStaff && groups.length > 0 && (
        <div className="mb-4 max-w-xs"> {/* Added max-w-xs for better layout */}
          <Label htmlFor="group" className="mb-2 block">Filter by Group:</Label>
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
      {isStaff && groups.length === 0 && (
        <div className="mb-4 text-muted-foreground">
          As a staff member, you need to create or be assigned to groups to manage meetings.
        </div>
      )}
      {!isStaff && groups.length === 0 && (
        <div className="mb-4 text-muted-foreground">
          You are not part of any groups yet. Meetings will appear here once you join a group.
        </div>
      )}

      <ContentCard isLoading={loading} title="All Meetings">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Group</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Skeleton rows for loading state
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><div className="h-4 bg-muted rounded w-3/4"></div></TableCell>
                  <TableCell><div className="h-4 bg-muted rounded w-1/2"></div></TableCell>
                  <TableCell><div className="h-4 bg-muted rounded w-1/3"></div></TableCell>
                  <TableCell className="text-right"><div className="h-4 bg-muted rounded w-1/2 ml-auto"></div></TableCell>
                </TableRow>
              ))
            ) : meetings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                  No meetings found.
                </TableCell>
              </TableRow>
            ) : (
              meetings.map((m) => (
                <TableRow key={m.id || m._id}>
                  <TableCell className="font-medium flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    {m.group?.name || m.group || "-"}
                  </TableCell>
                  <TableCell>{m.date ? new Date(m.date).toLocaleDateString() : "-"}</TableCell>
                  <TableCell>{m.location}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => openEditModal(m)} className="mr-2">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-800"
                          disabled={deletingId === (m.id || m._id)}
                        >
                          {deletingId === (m.id || m._id) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash className="h-4 w-4" />}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the meeting on
                            <span className="font-semibold"> {m.date ? new Date(m.date).toLocaleDateString() : "this date"}</span> and remove its data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(m.id || m._id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </ContentCard>

      {/* Modal for New/Edit Meeting */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
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
            // Pass groups to MeetingForm so it can render a select for groups
            groups={groups}
            isStaff={isStaff}
            selectedGroup={selectedGroup} // Pass selectedGroup for initial value if creating
          />
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
