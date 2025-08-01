import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, Trash2, MessageSquare } from "lucide-react";

const UserNotificationsPage = () => {
  const notifications = [
    {
      id: 1,
      title: "Payment Due Reminder",
      message: "Your loan payment of ₦15,000 is due on February 20th, 2024.",
      type: "payment",
      read: false,
      date: "2024-01-15T10:30:00Z",
    },
    {
      id: 2,
      title: "Meeting Reminder",
      message: "Group meeting scheduled for tomorrow at 2:00 PM.",
      type: "meeting",
      read: true,
      date: "2024-01-14T15:45:00Z",
    },
    {
      id: 3,
      title: "Contribution Confirmation",
      message: "Your contribution of ₦5,000 has been received and recorded.",
      type: "contribution",
      read: true,
      date: "2024-01-13T09:15:00Z",
    },
  ];

  const getNotificationIcon = (type) => {
    switch (type) {
      case "payment":
        return <Bell className="w-5 h-5 text-red-500" />;
      case "meeting":
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case "contribution":
        return <Bell className="w-5 h-5 text-green-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Notifications</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Check className="w-4 h-4 mr-2" />
            Mark All Read
          </Button>
          <Button variant="outline">
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      {/* Notification Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.length}</div>
            <p className="text-xs text-muted-foreground">
              All time notifications
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {notifications.filter(n => !n.read).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              New notifications
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start space-x-4 p-4 rounded-lg border ${
                  notification.read ? "bg-gray-50" : "bg-blue-50 border-blue-200"
                }`}
              >
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900">
                      {notification.title}
                    </h4>
                    <div className="flex items-center space-x-2">
                      {!notification.read && (
                        <Badge variant="default" className="text-xs">
                          New
                        </Badge>
                      )}
                      <span className="text-xs text-gray-500">
                        {formatDate(notification.date)}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {notification.message}
                  </p>
                  <div className="flex items-center space-x-2 mt-3">
                    {!notification.read && (
                      <Button variant="outline" size="sm">
                        <Check className="w-4 h-4 mr-1" />
                        Mark Read
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserNotificationsPage; 