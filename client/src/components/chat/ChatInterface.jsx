import React, { useState, useEffect, useRef } from "react";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";
import { chatService } from "../../services/chatService";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Pencil, Send, Shield, Users } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const ChatInterface = ({ selectedChannel, onMessageSent }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { socket, sendMessage } = useSocket();
  const { user, isAdmin, isOfficer } = useAuth();

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Join/leave group chat room when selected channel changes
  useEffect(() => {
    if (!socket || !selectedChannel) return;

    if (selectedChannel.type === "group") {
      socket.emit("join-group", { groupId: selectedChannel.groupId });
    }

    return () => {
      if (selectedChannel.type === "group") {
        socket.emit("leave-group", { groupId: selectedChannel.groupId });
      }
    };
  }, [socket, selectedChannel]);

  // Load messages when selected channel changes
  useEffect(() => {
    if (!selectedChannel) return;
    loadMessages();
    markMessagesAsRead();
  }, [selectedChannel]);

  // Listen for new messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data) => {
      if (
        selectedChannel &&
        ((selectedChannel.type === "admin" && data.chatType === "admin") ||
          (selectedChannel.type === "group" &&
            data.chatType === "group" &&
            data.message.groupId === selectedChannel.groupId))
      ) {
        setMessages((prev) => [...prev, data.message]);
        markMessagesAsRead();
      }
    };

    socket.on("new_message", handleNewMessage);

    return () => {
      socket.off("new_message", handleNewMessage);
    };
  }, [socket, selectedChannel]);

  const loadMessages = async () => {
    if (!selectedChannel) return;

    setLoading(true);
    try {
      const response = await chatService.getChatMessages({
        chatId: selectedChannel.id,
        chatType: selectedChannel.type,
        groupId: selectedChannel.groupId,
      });
      setMessages(response.data.data || []);
    } catch (error) {
      console.error("Failed to load messages:", error);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    if (!selectedChannel) return;
    
    try {
      const result = await chatService.markAsRead({
        chatId: selectedChannel.id,
        chatType: selectedChannel.type,
        groupId: selectedChannel.groupId,
      });
    } catch (error) {
      console.error("Failed to mark messages as read:", error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChannel) return;

    // Create a temporary message for optimistic UI update
    const tempId = `temp-${Date.now()}`;
    const tempMessage = {
      id: tempId,
      content: newMessage,
      sender: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
      },
      chatId: selectedChannel.id,
      chatType: selectedChannel.type,
      groupId: selectedChannel.groupId,
      createdAt: new Date().toISOString(),
      isTemp: true,
    };

    // Add temporary message to the UI
    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage("");

    try {
      // Send the actual message
      await sendMessage({
        content: newMessage,
        chatId: selectedChannel.id,
        chatType: selectedChannel.type,
        groupId: selectedChannel.groupId,
      });
      
      // Notify parent component that a message was sent
      if (onMessageSent) onMessageSent();
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
      
      // Remove the temporary message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
    }
  };

  const getChannelIcon = (type) => {
    switch (type) {
      case "admin":
        return <Shield className="h-4 w-4" />;
      case "group":
        return <Users className="h-4 w-4" />;
      default:
        return null;
    }
  };

  if (!selectedChannel) {
    return (
      <Card className="flex-1 flex items-center justify-center">
        <div className="text-center p-8">
          <h3 className="text-lg font-medium">Select a Channel</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Choose a channel from the sidebar to start messaging
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex-1 flex flex-col">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          {getChannelIcon(selectedChannel.type)}
          {selectedChannel.name}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 p-0 flex flex-col">
        <ScrollArea className="flex-1 p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="bg-muted rounded-full p-3 mb-4">
                {selectedChannel.type === "admin" ? (
                  <Shield className="h-6 w-6 text-blue-600" />
                ) : (
                  <Users className="h-6 w-6 text-green-600" />
                )}
              </div>
              <h3 className="text-lg font-medium">No messages yet</h3>
              <p className="text-sm text-muted-foreground mt-2">
                {selectedChannel.type === "admin"
                  ? "Start a conversation with admin support"
                  : "Start a conversation in this group"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                const isCurrentUser = message.sender.id === user.id;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isCurrentUser ? "justify-end" : ""}`}
                  >
                    <div
                      className={`flex gap-3 max-w-[80%] ${
                        isCurrentUser ? "flex-row-reverse" : ""
                      }`}
                    >
                      <Avatar>
                        <AvatarImage src={message.sender.avatar} />
                        <AvatarFallback>
                          {message.sender.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div
                          className={`rounded-lg p-3 ${
                            message.isTemp
                              ? "bg-muted text-muted-foreground"
                              : isCurrentUser
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          {message.content}
                          {message.edited && (
                            <span className="text-xs ml-2 opacity-70">(edited)</span>
                          )}
                        </div>
                        <div
                          className={`flex text-xs text-muted-foreground mt-1 ${
                            isCurrentUser ? "justify-end" : ""
                          }`}
                        >
                          <span>{message.sender.name}</span>
                          <span className="mx-1">•</span>
                          <span>
                            {message.createdAt
                              ? format(new Date(message.createdAt), "p")
                              : "Now"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        <div className="p-4 border-t">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button type="submit" disabled={!newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatInterface;
