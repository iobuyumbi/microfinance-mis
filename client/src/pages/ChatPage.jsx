import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send,
  MessageSquare,
  Users,
  User,
  Search,
  MoreHorizontal,
  Phone,
  Video,
  Info,
  Paperclip,
  Smile,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useApi } from "@/hooks/useApi";
import { toast } from "sonner";

const ChatPage = () => {
  const { user: currentUser } = useAuth();
  const { getChatMessages, sendMessage, loading } = useApi();
  const [activeChat, setActiveChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    if (activeChat) {
      loadMessages(activeChat.id);
    }
  }, [activeChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChats = async () => {
    // Mock data for demonstration
    const mockChats = [
      {
        id: "admin-chat",
        name: "Admin Support",
        type: "admin",
        lastMessage: "How can I help you today?",
        lastMessageTime: "2 min ago",
        unreadCount: 0,
        isOnline: true,
      },
      {
        id: "group-1",
        name: "Group Alpha",
        type: "group",
        lastMessage: "Meeting scheduled for tomorrow",
        lastMessageTime: "1 hour ago",
        unreadCount: 2,
        isOnline: false,
      },
      {
        id: "user-1",
        name: "John Doe",
        type: "direct",
        lastMessage: "Loan application submitted",
        lastMessageTime: "3 hours ago",
        unreadCount: 0,
        isOnline: true,
      },
    ];
    setChats(mockChats);
  };

  const loadMessages = async (chatId) => {
    try {
      const result = await getChatMessages(chatId);
      if (result.success) {
        setMessages(result.data);
      } else {
        // Mock messages for demonstration
        const mockMessages = [
          {
            id: 1,
            content: "Hello! How can I help you today?",
            sender: { name: "Admin Support", avatar: null },
            timestamp: new Date(Date.now() - 60000),
            isOwn: false,
          },
          {
            id: 2,
            content: "I have a question about my loan application",
            sender: { name: currentUser?.name, avatar: currentUser?.avatar },
            timestamp: new Date(Date.now() - 30000),
            isOwn: true,
          },
          {
            id: 3,
            content: "Sure! What would you like to know?",
            sender: { name: "Admin Support", avatar: null },
            timestamp: new Date(),
            isOwn: false,
          },
        ];
        setMessages(mockMessages);
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeChat) return;

    try {
      const messageData = {
        content: newMessage,
        chatId: activeChat.id,
        chatType: activeChat.type,
      };

      const result = await sendMessage(activeChat.id, messageData);
      if (result.success) {
        // Add message to local state
        const newMsg = {
          id: Date.now(),
          content: newMessage,
          sender: { name: currentUser?.name, avatar: currentUser?.avatar },
          timestamp: new Date(),
          isOwn: true,
        };
        setMessages((prev) => [...prev, newMsg]);
        setNewMessage("");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-8rem)] flex">
      {/* Chat List */}
      <div className="w-80 border-r bg-white">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search chats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="p-2">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  activeChat?.id === chat.id
                    ? "bg-blue-50 border border-blue-200"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => setActiveChat(chat)}
              >
                <div className="relative">
                  <Avatar>
                    <AvatarImage src={chat.avatar} />
                    <AvatarFallback>
                      {chat.type === "group" ? (
                        <Users className="h-4 w-4" />
                      ) : (
                        chat.name.charAt(0)
                      )}
                    </AvatarFallback>
                  </Avatar>
                  {chat.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate">{chat.name}</p>
                    <span className="text-xs text-gray-500">
                      {chat.lastMessageTime}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500 truncate">
                      {chat.lastMessage}
                    </p>
                    {chat.unreadCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="h-5 w-5 rounded-full p-0 text-xs"
                      >
                        {chat.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={activeChat.avatar} />
                    <AvatarFallback>
                      {activeChat.type === "group" ? (
                        <Users className="h-4 w-4" />
                      ) : (
                        activeChat.name.charAt(0)
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{activeChat.name}</h3>
                    <p className="text-sm text-gray-500">
                      {activeChat.isOnline ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Info className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${message.isOwn ? "flex-row-reverse space-x-reverse" : ""}`}
                    >
                      {!message.isOwn && (
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={message.sender.avatar} />
                          <AvatarFallback className="text-xs">
                            {message.sender.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`px-4 py-2 rounded-lg ${
                          message.isOwn
                            ? "bg-blue-600 text-white"
                            : "bg-white border"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.isOwn ? "text-blue-100" : "text-gray-500"
                          }`}
                        >
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="bg-white border-t p-4">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <div className="flex-1 relative">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pr-10"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2"
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || loading}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select a chat
              </h3>
              <p className="text-gray-500">
                Choose a conversation to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
