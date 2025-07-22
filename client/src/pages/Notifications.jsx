// src/components/Notifications.jsx
import React, { useState, useEffect } from 'react';
import { notificationService } from '@/services/notificationService';
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
} from '../components/ui';
import { toast } from 'sonner';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [filterRead, setFilterRead] = useState('all');
  const [formData, setFormData] = useState({
    type: 'general',
    title: '',
    message: '',
    priority: 'medium',
    recipients: 'all'
  });
  const [activeTab, setActiveTab] = useState('inbox');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await notificationService.getAll();
      setNotifications(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load notifications');
      toast.error(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await notificationService.create(formData);
      toast.success('Notification sent successfully.');
      setShowForm(false);
      setFormData({
        type: 'general',
        title: '',
        message: '',
        priority: 'medium',
        recipients: 'all'
      });
      fetchNotifications();
    } catch (err) {
      toast.error(err.message || 'Failed to send notification.');
    } finally {
      setSubmitting(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationService.update(id, { isRead: true });
      fetchNotifications();
    } catch (err) {
      toast.error(err.message || 'Failed to mark as read.');
    }
  };

  const markAsUnread = async (id) => {
    try {
      await notificationService.update(id, { isRead: false });
      fetchNotifications();
    } catch (err) {
      toast.error(err.message || 'Failed to mark as unread.');
    }
  };

  const deleteNotification = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) return;
    try {
      await notificationService.remove(id);
      toast.success('Notification deleted.');
      fetchNotifications();
    } catch (err) {
      toast.error(err.message || 'Failed to delete notification.');
    }
  };

  const markAllAsRead = async () => {
    try {
      await Promise.all(
        notifications.filter(n => !n.isRead).map(n => notificationService.update(n._id || n.id, { isRead: true }))
      );
      fetchNotifications();
    } catch (err) {
      toast.error(err.message || 'Failed to mark all as read.');
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesRead = filterRead === 'all' ||
                        (filterRead === 'read' && notification.isRead) ||
                        (filterRead === 'unread' && !notification.isRead);
    let matchesTab = true;
    if (activeTab === 'unread') {
      matchesTab = !notification.isRead;
    } else if (activeTab === 'high_priority') {
      matchesTab = notification.priority === 'high' && !notification.isRead;
    }
    return matchesType && matchesRead && matchesTab;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const highPriorityUnreadCount = notifications.filter(n => n.priority === 'high' && !n.isRead).length;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'payment_due': return '💰';
      case 'new_member': return '👤';
      case 'loan_approved': return '✅';
      case 'overdue': return '⚠️';
      case 'system': return '🔧';
      default: return '📢';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-800 bg-red-100';
      case 'medium': return 'text-yellow-800 bg-yellow-100';
      case 'low': return 'text-green-800 bg-green-100';
      default: return 'text-gray-800 bg-gray-100';
    }
  };

  if (loading) return <div className="p-6">Loading notifications...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">
            {unreadCount} unread notifications
            {highPriorityUnreadCount > 0 && (
              <span className="ml-2 text-red-600 font-semibold">
                ({highPriorityUnreadCount} high priority)
              </span>
            )}
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={markAllAsRead}>
            Mark All Read
          </Button>
          <Button onClick={() => setShowForm(true)}>
            + New Notification
          </Button>
        </div>
      </div>
      <Tabs value={activeTab} onValueChange={(value) => {
        setActiveTab(value);
        if (value === 'unread') {
          setFilterRead('unread');
          setFilterType('all');
        } else if (value === 'high_priority') {
          setFilterType('all');
          setFilterRead('unread');
        } else {
          setFilterRead('all');
          setFilterType('all');
        }
      }} className="mb-6">
        <TabsList className="grid w-full grid-cols-3 md:w-auto">
          <TabsTrigger value="inbox">
            Inbox ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread ({unreadCount})
          </TabsTrigger>
          <TabsTrigger value="high_priority">
            High Priority ({highPriorityUnreadCount})
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <Card className="p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="filterType" className="mb-2">Filter by Type</Label>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger id="filterType">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="payment_due">Payment Due</SelectItem>
                <SelectItem value="new_member">New Member</SelectItem>
                <SelectItem value="loan_approved">Loan Approved</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="filterRead" className="mb-2">Filter by Status</Label>
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
                setFilterType('all');
                setFilterRead('all');
                setActiveTab('inbox');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">No notifications found matching your filters.</p>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card
              key={notification._id || notification.id}
              className={`p-4 border-l-4 flex items-start justify-between ${
                !notification.isRead ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              } ${
                notification.priority === 'high' ? 'ring-2 ring-red-200' : ''
              }`}
            >
              <div className="flex items-start space-x-3 flex-1">
                <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className={`font-semibold ${
                      !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                    }`}>
                      {notification.title}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      getPriorityColor(notification.priority)
                    }`}>
                      {notification.priority}
                    </span>
                    {!notification.isRead && (
                      <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                    )}
                  </div>
                  <p className={`text-sm ${
                    !notification.isRead ? 'text-gray-800' : 'text-gray-600'
                  }`}>
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">{notification.timestamp}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                {!notification.isRead ? (
                  <Button variant="ghost" size="sm" onClick={() => markAsRead(notification._id || notification.id)}>
                    Mark Read
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => markAsUnread(notification._id || notification.id)}>
                    Mark Unread
                  </Button>
                )}
                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800" onClick={() => deleteNotification(notification._id || notification.id)}>
                  Delete
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Notification</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Type
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({...formData, type: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="payment_due">Payment Due</SelectItem>
                    <SelectItem value="new_member">New Member</SelectItem>
                    <SelectItem value="loan_approved">Loan Approved</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="message" className="text-right">
                  Message
                </Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  required
                  className="col-span-3"
                  rows="4"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="priority" className="text-right">
                  Priority
                </Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({...formData, priority: value})}
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
                <Label htmlFor="recipients" className="text-right">
                  Recipients
                </Label>
                <Select
                  value={formData.recipients}
                  onValueChange={(value) => setFormData({...formData, recipients: value})}
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
                    type: 'general',
                    title: '',
                    message: '',
                    priority: 'medium',
                    recipients: 'all'
                  });
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                Send Notification
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}