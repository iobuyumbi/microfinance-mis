// src/pages/Chat.jsx
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
import {
  PageLayout,
  PageSection,
  ContentCard,
} from "@/components/layouts/PageLayout";
import { toast } from "sonner";

// Import Lucide React Icons
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
} from "lucide-react";

import { UserAvatar } from "@/components/custom/UserAvatar";

export default function Chat() {
  const {
    user: currentUser,
    groups,
    isAuthenticated,
    loading: authLoading,
  } = useAuth();
  const {
    isConnected,
    onlineUsers,
    joinRoom,
    leaveRoom,
    sendUpdate,
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
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Set initial selected group if available
  useEffect(() => {
    if (groups.length > 0 && !selectedGroup) {
      setSelectedGroup(groups[0]._id || groups[0].id);
    }
  }, [groups, selectedGroup]);

  // Handle joining and leaving chat rooms
  useEffect(() => {
    if (!isAuthenticated || !isConnected) return;

    // Join admin chat room
    joinRoom("admin_support");

    // Join group chat rooms
    groups.forEach((group) => {
      joinRoom(`group_${group._id || group.id}`);
    });

    // Set up real-time message listeners
    const handleNewMessage = (newMessage) => {
      setMessages((prev) => ({
        ...prev,
        [newMessage.chatId]: [...(prev[newMessage.chatId] || []), newMessage],
      }));
    };

    const handleTypingUpdate = ({ userId, chatId, isTyping }) => {
      if (userId !== currentUser._id) {
        setTypingUsers((prev) => ({
          ...prev,
          [chatId]: isTyping
            ? [...(prev[chatId] || []).filter((id) => id !== userId), userId]
            : (prev[chatId] || []).filter((id) => id !== userId),
        }));
      }
    };

    socket.on("chat_message", handleNewMessage);
    socket.on("typing_update", handleTypingUpdate);

    return () => {
      leaveRoom("admin_support");
      groups.forEach((group) => {
        leaveRoom(`group_${group._id || group.id}`);
      });
      socket.off("chat_message", handleNewMessage);
      socket.off("typing_update", handleTypingUpdate);
    };
  }, [
    isAuthenticated,
    isConnected,
    currentUser,
    groups,
    joinRoom,
    leaveRoom,
    socket,
  ]);

  // Fetch historical messages
  const fetchMessages = useCallback(async (chatId) => {
    if (!chatId) return;

    setLoadingMessages(true);
    try {
      // Mock API call - replace with actual endpoint
      const mockMessages = [
        {
          _id: "1",
          message:
            chatId === "admin"
              ? "Welcome to Admin Support! How can we help you today?"
              : "Welcome to the group chat!",
          sender: {
            _id: chatId === "admin" ? "admin" : "system",
            name: chatId === "admin" ? "Admin Support" : "System",
            avatar: null,
          },
          timestamp: new Date(Date.now() - 60000).toISOString(),
          chatId: chatId,
        },
      ];

      setMessages((prev) => ({
        ...prev,
        [chatId]: mockMessages,
      }));
    } catch (err) {
      toast.error("Failed to load messages.");
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      // Load admin chat messages
      fetchMessages("admin");

      // Load group chat messages
      if (selectedGroup) {
        fetchMessages(selectedGroup);
      }
    }
  }, [isAuthenticated, authLoading, selectedGroup, fetchMessages]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  const handleSend = async (e, chatId) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage || !chatId || sendingMessage) return;

    setSendingMessage(true);
    const roomName = chatId === "admin" ? "admin_support" : `group_${chatId}`;

    if (isConnected) {
      stopTyping(roomName);
      clearTimeout(typingTimeoutRef.current);
    }

    // Optimistically add message
    const newMessage = {
      _id: `temp-${Date.now()}`,
      message: trimmedMessage,
      sender: currentUser
        ? {
            _id: currentUser._id,
            name: currentUser.name,
            avatar: currentUser.avatar,
          }
        : { name: "You" },
      timestamp: new Date().toISOString(),
      chatId: chatId,
    };

    setMessages((prev) => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), newMessage],
    }));
    setMessage("");

    // Only try to send to server if connected
    if (isConnected) {
      try {
        sendUpdate("chat_message", {
          chatId: chatId,
          message: trimmedMessage,
          senderId: currentUser._id,
          chatType: chatId === "admin" ? "admin" : "group",
        });
      } catch (err) {
        toast.error("Failed to send message to server.");
        setMessages((prev) => ({
          ...prev,
          [chatId]: (prev[chatId] || []).filter(
            (msg) => msg._id !== newMessage._id
          ),
        }));
        setMessage(trimmedMessage);
      }
    } else {
      // Store message locally when disconnected
      toast.info("Message saved locally (not connected to server)");
    }

    setSendingMessage(false);
  };

  const handleMessageInputChange = (e, chatId) => {
    setMessage(e.target.value);

    if (!chatId || !isConnected) return;

    const roomName = chatId === "admin" ? "admin_support" : `group_${chatId}`;

    if (e.target.value.length > 0) {
      if (!typingTimeoutRef.current) {
        startTyping(roomName);
      }
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(roomName);
        typingTimeoutRef.current = null;
      }, 3000);
    } else {
      stopTyping(roomName);
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  const getOnlineUsersInGroup = (groupId) => {
    return onlineUsers.filter(
      (u) =>
        currentUser &&
        u.id !== currentUser._id &&
        groups.some(
          (g) => (g._id || g.id) === groupId && g.members.includes(u.id)
        )
    );
  };

  const getTypingUsers = (chatId) => {
    return (typingUsers[chatId] || [])
      .map((userId) => {
        const user = onlineUsers.find((u) => u.id === userId);
        return user ? user.name : null;
      })
      .filter(Boolean);
  };

  // Render loading and access denied states
  if (authLoading) {
    return (
      <PageLayout title="Chat">
        <div className="p-6 text-center text-muted-foreground">
          Checking authentication and permissions...
        </div>
      </PageLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <PageLayout title="Chat">
        <div className="p-6 text-center text-red-500">
          <MessageSquare className="h-10 w-10 mx-auto mb-4 text-red-400" />
          Access Denied: Please log in to join the chat.
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Chat">
      <PageSection title="Real-time Communication">
        <ContentCard>
          {/* Connection Status */}
          <div className="mb-4 p-3 rounded-lg border bg-muted/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
                ></div>
                <span className="text-sm font-medium">
                  {isConnected
                    ? "Connected to chat server"
                    : "Disconnected from chat server"}
                </span>
              </div>
              {!isConnected && (
                <div className="text-xs text-muted-foreground">
                  Messages will be saved locally
                </div>
              )}
            </div>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="groups" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Group Chats
              </TabsTrigger>
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Admin Support
              </TabsTrigger>
            </TabsList>

            <TabsContent value="groups" className="space-y-4">
              {groups.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>You are not a member of any groups yet.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <Label htmlFor="group" className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Select Group
                    </Label>
                    <Select
                      value={selectedGroup}
                      onValueChange={setSelectedGroup}
                      disabled={
                        loadingMessages || sendingMessage || !isConnected
                      }
                    >
                      <SelectTrigger className="w-64">
                        <SelectValue placeholder="Select group" />
                      </SelectTrigger>
                      <SelectContent>
                        {groups.map((g) => (
                          <SelectItem key={g._id || g.id} value={g._id || g.id}>
                            {g.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedGroup && (
                    <div className="border rounded-lg h-96 flex flex-col">
                      {/* Messages Area */}
                      <ScrollArea className="flex-1 p-4">
                        <div className="space-y-4">
                          {loadingMessages ? (
                            <div className="flex justify-center items-center h-32">
                              <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                          ) : (messages[selectedGroup] || []).length === 0 ? (
                            <div className="flex flex-col justify-center items-center h-32 text-muted-foreground">
                              <MessageSquare className="h-8 w-8 opacity-50 mb-2" />
                              <p>No messages yet. Start the conversation!</p>
                            </div>
                          ) : (
                            (messages[selectedGroup] || []).map((msg, idx) => (
                              <div
                                key={msg._id || idx}
                                className={`flex items-start gap-2 ${
                                  msg.sender &&
                                  msg.sender._id === currentUser._id
                                    ? "justify-end"
                                    : "justify-start"
                                }`}
                              >
                                {!(
                                  msg.sender &&
                                  msg.sender._id === currentUser._id
                                ) && (
                                  <UserAvatar
                                    user={msg.sender}
                                    className="flex-shrink-0 h-6 w-6"
                                  />
                                )}
                                <div
                                  className={`max-w-[80%] rounded-lg p-2 text-sm ${
                                    msg.sender &&
                                    msg.sender._id === currentUser._id
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-muted"
                                  }`}
                                >
                                  <div className="font-medium text-xs mb-1">
                                    {msg.sender?.name || "Unknown"}
                                  </div>
                                  <p className="text-xs">{msg.message}</p>
                                  <div className="text-xs opacity-70 mt-1 flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {new Date(msg.timestamp).toLocaleTimeString(
                                      [],
                                      {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      }
                                    )}
                                  </div>
                                </div>
                                {msg.sender &&
                                  msg.sender._id === currentUser._id && (
                                    <UserAvatar
                                      user={currentUser}
                                      className="flex-shrink-0 h-6 w-6"
                                    />
                                  )}
                              </div>
                            ))
                          )}
                          <div ref={messagesEndRef} />
                        </div>
                      </ScrollArea>

                      {/* Typing indicator */}
                      {getTypingUsers(selectedGroup).length > 0 && (
                        <div className="px-4 py-1 text-xs text-muted-foreground">
                          <Loader2 className="h-3 w-3 animate-spin inline mr-1" />
                          {getTypingUsers(selectedGroup).join(", ")}{" "}
                          {getTypingUsers(selectedGroup).length > 1
                            ? "are"
                            : "is"}{" "}
                          typing...
                        </div>
                      )}

                      {/* Online users */}
                      {getOnlineUsersInGroup(selectedGroup).length > 0 && (
                        <div className="px-4 py-1 text-xs text-muted-foreground flex items-center flex-wrap gap-x-2">
                          <CircleDot className="h-3 w-3 mr-1 text-green-500" />
                          Online:
                          {getOnlineUsersInGroup(selectedGroup).map((u) => (
                            <Badge
                              key={u.id}
                              variant="outline"
                              className="flex items-center gap-1"
                            >
                              <UserIcon className="h-3 w-3" />
                              {u.name}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Message Input */}
                      <form
                        onSubmit={(e) => handleSend(e, selectedGroup)}
                        className="p-4 border-t"
                      >
                        <div className="flex gap-2">
                          <Input
                            value={message}
                            onChange={(e) =>
                              handleMessageInputChange(e, selectedGroup)
                            }
                            placeholder={
                              !isConnected
                                ? "Connecting to chat..."
                                : "Type a message..."
                            }
                            disabled={sendingMessage}
                            className="flex-1"
                          />
                          <Button
                            type="submit"
                            disabled={!message.trim() || sendingMessage}
                          >
                            {sendingMessage ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        {!isConnected && (
                          <div className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Not connected to chat server. Messages will be saved
                            locally.
                          </div>
                        )}
                      </form>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="admin" className="space-y-4">
              <div className="border rounded-lg h-96 flex flex-col">
                {/* Messages Area */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {loadingMessages ? (
                      <div className="flex justify-center items-center h-32">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : (messages["admin"] || []).length === 0 ? (
                      <div className="flex flex-col justify-center items-center h-32 text-muted-foreground">
                        <MessageSquare className="h-8 w-8 opacity-50 mb-2" />
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      (messages["admin"] || []).map((msg, idx) => (
                        <div
                          key={msg._id || idx}
                          className={`flex items-start gap-2 ${
                            msg.sender && msg.sender._id === currentUser._id
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          {!(
                            msg.sender && msg.sender._id === currentUser._id
                          ) && (
                            <UserAvatar
                              user={msg.sender}
                              className="flex-shrink-0 h-6 w-6"
                            />
                          )}
                          <div
                            className={`max-w-[80%] rounded-lg p-2 text-sm ${
                              msg.sender && msg.sender._id === currentUser._id
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <div className="font-medium text-xs mb-1">
                              {msg.sender?.name || "Unknown"}
                            </div>
                            <p className="text-xs">{msg.message}</p>
                            <div className="text-xs opacity-70 mt-1 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(msg.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                          {msg.sender && msg.sender._id === currentUser._id && (
                            <UserAvatar
                              user={currentUser}
                              className="flex-shrink-0 h-6 w-6"
                            />
                          )}
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Typing indicator */}
                {getTypingUsers("admin").length > 0 && (
                  <div className="px-4 py-1 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin inline mr-1" />
                    {getTypingUsers("admin").join(", ")}{" "}
                    {getTypingUsers("admin").length > 1 ? "are" : "is"}{" "}
                    typing...
                  </div>
                )}

                {/* Message Input */}
                <form
                  onSubmit={(e) => handleSend(e, "admin")}
                  className="p-4 border-t"
                >
                  <div className="flex gap-2">
                    <Input
                      value={message}
                      onChange={(e) => handleMessageInputChange(e, "admin")}
                      placeholder={
                        !isConnected
                          ? "Connecting to chat..."
                          : "Type a message to admin support..."
                      }
                      disabled={sendingMessage}
                      className="flex-1"
                    />
                    <Button
                      type="submit"
                      disabled={!message.trim() || sendingMessage}
                    >
                      {sendingMessage ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {!isConnected && (
                    <div className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Not connected to chat server. Messages will be saved
                      locally.
                    </div>
                  )}
                </form>
              </div>
            </TabsContent>
          </Tabs>
        </ContentCard>
      </PageSection>
    </PageLayout>
  );
}
