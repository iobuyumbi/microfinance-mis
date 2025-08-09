import React, { useState } from "react";
import ChatSidebar from "../components/chat/ChatSidebar";
import ChatInterface from "../components/chat/ChatInterface";

const ChatPage = () => {
  const [selectedChannel, setSelectedChannel] = useState(null);

  const handleChannelSelect = (channel) => {
    setSelectedChannel(channel);
  };

  return (
    <div className="flex h-full gap-4">
      <ChatSidebar
        selectedChannel={selectedChannel}
        onChannelSelect={handleChannelSelect}
      />
      <ChatInterface selectedChannel={selectedChannel} />
    </div>
  );
};

export default ChatPage;
