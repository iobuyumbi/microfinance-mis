import React, { useState, useEffect } from "react";
import ChatSidebar from "../components/chat/ChatSidebar";
import ChatInterface from "../components/chat/ChatInterface";
import { useSocket } from "../context/SocketContext";
import { chatService } from "../services/chatService";
import { toast } from "sonner";

const ChatPage = () => {
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(false);
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    loadChannels();
  }, []);

  useEffect(() => {
    if (!socket) return;

    // Listen for new messages to update unread counts
    socket.on("new_message", handleNewMessage);
    
    // Listen for channel updates
    socket.on("channel_updated", handleChannelUpdate);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("channel_updated", handleChannelUpdate);
    };
  }, [socket, channels]);

  const loadChannels = async () => {
    setLoading(true);
    try {
      const response = await chatService.getChatChannels();
      setChannels(response.data.data || []);
    } catch (error) {
      console.error("Failed to load channels:", error);
      toast.error("Failed to load channels");
    } finally {
      setLoading(false);
    }
  };

  const handleNewMessage = (data) => {
    // Update unread count for the channel if it's not the selected one
    if (data.chatId !== selectedChannel?.id) {
      setChannels(prev => 
        prev.map(channel => 
          channel.id === data.chatId 
            ? { ...channel, unreadCount: (channel.unreadCount || 0) + 1 }
            : channel
        )
      );
    }
  };

  const handleChannelUpdate = (data) => {
    // Update channel data when server sends updates
    setChannels(prev => 
      prev.map(channel => 
        channel.id === data.id ? { ...channel, ...data } : channel
      )
    );
  };

  const handleChannelSelect = (channel) => {
    setSelectedChannel(channel);
    
    // Reset unread count when selecting a channel
    if (channel.unreadCount > 0) {
      setChannels(prev => 
        prev.map(c => 
          c.id === channel.id ? { ...c, unreadCount: 0 } : c
        )
      );
    }
  };

  return (
    <div className="flex h-full gap-4">
      <ChatSidebar
        selectedChannel={selectedChannel}
        onChannelSelect={handleChannelSelect}
        channels={channels}
        loading={loading}
      />
      <ChatInterface 
        selectedChannel={selectedChannel} 
        onMessageSent={loadChannels}
      />
    </div>
  );
};

export default ChatPage;
