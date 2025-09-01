
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  Users,
  MapPin,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';

import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorBoundary from '../components/common/ErrorBoundary';
import MeetingForm from '../components/custom/MeetingForm';
import { meetingService } from '../services/meetingService';
import { useAuth } from '../hooks/useAuth';
import { formatDate, formatTime } from '../utils/formatters';

const MeetingsPage = () => {
  const [meetings, setMeetings] = useState([]);
  const [meetingStats, setMeetingStats] = useState({
    totalMeetings: 0,
    upcomingMeetings: 0,
    completedMeetings: 0,
    cancelledMeetings: 0,
    averageAttendance: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterGroup, setFilterGroup] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [sortBy, setSortBy] = useState('scheduledDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isCreateMeetingOpen, setIsCreateMeetingOpen] = useState(false);
  const [isEditMeetingOpen, setIsEditMeetingOpen] = useState(false);
  const [currentMeeting, setCurrentMeeting] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const { user } = useAuth();

  useEffect(() => {
    fetchMeetings();
    fetchMeetingStats();
  }, []);

  useEffect(() => {
    const params = {};
    if (searchTerm) params.search = searchTerm;
    if (filterStatus) params.status = filterStatus;
    if (filterGroup) params.group = filterGroup;
    if (dateRange.start) params.startDate = dateRange.start;
    if (dateRange.end) params.endDate = dateRange.end;
    if (sortBy) params.sortBy = sortBy;
    if (sortOrder) params.sortOrder = sortOrder;
    
    // Add tab-specific filters
    if (activeTab === 'upcoming') {
      params.status = 'scheduled';
      params.upcoming = true;
    } else if (activeTab === 'completed') {
      params.status = 'completed';
    } else if (activeTab === 'cancelled') {
      params.status = 'cancelled';
    }

    fetchMeetings(params);
  }, [searchTerm, filterStatus, filterGroup, dateRange, sortBy, sortOrder, activeTab]);

  const fetchMeetings = async (params = {}) => {
    try {
      setLoading(true);
      const response = await meetingService.getAll(params);
      setMeetings(response.data || response || []);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      toast.error('Failed to fetch meetings');
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMeetingStats = async () => {
    try {
      const response = await meetingService.getStats();
      setMeetingStats(response.data || response || {});
    } catch (error) {
      console.error('Error fetching meeting stats:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchMeetings(),
      fetchMeetingStats()
    ]);
    setRefreshing(false);
    toast.success('Data refreshed successfully');
  };

  const handleCreateMeeting = async (meetingData) => {
    try {
      await meetingService.create(meetingData);
      toast.success('Meeting created successfully');
      setIsCreateMeetingOpen(false);
      fetchMeetings();
      fetchMeetingStats();
    } catch (error) {
      console.error('Error creating meeting:', error);
      toast.error(error.response?.data?.message || 'Failed to create meeting');
    }
  };

  const handleEditMeeting = async (meetingData) => {
    try {
      await meetingService.update(currentMeeting._id, meetingData);
      toast.success('Meeting updated successfully');
      setIsEditMeetingOpen(false);
      setCurrentMeeting(null);
      fetchMeetings();
      fetchMeetingStats();
    } catch (error) {
      console.error('Error updating meeting:', error);
      toast.error(error.response?.data?.message || 'Failed to update meeting');
    }
  };

  const handleDeleteMeeting = async (meetingId) => {
    if (!window.confirm('Are you sure you want to delete this meeting?')) {
      return;
    }

    try {
      await meetingService.delete(meetingId);
      toast.success('Meeting deleted successfully');
      fetchMeetings();
      fetchMeetingStats();
    } catch (error) {
      console.error('Error deleting meeting:', error);
      toast.error(error.response?.data?.message || 'Failed to delete meeting');
    }
  };

  const handleStatusChange = async (meetingId, newStatus) => {
    try {
      await meetingService.updateStatus(meetingId, { status: newStatus });
      toast.success(`Meeting ${newStatus} successfully`);
      fetchMeetings();
      fetchMeetingStats();
    } catch (error) {
      console.error('Error updating meeting status:', error);
      toast.error(error.response?.data?.message || 'Failed to update meeting status');
    }
  };

  const openEditModal = (meeting) => {
    setCurrentMeeting(meeting);
    setIsEditMeetingOpen(true);
  };

  const getStatusBadge = (status, scheduledDate) => {
    const isUpcoming = new Date(scheduledDate) > new Date();
    const statusConfig = {
      scheduled: { 
        variant: isUpcoming ? 'default' : 'secondary', 
        color: isUpcoming ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800',
        icon: isUpcoming ? Calendar : AlertCircle
      },
      completed: { 
        variant: 'default', 
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle
      },
      cancelled: { 
        variant: 'destructive', 
        color: 'bg-red-100 text-red-800',
        icon: XCircle
      }
    };

    const config = statusConfig[status] || statusConfig.scheduled;
    const Icon = config.icon;
    
    return (
      <Badge className={config.color}>
        <Icon className="mr-1 h-3 w-3" />
        {status || 'scheduled'}
      </Badge>
    );
  };

  const getMeetingStatusActions = (meeting) => {
    const canEdit = user?.role === 'admin' || user?.role === 'officer' || 
                   (user?.role === 'leader' && meeting.group?.leader === user._id);
    
    if (!canEdit) return null;

    return (
      <div className="flex items-center space-x-1">
        {meeting.status === 'scheduled' && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusChange(meeting._id, 'completed')}
              className="text-green-600 hover:text-green-700"
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusChange(meeting._id, 'cancelled')}
              className="text-red-600 hover:text-red-700"
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => openEditModal(meeting)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDeleteMeeting(meeting._id)}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  if (loading && !refreshing) {
    return <LoadingSpinner size="lg" text="Loading meetings..." />;
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Meetings</h1>
            <p className="text-muted-foreground">
              Schedule and manage group meetings
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={() => setIsCreateMeetingOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Schedule Meeting
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Meetings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{meetingStats.totalMeetings}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{meetingStats.upcomingMeetings}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{meetingStats.completedMeetings}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {meetingStats.averageAttendance?.toFixed(1) || 0}%
              </div>
              <p className="text-xs text-muted-foreground">Last 3 months</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters & Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search meetings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduledDate">Date</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="group">Group</SelectItem>
                  <SelectItem value="createdAt">Created</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Meetings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Meetings</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {activeTab === 'all' && 'All Meetings'}
                  {activeTab === 'upcoming' && 'Upcoming Meetings'}
                  {activeTab === 'completed' && 'Completed Meetings'}
                  {activeTab === 'cancelled' && 'Cancelled Meetings'}
                </CardTitle>
                <CardDescription>
                  {meetings.length} meeting{meetings.length !== 1 ? 's' : ''} found
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading && !refreshing ? (
                  <LoadingSpinner text="Loading meetings..." />
                ) : meetings.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No meetings found</h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm || filterStatus 
                        ? 'No meetings match your current filters.'
                        : 'Get started by scheduling your first meeting.'
                      }
                    </p>
                    <Button onClick={() => setIsCreateMeetingOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Schedule Meeting
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {meetings.map((meeting) => (
                      <Card key={meeting._id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-4">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <h3 className="font-semibold text-lg">
                                      {meeting.title || 'Meeting'}
                                    </h3>
                                    {getStatusBadge(meeting.status, meeting.scheduledDate)}
                                  </div>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div className="flex items-center text-muted-foreground">
                                      <Calendar className="mr-1 h-4 w-4" />
                                      Date: <span className="font-medium ml-1 text-foreground">
                                        {formatDate(meeting.scheduledDate)}
                                      </span>
                                    </div>
                                    <div className="flex items-center text-muted-foreground">
                                      <Clock className="mr-1 h-4 w-4" />
                                      Time: <span className="font-medium ml-1 text-foreground">
                                        {formatTime(meeting.scheduledDate)}
                                      </span>
                                    </div>
                                    <div className="flex items-center text-muted-foreground">
                                      <Users className="mr-1 h-4 w-4" />
                                      Group: <span className="font-medium ml-1 text-foreground">
                                        {meeting.group?.name || 'No Group'}
                                      </span>
                                    </div>
                                    <div className="flex items-center text-muted-foreground">
                                      <MapPin className="mr-1 h-4 w-4" />
                                      Location: <span className="font-medium ml-1 text-foreground">
                                        {meeting.location || 'TBD'}
                                      </span>
                                    </div>
                                  </div>
                                  {meeting.description && (
                                    <p className="text-sm text-muted-foreground mt-2">
                                      {meeting.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 ml-4">
                              {getMeetingStatusActions(meeting)}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Meeting Modal */}
        <Dialog open={isCreateMeetingOpen} onOpenChange={setIsCreateMeetingOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Schedule New Meeting</DialogTitle>
              <DialogDescription>
                Create a new meeting for your group
              </DialogDescription>
            </DialogHeader>
            <MeetingForm
              onSubmit={handleCreateMeeting}
              onCancel={() => setIsCreateMeetingOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Meeting Modal */}
        <Dialog open={isEditMeetingOpen} onOpenChange={setIsEditMeetingOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Meeting</DialogTitle>
              <DialogDescription>
                Update meeting information
              </DialogDescription>
            </DialogHeader>
            <MeetingForm
              initialData={currentMeeting}
              onSubmit={handleEditMeeting}
              onCancel={() => {
                setIsEditMeetingOpen(false);
                setCurrentMeeting(null);
              }}
              isEdit={true}
            />
          </DialogContent>
        </Dialog>
      </div>
    </ErrorBoundary>
  );
};

export default MeetingsPage;
