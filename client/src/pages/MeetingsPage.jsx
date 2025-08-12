import React, { useState, useEffect } from "react";
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
} from "../components/ui/dialog";
import { toast } from "sonner";
import { meetingService } from "../services/meetingService";
import MeetingForm from "../components/custom/MeetingForm";
import { formatDate } from "../utils/formatters";

const MeetingsPage = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateMeetingOpen, setIsCreateMeetingOpen] = useState(false);
  const [isEditMeetingOpen, setIsEditMeetingOpen] = useState(false);
  const [currentMeeting, setCurrentMeeting] = useState(null);

  // Fetch meetings
  useEffect(() => {
    fetchMeetings();
  }, []);

  // Filter meetings based on search term
  useEffect(() => {
    if (searchTerm) {
      const params = { search: searchTerm };
      fetchMeetings(params);
    } else {
      fetchMeetings();
    }
  }, [searchTerm]);

  const fetchMeetings = async (params = {}) => {
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
      toast.error("Failed to fetch meetings");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMeeting = async (formData) => {
    try {
      await meetingService.create(formData);
      toast.success("Meeting created successfully");
      setIsCreateMeetingOpen(false);
      fetchMeetings();
    } catch (error) {
      console.error("Error creating meeting:", error);
      toast.error("Failed to create meeting");
    }
  };

  const handleUpdateMeeting = async (formData) => {
    try {
      await meetingService.update(currentMeeting._id, formData);
      toast.success("Meeting updated successfully");
      setIsEditMeetingOpen(false);
      fetchMeetings();
    } catch (error) {
      console.error("Error updating meeting:", error);
      toast.error("Failed to update meeting");
    }
  };

  const handleDeleteMeeting = async (id) => {
    if (window.confirm("Are you sure you want to delete this meeting?")) {
      try {
        await meetingService.remove(id);
        toast.success("Meeting deleted successfully");
        fetchMeetings();
      } catch (error) {
        console.error("Error deleting meeting:", error);
        toast.error("Failed to delete meeting");
      }
    }
  };

  // Get badge variant based on meeting status
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "completed":
        return "success";
      case "scheduled":
        return "warning";
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meetings</h1>
          <p className="text-muted-foreground">
            Manage group meetings and schedules
          </p>
        </div>
        <Button onClick={() => setIsCreateMeetingOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Meeting
        </Button>
      </div>

      {/* Search */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search meetings..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Group Meetings
          </CardTitle>
          <CardDescription>View and manage all group meetings</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : meetings.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Meetings Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm
                  ? "No meetings match your search criteria."
                  : "Start by creating a new meeting."}
              </p>
              <Button onClick={() => setIsCreateMeetingOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Meeting
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Group</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {meetings.map((meeting) => (
                  <TableRow key={meeting._id}>
                    <TableCell className="font-medium">
                      {meeting.group?.name || "Unknown Group"}
                    </TableCell>
                    <TableCell>{formatDate(meeting.date)}</TableCell>
                    <TableCell>{meeting.location}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(meeting.status)}>
                        {meeting.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setCurrentMeeting(meeting);
                              setIsEditMeetingOpen(true);
                            }}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteMeeting(meeting._id)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Meeting Dialog */}
      <Dialog open={isCreateMeetingOpen} onOpenChange={setIsCreateMeetingOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Meeting</DialogTitle>
          </DialogHeader>
          <MeetingForm onSubmit={handleCreateMeeting} />
        </DialogContent>
      </Dialog>

      {/* Edit Meeting Dialog */}
      <Dialog open={isEditMeetingOpen} onOpenChange={setIsEditMeetingOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Meeting</DialogTitle>
          </DialogHeader>
          <MeetingForm
            onSubmit={handleUpdateMeeting}
            initialValues={currentMeeting}
            onCancel={() => setIsEditMeetingOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MeetingsPage;
