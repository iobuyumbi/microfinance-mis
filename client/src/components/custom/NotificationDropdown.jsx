import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../context/SocketContext";
import { notificationService } from "../../services/notificationService";
import { formatDistanceToNow } from "date-fns";

// UI Components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Separator } from "../../components/ui/separator";

// Icons
import { 
  Bell, 
  Check, 
  Trash2, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  XCircle,
  DollarSign,
  Users,
  Calendar,
  FileText
} from "lucide-react";

export default function NotificationDropdown() {
  const navigate = useNavigate();
  const { notifications, markNotificationAsRead, clearNotifications } = useSocket();
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  
  const unreadCount = notifications.filter(notification => !notification.read).length;
  
  // Group notifications by type and date
  const groupedNotifications = useMemo(() => {
    const groups = {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: []
    };
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() - 7);
    
    notifications.forEach(notification => {
      const notificationDate = new Date(notification.createdAt || Date.now());
      
      if (notificationDate >= today) {
        groups.today.push(notification);
      } else if (notificationDate >= yesterday) {
        groups.yesterday.push(notification);
      } else if (notificationDate >= thisWeek) {
        groups.thisWeek.push(notification);
      } else {
        groups.older.push(notification);
      }
    });
    
    return groups;
  }, [notifications]);
  
  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read in the UI immediately for better UX
      markNotificationAsRead(notification.id);
      
      // Mark as read in the database if there's an ID
      if (notification._id) {
        await notificationService.update(notification._id, { isRead: true });
      }
      
      // Navigate to the link if provided
      if (notification.link) {
        navigate(notification.link);
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };
  
  const handleMarkAllAsRead = async () => {
    try {
      setIsMarkingAll(true);
      
      // Mark all as read in database
      const unreadNotifications = notifications.filter(n => !n.read && n._id);
      await Promise.all(
        unreadNotifications.map(notification =>
          notificationService.update(notification._id, { isRead: true })
        )
      );
      
      // Clear all notifications in the UI
      clearNotifications();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    } finally {
      setIsMarkingAll(false);
    }
  };
  
  const getNotificationIcon = (type) => {
    const iconMap = {
      info: Info,
      warning: AlertTriangle,
      success: CheckCircle,
      error: XCircle,
      alert: AlertTriangle,
      payment: DollarSign,
      group: Users,
      meeting: Calendar,
      document: FileText
    };
    
    const IconComponent = iconMap[type] || Info;
    return <IconComponent className="h-4 w-4" />;
  };
  
  const getNotificationTypeColor = (type) => {
    const colorMap = {
      info: "text-blue-600 bg-blue-100",
      warning: "text-yellow-600 bg-yellow-100",
      success: "text-green-600 bg-green-100",
      error: "text-red-600 bg-red-100",
      alert: "text-orange-600 bg-orange-100",
      payment: "text-green-600 bg-green-100",
      group: "text-blue-600 bg-blue-100",
      meeting: "text-purple-600 bg-purple-100",
      document: "text-gray-600 bg-gray-100"
    };
    
    return colorMap[type] || "text-gray-600 bg-gray-100";
  };
  
  const getNotificationTypeLabel = (type) => {
    const labelMap = {
      info: "Information",
      warning: "Warning",
      success: "Success",
      error: "Error",
      alert: "Alert",
      payment: "Payment",
      group: "Group",
      meeting: "Meeting",
      document: "Document"
    };
    
    return labelMap[type] || "Notification";
  };
  
  const renderNotificationGroup = (title, notifications, showSeparator = true) => {
    if (notifications.length === 0) return null;
    
    return (
      <>
        {showSeparator && <DropdownMenuSeparator />}
        <div className="px-2 py-1">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {title}
          </h4>
        </div>
        {notifications.map((notification, index) => (
          <DropdownMenuItem 
            key={notification.id || index} 
            className={`flex flex-col items-start p-3 cursor-pointer hover:bg-accent ${!notification.read ? 'bg-muted/50' : ''}`}
            onClick={() => handleNotificationClick(notification)}
          >
            <div className="flex w-full items-start gap-3">
              <div className={`${getNotificationTypeColor(notification.type)} p-1.5 rounded-full flex-shrink-0 mt-0.5`}>
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm truncate">
                    {notification.title || getNotificationTypeLabel(notification.type)}
                  </span>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-1">
                  {notification.message}
                </p>
                <div className="text-xs text-muted-foreground">
                  {notification.createdAt 
                    ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })
                    : 'Just now'}
                </div>
              </div>
            </div>
          </DropdownMenuItem>
        ))}
      </>
    );
  };
  
  const hasNotifications = notifications.length > 0;
  const hasUnreadNotifications = unreadCount > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {hasUnreadNotifications && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">View notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-[500px]">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span className="font-semibold">Notifications</span>
          {hasUnreadNotifications && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-7 px-2"
              onClick={handleMarkAllAsRead}
              disabled={isMarkingAll}
            >
              {isMarkingAll ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current" />
              ) : (
                <Check className="h-3 w-3 mr-1" />
              )}
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        
        <ScrollArea className="h-[400px]">
          {hasNotifications ? (
            <div className="py-2">
              {renderNotificationGroup("Today", groupedNotifications.today, false)}
              {renderNotificationGroup("Yesterday", groupedNotifications.yesterday)}
              {renderNotificationGroup("This Week", groupedNotifications.thisWeek)}
              {renderNotificationGroup("Older", groupedNotifications.older)}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-sm font-medium mb-2">No notifications</h3>
              <p className="text-xs text-muted-foreground">
                You're all caught up! New notifications will appear here.
              </p>
            </div>
          )}
        </ScrollArea>
        
        {hasNotifications && (
          <>
            <Separator />
            <div className="p-2">
              <p className="text-xs text-muted-foreground text-center">
                {unreadCount > 0 
                  ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
                  : 'All notifications read'
                }
              </p>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}