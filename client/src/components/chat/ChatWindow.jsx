import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageSquare,
  Send,
  Users,
  Loader2,
  Clock,
  CircleDot,
  X,
  Shield,
  User as UserIcon,
} from "lucide-react";
import { UserAvatar } from "@/components/custom/UserAvatar";
import { toast } from "sonner";

export default function ChatWindow({ onClose }) {
  const { user: currentUser, groups } = useAuth();
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

  const [selectedChat, setSelectedChat] = useState("admin"); // "admin" or group ID
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Chat options including admin chat and user's groups
  const chatOptions = [
    { id: "admin", name: "Admin Support", icon: Shield, type: "admin" },
    ...groups.map((group) => ({
      id: group._id || group.id,
      name: group.name,
      icon: Users,
      type: "group",
    })),
  ];

  // Set initial chat selection
  useEffect(() => {
    if (chatOptions.length > 0 && !selectedChat) {
      setSelectedChat(chatOptions[0].id);
    }
  }, [chatOptions, selectedChat]);

  // Handle joining and leaving chat rooms
  useEffect(() => {
    if (!currentUser || !selectedChat || !isConnected) return;

    const roomName =
      selectedChat === "admin" ? "admin_support" : `group_${selectedChat}`;
    joinRoom(roomName);

    // Set up real-time message listener
    const handleNewMessage = (newMessage) => {
      if (newMessage.chatId === selectedChat) {
        setMessages((prev) => [...prev, newMessage]);
      }
    };
    socket.on("chat_message", handleNewMessage);

    // Set up typing indicator listener
    const handleTypingUpdate = ({ userId, chatId, isTyping }) => {
      if (chatId === selectedChat && userId !== currentUser._id) {
        setTypingUsers((prev) => {
          if (isTyping && !prev.includes(userId)) {
            return [...prev, userId];
          } else if (!isTyping && prev.includes(userId)) {
            return prev.filter((id) => id !== userId);
          }
          return prev;
        });
      }
    };
    socket.on("typing_update", handleTypingUpdate);

    // Cleanup function
    return () => {
      leaveRoom(roomName);
      socket.off("chat_message", handleNewMessage);
      socket.off("typing_update", handleTypingUpdate);
    };
  }, [selectedChat, isConnected, currentUser, joinRoom, leaveRoom, socket]);

  // Fetch historical messages
  const fetchMessages = useCallback(async () => {
    if (!selectedChat) {
      setMessages([]);
      return;
    }

    setLoadingMessages(true);
    try {
      // Mock API call - replace with actual endpoint
      const mockMessages = [
        {
          _id: "1",
          message: "Welcome to the chat! How can we help you today?",
          sender: { _id: "admin", name: "Admin Support", avatar: null },
          timestamp: new Date(Date.now() - 60000).toISOString(),
          chatId: selectedChat,
        },
      ];
      setMessages(mockMessages);
    } catch (err) {
      toast.error("Failed to load messages.");
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }, [selectedChat]);

  useEffect(() => {
    fetchMessages();
  }, [selectedChat, fetchMessages]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage || !selectedChat || sendingMessage || !isConnected)
      return;

    setSendingMessage(true);
    stopTyping(
      selectedChat === "admin" ? "admin_support" : `group_${selectedChat}`
    );
    clearTimeout(typingTimeoutRef.current);

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
      chatId: selectedChat,
    };
    setMessages((prev) => [...prev, newMessage]);
    setMessage("");

    try {
      sendUpdate("chat_message", {
        chatId: selectedChat,
        message: trimmedMessage,
        senderId: currentUser._id,
        chatType: selectedChat === "admin" ? "admin" : "group",
      });
    } catch (err) {
      toast.error("Failed to send message.");
      setMessages((prev) => prev.filter((msg) => msg._id !== newMessage._id));
      setMessage(trimmedMessage);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleMessageInputChange = (e) => {
    setMessage(e.target.value);

    if (!selectedChat || !isConnected) return;

    if (e.target.value.length > 0) {
      if (!typingTimeoutRef.current) {
        startTyping(
          selectedChat === "admin" ? "admin_support" : `group_${selectedChat}`
        );
      }
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(
          selectedChat === "admin" ? "admin_support" : `group_${selectedChat}`
        );
        typingTimeoutRef.current = null;
      }, 3000);
    } else {
      stopTyping(
        selectedChat === "admin" ? "admin_support" : `group_${selectedChat}`
      );
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  const selectedChatOption = chatOptions.find(
    (option) => option.id === selectedChat
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          {selectedChatOption && (
            <>
              <selectedChatOption.icon className="h-4 w-4" />
              <span className="font-medium text-sm">
                {selectedChatOption.name}
              </span>
            </>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Chat Selector */}
      <div className="p-3 border-b">
        <Select value={selectedChat} onValueChange={setSelectedChat}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select chat" />
          </SelectTrigger>
          <SelectContent>
            {chatOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <SelectItem key={option.id} value={option.id}>
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-4 w-4" />
                    {option.name}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3">
        <div className="space-y-3">
          {loadingMessages ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-32 text-muted-foreground">
              <MessageSquare className="h-8 w-8 opacity-50 mb-2" />
              <p className="text-sm">
                No messages yet. Start the conversation!
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={msg._id || idx}
                className={`flex items-start gap-2 ${
                  msg.sender && msg.sender._id === currentUser._id
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                {!(msg.sender && msg.sender._id === currentUser._id) && (
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
      {typingUsers.length > 0 && (
        <div className="px-3 py-1 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin inline mr-1" />
          Someone is typing...
        </div>
      )}

      {/* Message Input */}
      <div className="p-3 border-t">
        <form onSubmit={handleSend} className="flex gap-2">
          <Input
            value={message}
            onChange={handleMessageInputChange}
            placeholder="Type a message..."
            disabled={!isConnected || sendingMessage}
            className="flex-1 text-sm"
          />
          <Button
            type="submit"
            size="sm"
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
