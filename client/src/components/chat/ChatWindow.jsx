// src/components/chat/ChatWindow.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";

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
  Badge,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  ScrollArea,
} from "@/components/ui";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { toast } from "sonner";

// Lucide React Icons
import {
  MessageSquare,
  Send,
  Users,
  Loader2,
  User as UserIcon,
  Clock,
  CircleDot,
  Shield,
  Building,
  AlertCircle,
  Search,
} from "lucide-react";

export default function ChatWindow({ isOpen, onClose }) {
  const { user: currentUser, isAuthenticated } = useAuth();
  const {
    isConnected,
    onlineUsers,
    joinRoom,
    leaveRoom,
    sendMessage,
    startTyping,
    stopTyping,
    socket,
  } = useSocket();

  const [activeTab, setActiveTab] = useState("groups");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState({});
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [groups, setGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  // Mock groups data - replace with actual API call
  useEffect(() => {
    if (isAuthenticated) {
      // Mock groups for demonstration
      const mockGroups = [
        { _id: "group1", name: "Community Group 1" },
        { _id: "group2", name: "Community Group 2" },
        { _id: "admin_support", name: "Admin Support" },
      ];
      setGroups(mockGroups);

      if (mockGroups.length > 0) {
        setSelectedGroup(mockGroups[0]._id);
      }
    }
  }, [isAuthenticated]);

  // Handle joining and leaving chat rooms
  useEffect(() => {
    if (!isAuthenticated || !isConnected) return;

    // Join admin chat room
    joinRoom("admin_support");

    // Join group chat rooms
    groups.forEach((group) => {
      if (group._id !== "admin_support") {
        joinRoom(`group_${group._id}`);
      }
    });

    // Set up real-time message listeners
    const handleNewMessage = (newMessage) => {
      setMessages((prev) => ({
        ...prev,
        [newMessage.chatId]: [...(prev[newMessage.chatId] || []), newMessage],
      }));
    };

    const handleTypingUpdate = ({ userId, chatId, isTyping }) => {
      setTypingUsers((prev) => ({
        ...prev,
        [chatId]: isTyping
          ? [...(prev[chatId] || []).filter((id) => id !== userId), userId]
          : (prev[chatId] || []).filter((id) => id !== userId),
      }));
    };

    if (socket) {
      socket.on("new_message", handleNewMessage);
      socket.on("typing_update", handleTypingUpdate);

      return () => {
        socket.off("new_message", handleNewMessage);
        socket.off("typing_update", handleTypingUpdate);
      };
    }
  }, [isAuthenticated, isConnected, groups, socket, joinRoom]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async (e, chatId) => {
    e.preventDefault();
    if (!message.trim() || !isConnected) return;

    try {
      setSendingMessage(true);

      const messageData = {
        chatId,
        content: message.trim(),
        sender: currentUser._id || currentUser.id,
        senderName: currentUser.name,
        timestamp: new Date().toISOString(),
      };

      await sendMessage(messageData);
      setMessage("");
      stopTyping(chatId);
    } catch (err) {
      toast.error("Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleMessageInputChange = (e, chatId) => {
    const value = e.target.value;
    setMessage(value);

    // Handle typing indicators
    if (value.trim()) {
      startTyping(chatId);

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout to stop typing
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(chatId);
      }, 2000);
    } else {
      stopTyping(chatId);
    }
  };

  const getOnlineUsersInGroup = (groupId) => {
    return onlineUsers.filter((user) => user.groups?.includes(groupId));
  };

  const getTypingUsers = (chatId) => {
    return typingUsers[chatId] || [];
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCurrentChatId = () => {
    if (activeTab === "admin") return "admin_support";
    return selectedGroup ? `group_${selectedGroup}` : null;
  };

  const currentChatId = getCurrentChatId();
  const currentMessages = messages[currentChatId] || [];
  const typingUsersList = getTypingUsers(currentChatId);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-20 right-4 w-96 h-[500px] bg-background border rounded-lg shadow-lg flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5" />
          <h3 className="font-semibold">Chat</h3>
          {isConnected && (
            <Badge variant="outline" className="text-xs">
              <CircleDot className="h-3 w-3 mr-1 text-green-500" />
              Online
            </Badge>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          ×
        </Button>
      </div>

      {/* Chat Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="groups">Group Chats</TabsTrigger>
          <TabsTrigger value="admin">Admin Support</TabsTrigger>
        </TabsList>

        <TabsContent value="groups" className="flex-1 flex flex-col">
          {/* Group Selection */}
          <div className="p-4 border-b">
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger>
                <SelectValue placeholder="Select a group" />
              </SelectTrigger>
              <SelectContent>
                {groups
                  .filter((group) => group._id !== "admin_support")
                  .map((group) => (
                    <SelectItem key={group._id} value={group._id}>
                      {group.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {currentMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.sender === (currentUser._id || currentUser.id) ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] ${msg.sender === (currentUser._id || currentUser.id) ? "bg-primary text-primary-foreground" : "bg-muted"} rounded-lg p-3`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium">
                        {msg.senderName}
                      </span>
                      <span className="text-xs opacity-70">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </div>
              ))}

              {typingUsersList.length > 0 && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {typingUsersList.length} typing...
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="admin" className="flex-1 flex flex-col">
          {/* Admin Support Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {currentMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.sender === (currentUser._id || currentUser.id) ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] ${msg.sender === (currentUser._id || currentUser.id) ? "bg-primary text-primary-foreground" : "bg-muted"} rounded-lg p-3`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium">
                        {msg.senderName}
                      </span>
                      <span className="text-xs opacity-70">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </div>
              ))}

              {typingUsersList.length > 0 && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {typingUsersList.length} typing...
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Message Input */}
      <div className="p-4 border-t">
        <form
          onSubmit={(e) => handleSend(e, currentChatId)}
          className="flex space-x-2"
        >
          <Input
            ref={inputRef}
            value={message}
            onChange={(e) => handleMessageInputChange(e, currentChatId)}
            placeholder="Type your message..."
            disabled={!isConnected || sendingMessage}
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!message.trim() || !isConnected || sendingMessage}
          >
            {sendingMessage ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
