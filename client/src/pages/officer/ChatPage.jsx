import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send } from "lucide-react";

const OfficerChatPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Client Support</h1>
        <p className="text-muted-foreground">Chat with clients</p>
      </div>

      <Card className="h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle>Support Chat</CardTitle>
          <CardDescription>Client support chat room</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <div className="flex-1 bg-gray-50 rounded-lg p-4 mb-4">
            <div className="text-center text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-2" />
              <p>Chat messages will appear here</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Input placeholder="Type your message..." />
            <Button>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OfficerChatPage; 