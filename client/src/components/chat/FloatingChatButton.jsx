import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, X, Minimize2 } from "lucide-react";
import { useSocket } from "@/context/SocketContext";
import { useAuth } from "@/context/AuthContext";
import ChatWindow from "./ChatWindow";

export default function FloatingChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications } = useSocket();
  const { isAuthenticated } = useAuth();

  // Count unread notifications
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Don't render if user is not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {isOpen ? (
        <Button
          onClick={() => setIsOpen(false)}
          size="sm"
          variant="outline"
          className="rounded-full w-12 h-12 p-0 shadow-lg"
        >
          <Minimize2 className="h-4 w-4" />
        </Button>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full w-14 h-14 p-0 shadow-lg relative"
        >
          <MessageSquare className="h-6 w-6" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      )}

      {isOpen && (
        <div className="absolute bottom-16 left-0 w-80 h-96 bg-background border rounded-lg shadow-xl">
          <ChatWindow onClose={() => setIsOpen(false)} />
        </div>
      )}
    </div>
  );
}
