// src/pages/Notifications.jsx
import React, { useState, useEffect, useCallback } from "react";
import { notificationService } from "@/services/notificationService";
import { useAuth } from "@/context/AuthContext"; // Import useAuth

// Shadcn UI Components
import {
  Button,
  Card,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Input,
  Label,
  Textarea,
  AlertDialog, // Import AlertDialog for delete confirmation
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter, // Corrected import for AlertDialogFooter
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Badge, // Import Badge for status/priority display
} from "@/components/ui"; // Correct path for Shadcn UI components
import {
  PageLayout,
  PageSection,
  FiltersSection,
  ContentCard,
} from "@/components/layouts/PageLayout";
import { toast } from "sonner";

// Import Lucide React Icons
import {
  Bell,
  Plus,
  Mail,
  CheckCircle,
  XCircle,
  Trash2,
  Loader2,
  Filter,
  Eye,
  EyeOff,
  AlertCircle,
  Clock,
  Send,
  Tag,
  Users, // For recipients
  AlertTriangle, // For high priority
  Info, // For medium/low priority
  DollarSign, // For payment_due
  UserPlus, // For new_member
  Award, // For loan_approved
  CalendarOff, // For overdue
  Settings, // For system
  MessageSquare, // For general
} from "lucide-react";

export default function Notifications() {
  const {
    user: currentUser,
    isAuthenticated,
    loading: authLoading,
  } = useAuth();
  // Assuming only admin/officer can send notifications
  const canSendNotifications =
    currentUser &&
    (currentUser.role === "admin" || currentUser.role === "officer");

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [filterRead, setFilterRead] = useState("all");
  const [formData, setFormData] = useState({
    type: "general",
    title: "",
    message: "",
    priority: "medium",
    recipients: "all",
  });
  const [activeTab, setActiveTab] = useState("inbox");
  const [submitting, setSubmitting] = useState(false); // For form submission loading state
  const [deletingId, setDeletingId] = useState(null); // State for delete confirmation
  const [showConfirmDelete, setShowConfirmDelete] = useState(false); // State for delete confirmation dialog

  // Memoize fetchNotifications to prevent unnecessary re-renders and re-fetches
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await notificationService.getAll();
      setNotifications(
        Array.isArray(data)
          ? data
          : data.data && Array.isArray(data.data)
            ? data.data
            : []
      );
    } catch (err) {
      const errorMessage = err.message || "Failed to load notifications";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies as it fetches all notifications

  // Initial fetch on component mount and when auth status changes
  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        fetchNotifications();
      } else {
        setLoading(false);
        setError("You must be logged in to view notifications.");
      }
    }
  }, [isAuthenticated, authLoading, fetchNotifications]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await notificationService.create(formData);
      toast.success("Notification sent successfully.");
      setShowForm(false);
      setFormData({
        type: "general",
        title: "",
        message: "",
        priority: "medium",
        recipients: "all",
      });
      fetchNotifications();
    } catch (err) {
      toast.error(err.message || "Failed to send notification.");
    } finally {
      setSubmitting(false);
    }
  };

  const markAsRead = async (id) => {
    // Optimistic update
    const originalNotifications = [...notifications];
    setNotifications((prev) =>
      prev.map((n) =>
        n._id === id || n.id === id ? { ...n, isRead: true } : n
      )
    );
    try {
      await notificationService.update(id, { isRead: true });
      toast.success("Notification marked as read.");
    } catch (err) {
      toast.error(err.message || "Failed to mark as read.");
      setNotifications(originalNotifications); // Revert on error
    }
  };

  const markAsUnread = async (id) => {
    // Optimistic update
    const originalNotifications = [...notifications];
    setNotifications((prev) =>
      prev.map((n) =>
        n._id === id || n.id === id ? { ...n, isRead: false } : n
      )
    );
    try {
      await notificationService.update(id, { isRead: false });
      toast.success("Notification marked as unread.");
    } catch (err) {
      toast.error(err.message || "Failed to mark as unread.");
      setNotifications(originalNotifications); // Revert on error
    }
  };

  const handleDeleteClick = (id) => {
    setDeletingId(id);
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    setShowConfirmDelete(false); // Close dialog first
    if (!deletingId) return;
    try {
      await notificationService.remove(deletingId);
      toast.success("Notification deleted.");
      fetchNotifications();
    } catch (err) {
      toast.error(err.message || "Failed to delete notification.");
    } finally {
      setDeletingId(null);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Filter for unread notifications and map to update promises
      const unreadNotifications = notifications.filter((n) => !n.isRead);
      if (unreadNotifications.length === 0) {
        toast.info("No unread notifications to mark as read.");
        return;
      }

      // Optimistic update
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

      await Promise.all(
        unreadNotifications.map((n) =>
          notificationService.update(n._id || n.id, { isRead: true })
        )
      );
      toast.success("All notifications marked as read.");
      fetchNotifications(); // Re-fetch to ensure consistency
    } catch (err) {
      toast.error(err.message || "Failed to mark all as read.");
      fetchNotifications(); // Re-fetch to revert if optimistic update failed
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    const matchesType =
      filterType === "all" || notification.type === filterType;
    const matchesRead =
      filterRead === "all" ||
      (filterRead === "read" && notification.isRead) ||
      (filterRead === "unread" && !notification.isRead);
    let matchesTab = true;
    if (activeTab === "unread") {
      matchesTab = !notification.isRead;
    } else if (activeTab === "high_priority") {
      matchesTab = notification.priority === "high" && !notification.isRead;
    }
    return matchesType && matchesRead && matchesTab;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const highPriorityUnreadCount = notifications.filter(
    (n) => n.priority === "high" && !n.isRead
  ).length;

  const getNotificationIcon = (type) => {
    switch (type) {
      case "payment_due":
        return <DollarSign className="h-6 w-6 text-blue-500" />;
      case "new_member":
        return <UserPlus className="h-6 w-6 text-green-500" />;
      case "loan_approved":
        return <Award className="h-6 w-6 text-purple-500" />;
      case "overdue":
        return <CalendarOff className="h-6 w-6 text-red-500" />;
      case "system":
        return <Settings className="h-6 w-6 text-gray-500" />;
      case "general":
        return <MessageSquare className="h-6 w-6 text-yellow-500" />;
      default:
        return <Bell className="h-6 w-6 text-gray-500" />;
    }
  };

  const getPriorityBadgeVariant = (priority) => {
    switch (priority) {
      case "high":
        return "destructive"; // Red
      case "medium":
        return "default"; // Yellow/Orange
      case "low":
        return "secondary"; // Green/Gray
      default:
        return "secondary";
    }
  };

  // Render loading and access denied states
  if (authLoading) {
    return (
      <PageLayout title="Notifications">
        <div className="p-6 text-center text-muted-foreground">
          Checking authentication and permissions...
        </div>
      </PageLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <PageLayout title="Notifications">
        <div className="p-6 text-center text-red-500">
          <Bell className="h-10 w-10 mx-auto mb-4 text-red-400" />
          Access Denied: Please log in to view your notifications.
        </div>
      </PageLayout>
    );
  }

  // Once authenticated, proceed with data loading or error display for notifications
  if (loading && notifications.length === 0) {
    return (
      <PageLayout title="Notifications">
        <div className="p-6 text-center text-muted-foreground">
          Loading notifications...
        </div>
      </PageLayout>
    );
  }

  if (error && notifications.length === 0) {
    return (
      <PageLayout title="Notifications">
        <div className="p-6 text-center text-red-500">{error}</div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Notifications"
      action={
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={markAllAsRead}
            disabled={loading || unreadCount === 0}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
          {canSendNotifications && (
            <Button onClick={() => setShowForm(true)} disabled={loading}>
              <Plus className="h-4 w-4 mr-2" />
              New Notification
            </Button>
          )}
        </div>
      }
      headerContent={
        <div className="space-y-1">
          <p className="text-muted-foreground">
            You have{" "}
            <span className="font-semibold text-foreground">{unreadCount}</span>{" "}
            unread notifications.
            {highPriorityUnreadCount > 0 && (
              <span className="ml-2 text-red-600 font-semibold">
                ({highPriorityUnreadCount} high priority)
              </span>
            )}
          </p>
        </div>
      }
    >
      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value);
          if (value === "unread") {
            setFilterRead("unread");
            setFilterType("all");
          } else if (value === "high_priority") {
            setFilterType("all");
            setFilterRead("unread"); // High priority usually implies unread
          } else {
            setFilterRead("all");
            setFilterType("all");
          }
        }}
        className="mb-6"
      >
        <TabsList className="grid w-full grid-cols-3 md:w-auto">
          <TabsTrigger value="inbox" className="flex items-center">
            <Bell className="h-4 w-4 mr-2" /> Inbox ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread" className="flex items-center">
            <Mail className="h-4 w-4 mr-2" /> Unread ({unreadCount})
          </TabsTrigger>
          <TabsTrigger value="high_priority" className="flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" /> High Priority (
            {highPriorityUnreadCount})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <PageSection title="Notification Filters">
        <FiltersSection>
          <div className="flex-1">
            <Label htmlFor="filterType" className="mb-2 flex items-center">
              <Tag className="h-4 w-4 mr-1" /> Filter by Type
            </Label>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger id="filterType">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="payment_due">Payment Due</SelectItem>
                <SelectItem value="new_member">New Member</SelectItem>
                <SelectItem value="loan_approved">Loan Approved</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Label htmlFor="filterRead" className="mb-2 flex items-center">
              <Eye className="h-4 w-4 mr-1" /> Filter by Status
            </Label>
            <Select value={filterRead} onValueChange={setFilterRead}>
              <SelectTrigger id="filterRead">
                <SelectValue placeholder="All Notifications" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Notifications</SelectItem>
                <SelectItem value="unread">Unread Only</SelectItem>
                <SelectItem value="read">Read Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setFilterType("all");
                setFilterRead("all");
                setActiveTab("inbox"); // Reset tab to inbox
              }}
            >
              Clear Filters
            </Button>
          </div>
        </FiltersSection>
      </PageSection>

      <PageSection title="All Notifications">
        <ContentCard isLoading={loading}>
          <div className="space-y-3">
            {loading ? (
              // Skeleton loaders for individual notification cards
              Array.from({ length: 5 }).map((_, i) => (
                <Card
                  key={i}
                  className="p-4 border-l-4 border-gray-200 animate-pulse"
                >
                  <div className="flex items-start space-x-3">
                    <div className="h-6 w-6 bg-muted rounded-full"></div>{" "}
                    {/* Icon placeholder */}
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>{" "}
                      {/* Title placeholder */}
                      <div className="h-3 bg-muted rounded w-full"></div>{" "}
                      {/* Message line 1 */}
                      <div className="h-3 bg-muted rounded w-2/3"></div>{" "}
                      {/* Message line 2 */}
                      <div className="h-3 bg-muted rounded w-1/4 mt-2"></div>{" "}
                      {/* Timestamp */}
                    </div>
                  </div>
                </Card>
              ))
            ) : filteredNotifications.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No notifications found matching your filters.</p>
              </Card>
            ) : (
              filteredNotifications.map((notification) => (
                <Card
                  key={notification._id || notification.id}
                  className={`p-4 border-l-4 flex items-start justify-between transition-all duration-200 ease-in-out ${
                    !notification.isRead
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 bg-white"
                  } ${
                    notification.priority === "high" && !notification.isRead
                      ? "ring-2 ring-red-200"
                      : ""
                  }`}
                >
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3
                          className={`font-semibold ${
                            !notification.isRead
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {notification.title}
                        </h3>
                        <Badge
                          variant={getPriorityBadgeVariant(
                            notification.priority
                          )}
                          className="capitalize"
                        >
                          {notification.priority}
                        </Badge>
                        {!notification.isRead && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></span>
                        )}
                      </div>
                      <p
                        className={`text-sm ${
                          !notification.isRead
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        <Clock className="h-3 w-3 inline-block mr-1" />
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                    {!notification.isRead ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          markAsRead(notification._id || notification.id)
                        }
                      >
                        <Eye className="h-4 w-4 mr-1" /> Mark Read
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          markAsUnread(notification._id || notification.id)
                        }
                      >
                        <EyeOff className="h-4 w-4 mr-1" /> Mark Unread
                      </Button>
                    )}
                    {canSendNotifications && ( // Only allow staff/admin to delete
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-800"
                            disabled={
                              deletingId ===
                              (notification.id || notification._id)
                            }
                          >
                            {deletingId ===
                            (notification.id || notification._id) ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Confirm Deletion
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this notification?
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => confirmDelete()}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        </ContentCard>
      </PageSection>

      {/* Create New Notification Dialog */}
      {canSendNotifications && ( // Only show dialog trigger if user can send
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Notification</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label
                    htmlFor="type"
                    className="text-right flex items-center"
                  >
                    <Tag className="h-4 w-4 mr-1" /> Type
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value })
                    }
                    disabled={submitting}
                  >
                    <SelectTrigger id="type" className="col-span-3">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="payment_due">Payment Due</SelectItem>
                      <SelectItem value="new_member">New Member</SelectItem>
                      <SelectItem value="loan_approved">
                        Loan Approved
                      </SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label
                    htmlFor="title"
                    className="text-right flex items-center"
                  >
                    <Info className="h-4 w-4 mr-1" /> Title
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                    className="col-span-3"
                    disabled={submitting}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label
                    htmlFor="message"
                    className="text-right flex items-center"
                  >
                    <MessageSquare className="h-4 w-4 mr-1" /> Message
                  </Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    required
                    className="col-span-3"
                    rows="4"
                    disabled={submitting}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label
                    htmlFor="priority"
                    className="text-right flex items-center"
                  >
                    <AlertCircle className="h-4 w-4 mr-1" /> Priority
                  </Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) =>
                      setFormData({ ...formData, priority: value })
                    }
                    disabled={submitting}
                  >
                    <SelectTrigger id="priority" className="col-span-3">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label
                    htmlFor="recipients"
                    className="text-right flex items-center"
                  >
                    <Users className="h-4 w-4 mr-1" /> Recipients
                  </Label>
                  <Select
                    value={formData.recipients}
                    onValueChange={(value) =>
                      setFormData({ ...formData, recipients: value })
                    }
                    disabled={submitting}
                  >
                    <SelectTrigger id="recipients" className="col-span-3">
                      <SelectValue placeholder="Select recipients" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="staff">Staff Only</SelectItem>
                      <SelectItem value="members">Members Only</SelectItem>
                      <SelectItem value="admins">Admins Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({
                      type: "general",
                      title: "",
                      message: "",
                      priority: "medium",
                      recipients: "all",
                    });
                  }}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Send Notification
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Confirmation Dialog for Delete */}
      <AlertDialog open={showConfirmDelete} onOpenChange={setShowConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this notification? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmDelete()}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
}
