import React, { useState, useEffect, useRef } from "react";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ScrollArea } from "../ui/scroll-area";
import { Send, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { chatService } from "../../services/chatService";

const ChatInterface = ({ selectedChannel }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { socket } = useSocket();
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Join/leave room on channel change for group chats
  useEffect(() => {
    if (!socket) return;
    let prevGroupId;

    if (selectedChannel?.type === "group" && selectedChannel.groupId) {
      socket.emit("join-group", { groupId: selectedChannel.groupId });
      prevGroupId = selectedChannel.groupId;
    }

    return () => {
      if (socket && prevGroupId) {
        socket.emit("leave-group", { groupId: prevGroupId });
      }
    };
  }, [socket, selectedChannel]);

  useEffect(() => {
    if (!selectedChannel) return;
    loadMessages();
  }, [selectedChannel]);

  useEffect(() => {
    if (!socket) return;

    socket.on("new_message", handleNewMessage);

    return () => {
      socket.off("new_message", handleNewMessage);
    };
  }, [socket, selectedChannel]);

  const loadMessages = async () => {
    if (!selectedChannel) return;

    setLoading(true);
    try {
      const params = {
        chatId: selectedChannel.id,
        chatType: selectedChannel.type,
      };
      if (selectedChannel.type === "group" && selectedChannel.groupId) {
        params.groupId = selectedChannel.groupId;
      }
      const response = await chatService.getChatMessages(params);
      setMessages(response.data.data || []);
    } catch (error) {
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const handleNewMessage = (data) => {
    if (data.chatId === selectedChannel?.id) {
      setMessages((prev) => [...prev, data.message]);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChannel) return;

    try {
      const payload = {
        content: newMessage.trim(),
        chatId: selectedChannel.id,
        chatType: selectedChannel.type,
      };
      if (selectedChannel.type === "group" && selectedChannel.groupId) {
        payload.groupId = selectedChannel.groupId;
      }
      await chatService.sendMessage(payload);
      setNewMessage("");
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!selectedChannel) {
    return (
      <Card className="flex-1">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Select a Channel</h3>
            <p className="text-muted-foreground">
              Choose a channel to start chatting
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex-1 flex flex-col">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          {selectedChannel.name}
        </CardTitle>
      </CardHeader>

      <div className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Loading messages...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`flex gap-3 ${
                    message.sender._id === user?.id ? "flex-row-reverse" : ""
                  }`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={message.sender.avatar} />
                    <AvatarFallback>
                      {message.sender.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>

                  <div
                    className={`flex-1 max-w-[70%] ${
                      message.sender._id === user?.id ? "text-right" : ""
                    }`}
                  >
                    <div
                      className={`inline-block p-3 rounded-lg ${
                        message.sender._id === user?.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <div className="mt-1">
                      <span className="text-xs text-muted-foreground">
                        {message.sender.name} •{" "}
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button onClick={sendMessage} disabled={!newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ChatInterface;
