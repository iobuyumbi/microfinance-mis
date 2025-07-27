import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
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
} from "../components/ui";
import api from "@/services/api";

export default function Chat() {
  const { user, groups } = useAuth();
  const isStaff =
    user &&
    (user.role === "admin" ||
      user.role === "officer" ||
      user.role === "leader");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (groups.length > 0 && !selectedGroup) {
      setSelectedGroup(groups[0]._id || groups[0].id);
    }
  }, [groups, selectedGroup]);

  useEffect(() => {
    if (!selectedGroup) return;
    setLoading(true);
    api
      .get(`/groups/${selectedGroup}/chats`)
      .then((res) => setMessages(res.data.data || []))
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  }, [selectedGroup]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedGroup) return;
    try {
      setLoading(true);
      const res = await api.post(`/groups/${selectedGroup}/chats`, { message });
      setMessages((prev) => [...prev, res.data.data]);
      setMessage("");
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Group Chat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Label htmlFor="group">Group</Label>
            <Select
              value={selectedGroup}
              onValueChange={setSelectedGroup}
              id="group"
              className="mb-2"
            >
              <SelectTrigger>
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
          <div className="h-64 overflow-y-auto bg-gray-50 rounded p-2 mb-4">
            {loading ? (
              <div>Loading...</div>
            ) : (
              messages.map((msg, idx) => (
                <div key={msg._id || idx} className="mb-2">
                  <span className="font-semibold mr-2">
                    {msg.sender?.name || "User"}:
                  </span>
                  <span>{msg.message}</span>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSend} className="flex space-x-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              disabled={!selectedGroup || loading}
            />
            <Button
              type="submit"
              disabled={!selectedGroup || loading || !message.trim()}
            >
              Send
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
