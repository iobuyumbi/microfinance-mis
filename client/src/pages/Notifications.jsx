// src/components/Notifications.jsx
import React, { useState } from 'react';

// Shadcn UI Imports
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


export default function Notifications() {
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'payment_due', title: 'Payment Due Reminder', message: 'John Doe has a loan payment due tomorrow ($500)', timestamp: '2024-07-22 10:30', read: false, priority: 'high' },
    { id: 2, type: 'new_member', title: 'New Member Registration', message: 'Jane Smith has registered as a new member', timestamp: '2024-07-22 09:15', read: true, priority: 'medium' },
    { id: 3, type: 'loan_approved', title: 'Loan Approved', message: 'Loan application for Bob Johnson ($7,500) has been approved', timestamp: '2024-07-21 16:45', read: false, priority: 'medium' },
    { id: 4, type: 'system', title: 'System Maintenance', message: 'Scheduled maintenance will occur tonight from 2-4 AM', timestamp: '2024-07-21 14:20', read: true, priority: 'low' },
    { id: 5, type: 'overdue', title: 'Overdue Payment Alert', message: 'Alice Brown has an overdue payment of $300', timestamp: '2024-07-21 11:00', read: false, priority: 'high' }
  ]);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const newNotification = {
      ...formData,
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      read: false
    };
    setNotifications([newNotification, ...notifications]);
    setFormData({
      type: 'general',
      title: '',
      message: '',
      priority: 'medium',
      recipients: 'all'
    });
    setShowForm(false);
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAsUnread = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: false } : n));
  };

  const deleteNotification = (id) => {
    if (confirm('Are you sure you want to delete this notification?')) {
      setNotifications(notifications.filter(n => n.id !== id));
    }
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesRead = filterRead === 'all' ||
                        (filterRead === 'read' && notification.read) ||
                        (filterRead === 'unread' && !notification.read);
    
    // Apply tab-specific filters
    let matchesTab = true;
    if (activeTab === 'unread') {
      matchesTab = !notification.read;
    } else if (activeTab === 'high_priority') {
      matchesTab = notification.priority === 'high' && !notification.read; // Show only unread high priority
    }

    return matchesType && matchesRead && matchesTab;
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const highPriorityUnreadCount = notifications.filter(n => n.priority === 'high' && !n.read).length;


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

      ---

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => {
        setActiveTab(value);
        if (value === 'unread') {
          setFilterRead('unread');
          setFilterType('all');
        } else if (value === 'high_priority') {
          setFilterType('all'); // Reset type filter for high priority tab
          setFilterRead('unread'); // Only show unread high priority in this tab
        } else { // inbox tab
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
        <TabsContent value="inbox" className="mt-4">
          {/* Filters remain the same, but the initial state will be reset by TabsTrigger logic */}
        </TabsContent>
        <TabsContent value="unread" className="mt-4">
          {/* Filters remain the same, but the initial state will be reset by TabsTrigger logic */}
        </TabsContent>
        <TabsContent value="high_priority" className="mt-4">
          {/* Filters remain the same, but the initial state will be reset by TabsTrigger logic */}
        </TabsContent>
      </Tabs>

      {/* Filters */}
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
                setActiveTab('inbox'); // Reset tab when clearing filters
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">No notifications found matching your filters.</p>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`p-4 border-l-4 flex items-start justify-between ${
                !notification.read ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              } ${
                notification.priority === 'high' ? 'ring-2 ring-red-200' : ''
              }`}
            >
              <div className="flex items-start space-x-3 flex-1">
                <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className={`font-semibold ${
                      !notification.read ? 'text-gray-900' : 'text-gray-700'
                    }`}>
                      {notification.title}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      getPriorityColor(notification.priority)
                    }`}>
                      {notification.priority}
                    </span>
                    {!notification.read && (
                      <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                    )}
                  </div>
                  <p className={`text-sm ${
                    !notification.read ? 'text-gray-800' : 'text-gray-600'
                  }`}>
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">{notification.timestamp}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                {!notification.read ? (
                  <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)}>
                    Mark Read
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => markAsUnread(notification.id)}>
                    Mark Unread
                  </Button>
                )}
                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800" onClick={() => deleteNotification(notification.id)}>
                  Delete
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      ---

      {/* New Notification Form Dialog */}
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
              <Button type="submit">
                Send Notification
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}