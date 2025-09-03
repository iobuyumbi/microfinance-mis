import React from "react";
import { Users, MessageCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { ScrollArea } from "../ui/scroll-area";
import ChatInterface from "../chat/ChatInterface";

const GroupChat = ({ chatChannel, group }) => {
  const getMemberInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (!chatChannel) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Chat Not Available</h3>
          <p className="text-muted-foreground text-center max-w-md mb-4">
            The chat channel for this group is not available. This could be because
            the group is inactive or the chat feature has not been set up for this
            group.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="min-h-[600px] rounded-lg border flex flex-col md:flex-row">
      <div className="flex-1">
        <ChatInterface selectedChannel={chatChannel} />
      </div>
      <div className="w-full md:w-64 border-l">
        <Card className="h-full rounded-none border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Group Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-4">
                {group.members && group.members.length > 0 ? (
                  group.members.map((member) => (
                    <div
                      key={member._id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition"
                    >
                      <Avatar>
                        <AvatarFallback>
                          {getMemberInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium leading-none">
                          {member.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {member.role || "Member"}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No members in this group
                  </p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GroupChat;