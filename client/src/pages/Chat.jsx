import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/context/SocketContext';
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Label } from '../components/ui';

export default function Chat() {
  const { socket, onlineUsers, joinRoom, leaveRoom, sendUpdate } = useSocket();
  const [room, setRoom] = useState('global');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    joinRoom(room);
    socket.on('chat_message', handleReceiveMessage);
    return () => {
      leaveRoom(room);
      socket.off('chat_message', handleReceiveMessage);
    };
    // eslint-disable-next-line
  }, [room]);

  const handleReceiveMessage = (msg) => {
    setMessages((prev) => [...prev, msg]);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendUpdate('chat_message', { room, message });
    setMessages((prev) => [...prev, { sender: 'You', message }]);
    setMessage('');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Chat Room: {room}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Label htmlFor="room">Room</Label>
            <Input id="room" value={room} onChange={e => setRoom(e.target.value)} className="mb-2" />
            <div className="text-xs text-gray-500 mb-2">Online users: {onlineUsers.length}</div>
          </div>
          <div className="h-64 overflow-y-auto bg-gray-50 rounded p-2 mb-4">
            {messages.map((msg, idx) => (
              <div key={idx} className="mb-2">
                <span className="font-semibold mr-2">{msg.sender || 'User'}:</span>
                <span>{msg.message}</span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSend} className="flex space-x-2">
            <Input value={message} onChange={e => setMessage(e.target.value)} placeholder="Type a message..." />
            <Button type="submit">Send</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 