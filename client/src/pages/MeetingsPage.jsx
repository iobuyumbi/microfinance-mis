import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  Building2,
  Plus,
  Search,
  Loader2,
  Calendar,
  MoreHorizontal,
  Users,
  MapPin,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Input } from "../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog";
import { toast } from "sonner";
import { meetingService } from "../services/meetingService";
import { groupService } from "../services/groupService";
import MeetingForm from "../components/custom/MeetingForm";
import { formatDate, formatDateTime } from "../utils/formatters";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../components/ui/alert-dialog";
import logger from "../lib/logger";

const MeetingsPage = () => {
  // State management
  const [meetings, setMeetings] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogState, setDialogState] = useState({
    createOpen: false,
    editOpen: false,
    deleteOpen: false,
    currentMeeting: null,
    meetingToDelete: null
  });

  // Memoized fetch functions to prevent unnecessary re-renders
  const fetchMeetings = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const response = await meetingService.getAll(params);
      const data = Array.isArray(response.data?.data) ? response.data.data : [];
      setMeetings(data);
    } catch (error) {
      console.error("Error fetching meetings:", {
        status: error.response?.status,
        data: error.response?.data,
      });
      toast.error("Failed to fetch meetings: " + (error.response?.data?.message || error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchGroups = useCallback(async () => {
    try {
      setGroupsLoading(true);
      const response = await groupService.getAll();
      const data = Array.isArray(response.data?.data) ? response.data.data : [];
      setGroups(data);
    } catch (error) {
      console.error("Error fetching groups:", error);
      toast.error("Failed to fetch groups for meeting form");
    } finally {
      setGroupsLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchMeetings();
    fetchGroups();
  }, [fetchMeetings, fetchGroups]);

  // Search effect with debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm) {
        fetchMeetings({ search: searchTerm });
      } else {
        fetchMeetings();
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(handler);
  }, [searchTerm, fetchMeetings]);

  // Dialog handlers
  const openCreateDialog = () => setDialogState(prev => ({ ...prev, createOpen: true }));
  const closeCreateDialog = () => setDialogState(prev => ({ ...prev, createOpen: false }));
  
  const openEditDialog = (meeting) => setDialogState(prev => ({ 
    ...prev, 
    editOpen: true, 
    currentMeeting: meeting 
  }));
  const closeEditDialog = () => setDialogState(prev => ({ ...prev, editOpen: false }));
  
  const openDeleteDialog = (meeting) => setDialogState(prev => ({ 
    ...prev, 
    deleteOpen: true, 
    meetingToDelete: meeting 
  }));
  const closeDeleteDialog = () => setDialogState(prev => ({ ...prev, deleteOpen: false }));

  // CRUD operations
  const handleCreateMeeting = async (formData) => {
    try {
      await meetingService.create(formData);
      toast.success("Meeting scheduled successfully");
      closeCreateDialog();
      fetchMeetings();
    } catch (error) {
      console.error("Error creating meeting:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to schedule meeting";
      toast.error(errorMessage);
      throw error; // Re-throw to let form handle the error
    }
  };

  const handleUpdateMeeting = async (formData) => {
    try {
      await meetingService.update(dialogState.currentMeeting._id, formData);
      toast.success("Meeting updated successfully");
      closeEditDialog();
      fetchMeetings();
    } catch (error) {
      console.error("Error updating meeting:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to update meeting";
      toast.error(errorMessage);
      throw error; // Re-throw to let form handle the error
    }
  };

  const handleDeleteMeeting = async () => {
    try {
      await meetingService.remove(dialogState.meetingToDelete._id);
      toast.success("Meeting cancelled successfully");
      closeDeleteDialog();
      fetchMeetings();
    } catch (error) {
      console.error("Error deleting meeting:", error);
      toast.error("Failed to cancel meeting: " + (error.response?.data?.message || error.message || "Unknown error"));
    }
  };

  // UI helpers
  const getStatusBadgeVariant = (status) => {
    const statusMap = {
      completed: "success",
      scheduled: "warning",
      cancelled: "destructive",
      pending: "secondary"
    };
    return statusMap[status] || "secondary";
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case 'scheduled':
        return <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getGroupName = (groupId) => {
    const group = groups.find(g => g._id === groupId);
    return group?.name || "Unknown Group";
  };

  const isMeetingPast = (meetingDate) => {
    return new Date(meetingDate) < new Date();
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Group Meetings</h1>
          <p className="text-muted-foreground">
            Schedule and manage group meetings for loan collections and discussions
          </p>
        </div>
        <Button onClick={openCreateDialog} variant="default" disabled={groupsLoading}>
          <Plus className="mr-2 h-4 w-4" />
          Schedule Meeting
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search meetings by group, location, or agenda..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search meetings"
          />
        </div>
      </div>

      {/* Meetings Card */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Scheduled Meetings
          </CardTitle>
          <CardDescription>
            View and manage all scheduled group meetings for loan collections and member discussions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading meetings...</span>
            </div>
          )}

          {/* Empty State */}
          {!loading && meetings.length === 0 && (
            <div className="text-center py-12 border rounded-md bg-muted/10">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Meetings Found</h3>
              <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                {searchTerm
                  ? "No meetings match your search criteria. Try a different search term."
                  : "You haven't scheduled any meetings yet. Start by scheduling a new meeting for loan collections or member discussions."}
              </p>
              <Button onClick={openCreateDialog} variant="default" disabled={groupsLoading}>
                <Plus className="mr-2 h-4 w-4" />
                Schedule Meeting
              </Button>
            </div>
          )}

          {/* Meetings Table */}
          {!loading && meetings.length > 0 && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Group</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {meetings.map((meeting) => (
                    <TableRow 
                      key={meeting._id}
                      className={isMeetingPast(meeting.date) ? "opacity-75" : ""}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {getGroupName(meeting.group)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(meeting.status)}
                          <div>
                            <div className="font-medium">{formatDate(meeting.date)}</div>
                            <div className="text-sm text-muted-foreground">
                              {formatDateTime(meeting.date, 'short').split(',')[1]?.trim() || 'Time not set'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          {meeting.location}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(meeting.status)}>
                          {meeting.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(meeting)}>
                              Edit Meeting
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => openDeleteDialog(meeting)}
                              className="text-destructive focus:text-destructive"
                            >
                              Cancel Meeting
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Meeting Dialog */}
      <Dialog open={dialogState.createOpen} onOpenChange={closeCreateDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Schedule New Meeting</DialogTitle>
            <DialogDescription>
              Schedule a new meeting for loan collections or member discussions
            </DialogDescription>
          </DialogHeader>
          <MeetingForm 
            onSubmit={handleCreateMeeting} 
            onCancel={closeCreateDialog}
            groups={groups}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Meeting Dialog */}
      <Dialog open={dialogState.editOpen} onOpenChange={closeEditDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Meeting</DialogTitle>
            <DialogDescription>
              Update meeting details and schedule
            </DialogDescription>
          </DialogHeader>
          <MeetingForm
            onSubmit={handleUpdateMeeting}
            initialValues={dialogState.currentMeeting}
            onCancel={closeEditDialog}
            groups={groups}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={dialogState.deleteOpen} onOpenChange={closeDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Meeting?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel the meeting 
              {dialogState.meetingToDelete && (
                <span className="font-medium"> for {getGroupName(dialogState.meetingToDelete.group)} on {formatDate(dialogState.meetingToDelete.date)}</span>
              )}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Meeting</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMeeting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Cancel Meeting
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MeetingsPage;
