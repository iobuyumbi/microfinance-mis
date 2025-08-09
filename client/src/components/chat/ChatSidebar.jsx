import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { MessageCircle, Search, Plus, Users, Shield } from "lucide-react";
import { toast } from "sonner";
import { chatService } from "../../services/chatService";

const ChatSidebar = ({ selectedChannel, onChannelSelect }) => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    loadChannels();
  }, []);

  const loadChannels = async () => {
    setLoading(true);
    try {
      const response = await chatService.getChatChannels();
      setChannels(response.data.data || []);
    } catch (error) {
      toast.error("Failed to load channels");
    } finally {
      setLoading(false);
    }
  };

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getChannelIcon = (type) => {
    switch (type) {
      case "admin":
        return <Shield className="h-4 w-4" />;
      case "group":
        return <Users className="h-4 w-4" />;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getChannelColor = (type) => {
    switch (type) {
      case "admin":
        return "text-blue-600";
      case "group":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <Card className="w-80 flex flex-col">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Messages
          </span>
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </CardTitle>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search channels..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full">
          {loading ? (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {filteredChannels.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No channels found</p>
                </div>
              ) : (
                filteredChannels.map((channel) => (
                  <div
                    key={channel.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedChannel?.id === channel.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => onChannelSelect(channel)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`${getChannelColor(channel.type)}`}>
                          {getChannelIcon(channel.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{channel.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {channel.description}
                          </p>
                        </div>
                      </div>
                      {channel.unreadCount > 0 && (
                        <Badge variant="destructive" className="ml-2">
                          {channel.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ChatSidebar;
