// src/pages/Chat.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext"; // Import useSocket

// Shadcn UI Components
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Label,
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
  Badge, // For online status
} from "@/components/ui";
import { PageLayout, PageSection, ContentCard } from "@/components/layouts/PageLayout";
import api from "@/services/api";
import { toast } from "sonner";

// Import Lucide React Icons
import {
  MessageSquare, // Main chat icon
  Send, // Send button icon
  Users, // Group icon
  Loader2, // Loading spinner
  User as UserIcon, // Default user icon
  Clock, // Timestamp icon
  CircleDot, // For online status
} from "lucide-react";

import { UserAvatar } from '@/components/custom/UserAvatar';

export default function Chat() {
  const { user: currentUser, groups, isAuthenticated, loading: authLoading } = useAuth();
  const {
    isConnected, // From SocketContext
    onlineUsers, // From SocketContext
    joinRoom,
    leaveRoom,
    sendUpdate, // Generic send function, we'll use it for chat_message
    startTyping, // For typing indicators
    stopTyping, // For typing indicators
    socket // Direct access to socketService if needed for custom listeners
  } = useSocket();

  const [selectedGroup, setSelectedGroup] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]); // State to hold users currently typing
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null); // Ref for typing timeout

  // Set initial selected group if available
  useEffect(() => {
    if (groups.length > 0 && !selectedGroup) {
      setSelectedGroup(groups[0]._id || groups[0].id);
    }
  }, [groups, selectedGroup]);

  // Handle joining and leaving chat rooms based on selectedGroup
  useEffect(() => {
    if (!isAuthenticated || !selectedGroup || !isConnected) return;

    // Join the new group's chat room
    joinRoom(`group_${selectedGroup}`);

    // Set up real-time message listener
    const handleNewMessage = (newMessage) => {
      // Ensure the message is for the currently selected group
      if (newMessage.groupId === selectedGroup) {
        setMessages(prev => [...prev, newMessage]);
      }
    };
    socket.on('chat_message', handleNewMessage);

    // Set up typing indicator listener
    const handleTypingUpdate = ({ userId, groupId, isTyping }) => {
      if (groupId === selectedGroup && userId !== currentUser._id) {
        setTypingUsers(prev => {
          if (isTyping && !prev.includes(userId)) {
            return [...prev, userId];
          } else if (!isTyping && prev.includes(userId)) {
            return prev.filter(id => id !== userId);
          }
          return prev;
        });
      }
    };
    socket.on('typing_update', handleTypingUpdate);

    // Cleanup function: leave the room and remove listeners
    return () => {
      leaveRoom(`group_${selectedGroup}`);
      socket.off('chat_message', handleNewMessage);
      socket.off('typing_update', handleTypingUpdate);
    };
  }, [selectedGroup, isConnected, isAuthenticated, currentUser, joinRoom, leaveRoom, socket]);


  // Fetch historical messages when selected group changes
  const fetchMessages = useCallback(async () => {
    if (!selectedGroup) {
      setMessages([]); // Clear messages if no group is selected
      return;
    }
    setLoadingMessages(true);
    try {
      const res = await api.get(`/groups/${selectedGroup}/chats`);
      setMessages(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      toast.error(err.message || "Failed to load messages.");
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }, [selectedGroup]);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchMessages();
    }
  }, [selectedGroup, isAuthenticated, authLoading, fetchMessages]);

  // Scroll to bottom of messages whenever messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loadingMessages, typingUsers]); // Also scroll when typing users change

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage || !selectedGroup || sendingMessage || !isConnected) return;

    setSendingMessage(true);
    // Stop typing indicator immediately after sending
    stopTyping(`group_${selectedGroup}`);
    clearTimeout(typingTimeoutRef.current);

    // Optimistically add the message to the UI
    const newMessage = {
      _id: `temp-${Date.now()}`, // Temporary ID
      message: trimmedMessage,
      sender: currentUser ? { _id: currentUser._id, name: currentUser.name, avatar: currentUser.avatar } : { name: "You" },
      timestamp: new Date().toISOString(),
      groupId: selectedGroup, // Include groupId for the socket event
    };
    setMessages((prev) => [...prev, newMessage]);
    setMessage(""); // Clear input immediately

    try {
      // Send message via socket
      sendUpdate('chat_message', {
        groupId: selectedGroup,
        message: trimmedMessage,
        senderId: currentUser._id, // Include sender ID for backend processing
      });

      // Optionally, you might still want to persist to DB via API for reliability
      // const res = await api.post(`/groups/${selectedGroup}/chats`, { message: trimmedMessage });
      // // If you persist via API and expect a response, replace optimistic message with actual
      // setMessages((prev) =>
      //   prev.map((msg) => (msg._id === newMessage._id ? { ...res.data.data, sender: newMessage.sender } : msg))
      // );

      toast.success("Message sent!");
    } catch (err) {
      toast.error(err.message || "Failed to send message.");
      // Revert optimistic update if sending failed
      setMessages((prev) => prev.filter((msg) => msg._id !== newMessage._id));
      setMessage(trimmedMessage); // Restore message to input
    } finally {
      setSendingMessage(false);
    }
  };

  const handleMessageInputChange = (e) => {
    setMessage(e.target.value);

    if (!selectedGroup || !isConnected) return;

    // Implement typing indicator logic
    if (e.target.value.length > 0) {
      if (!typingTimeoutRef.current) {
        // Start typing if not already
        startTyping(`group_${selectedGroup}`);
      }
      // Reset timeout on each key press
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(`group_${selectedGroup}`);
        typingTimeoutRef.current = null;
      }, 3000); // Stop typing after 3 seconds of inactivity
    } else {
      // If input is empty, stop typing immediately
      stopTyping(`group_${selectedGroup}`);
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  // Get online users for the current group
  const onlineUsersInGroup = onlineUsers.filter(u =>
    currentUser && u.id !== currentUser._id && // Exclude current user
    groups.some(g => (g._id || g.id) === selectedGroup && g.members.includes(u.id)) // Check if user is in selected group
  );

  // Get typing users' names
  const typingUserNames = typingUsers
    .map(userId => {
      const user = onlineUsers.find(u => u.id === userId);
      return user ? user.name : null;
    })
    .filter(Boolean); // Remove nulls

  // Render loading and access denied states
  if (authLoading) {
    return (
      <PageLayout title="Group Chat">
        <div className="p-6 text-center text-muted-foreground">Checking authentication and permissions...</div>
      </PageLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <PageLayout title="Group Chat">
        <div className="p-6 text-center text-red-500">
          <MessageSquare className="h-10 w-10 mx-auto mb-4 text-red-400" />
          Access Denied: Please log in to join the chat.
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Group Chat"
      headerContent={
        <div className="w-full md:w-64">
          <Label htmlFor="group" className="mb-2 block flex items-center">
            <Users className="h-4 w-4 mr-1" /> Select Group
          </Label>
          <Select
            value={selectedGroup}
            onValueChange={setSelectedGroup}
            id="group"
            disabled={loadingMessages || sendingMessage || !isConnected}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select group" />
            </SelectTrigger>
            <SelectContent>
              {groups.length === 0 ? (
                // FIX: Removed value="" from SelectItem
                <SelectItem disabled>No groups available</SelectItem>
              ) : (
                groups.map((g) => (
                  <SelectItem key={g._id || g.id} value={g._id || g.id}>
                    {g.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      }
    >
      <PageSection title="Messages">
        <ContentCard className="flex flex-col h-[60vh] min-h-[400px]">
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/50 rounded-lg mb-4">
            {loadingMessages ? (
              <div className="flex justify-center items-center h-full text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mr-2" /> Loading messages...
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-full text-muted-foreground">
                <MessageSquare className="h-12 w-12 opacity-50 mb-4" />
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={msg._id || idx}
                  className={`flex items-start gap-3 ${
                    msg.sender && msg.sender._id === currentUser._id
                      ? 'justify-end'
                      : 'justify-start'
                  }`}
                >
                  {/* Sender's avatar and name for incoming messages */}
                  {!(msg.sender && msg.sender._id === currentUser._id) && (
                    <UserAvatar user={msg.sender} className="flex-shrink-0" />
                  )}
                  <div
                    className={
                      msg.sender && msg.sender._id === currentUser._id
                        ? 'bg-blue-500 text-white rounded-lg p-3 max-w-[70%] break-words shadow-md'
                        : 'bg-gray-200 text-gray-800 rounded-lg p-3 max-w-[70%] break-words shadow-md'
                    }
                  >
                    <div className="font-semibold text-sm mb-1">
                      {msg.sender?.name || "Unknown User"}
                    </div>
                    <p className="text-base">{msg.message}</p>
                    <div className="text-xs text-right mt-1 opacity-80">
                      <Clock className="h-3 w-3 inline-block mr-1" />
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  {/* Current user's avatar for outgoing messages */}
                  {msg.sender && msg.sender._id === currentUser._id && (
                    <UserAvatar user={currentUser} className="flex-shrink-0" />
                  )}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Typing indicator */}
          {typingUserNames.length > 0 && (
            <div className="text-sm text-muted-foreground mb-2 flex items-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              {typingUserNames.join(', ')} {typingUserNames.length > 1 ? 'are' : 'is'} typing...
            </div>
          )}

          {/* Online users in group */}
          {onlineUsersInGroup.length > 0 && (
            <div className="text-sm text-muted-foreground mb-2 flex items-center flex-wrap gap-x-2">
              <CircleDot className="h-4 w-4 mr-1 text-green-500" /> Online:
              {onlineUsersInGroup.map(u => (
                <Badge key={u.id} variant="outline" className="flex items-center gap-1">
                  <UserIcon className="h-3 w-3" /> {u.name}
                </Badge>
              ))}
            </div>
          )}

          <form onSubmit={handleSend} className="flex space-x-2">
            <Input
              value={message}
              onChange={handleMessageInputChange} // Use the new handler
              placeholder={selectedGroup ? "Type a message..." : "Select a group to chat..."}
              disabled={!selectedGroup || loadingMessages || sendingMessage || !isConnected}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={!selectedGroup || loadingMessages || sendingMessage || !message.trim() || !isConnected}
            >
              {sendingMessage ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Send
            </Button>
          </form>
        </ContentCard>
      </PageSection>
    </PageLayout>
  );
}
