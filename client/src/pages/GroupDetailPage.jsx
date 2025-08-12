import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { groupService } from "../services/groupService";
import { chatService } from "../services/chatService";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { ScrollArea } from "../components/ui/scroll-area";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "../components/ui/resizable";
import ChatInterface from "../components/chat/ChatInterface";
import {
  Building2,
  Users,
  PiggyBank,
  DollarSign,
  Calendar,
  MessageCircle,
  ArrowLeft,
  UserPlus,
  Settings,
} from "lucide-react";

const GroupDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { joinGroup, leaveGroup } = useSocket();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatChannel, setChatChannel] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadGroupDetails();

    // Join the group chat when component mounts
    if (id) {
      joinGroup(id);
    }

    // Leave the group chat when component unmounts
    return () => {
      if (id) {
        leaveGroup(id);
      }
    };
  }, [id]);

  const loadGroupDetails = async () => {
    setLoading(true);
    try {
      const response = await groupService.getById(id);
      setGroup(response.data.data);

      // Load chat channel for this group
      const channelsResponse = await chatService.getChatChannels();
      const channels = channelsResponse.data.data || [];
      const groupChannel = channels.find(
        (channel) => channel.type === "group" && channel.groupId === id
      );

      if (groupChannel) {
        setChatChannel(groupChannel);
      }
    } catch (error) {
      toast.error("Failed to load group details");
      console.error("Error loading group details:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      active:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      inactive: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
      pending:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      dissolved: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };
    return statusColors[status] || statusColors.inactive;
  };

  const getMemberInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Group Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The group you're looking for doesn't exist or you don't have access.
        </p>
        <Button onClick={() => navigate("/groups")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Groups
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/groups")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{group.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={getStatusBadge(group.status)}>
                {group.status}
              </Badge>
              <span className="text-muted-foreground">{group.location}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <UserPlus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <Building2 className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="members">
            <Users className="mr-2 h-4 w-4" />
            Members
          </TabsTrigger>
          <TabsTrigger value="finances">
            <PiggyBank className="mr-2 h-4 w-4" />
            Finances
          </TabsTrigger>
          <TabsTrigger value="chat">
            <MessageCircle className="mr-2 h-4 w-4" />
            Group Chat
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Group Info */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Group Information
                </CardTitle>
                <CardDescription>
                  Details about this microfinance group
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Formation Date
                    </p>
                    <p className="font-medium">
                      {new Date(group.formationDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Leader</p>
                    <p className="font-medium">
                      {group.leader?.name || "Not assigned"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{group.location}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Members</p>
                    <p className="font-medium">{group.members?.length || 0}</p>
                  </div>
                </div>

                <div className="pt-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Description
                  </p>
                  <p>{group.description || "No description provided."}</p>
                </div>
              </CardContent>
            </Card>

            {/* Group Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PiggyBank className="h-5 w-5" />
                  Group Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <PiggyBank className="h-5 w-5 text-green-600" />
                    </div>
                    <span>Total Savings</span>
                  </div>
                  <span className="font-semibold">
                    ${group.totalSavings?.toFixed(2) || "0.00"}
                  </span>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-full">
                      <DollarSign className="h-5 w-5 text-orange-600" />
                    </div>
                    <span>Outstanding Loans</span>
                  </div>
                  <span className="font-semibold">
                    ${group.totalLoansOutstanding?.toFixed(2) || "0.00"}
                  </span>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <span>Next Meeting</span>
                  </div>
                  <span className="font-semibold">Not scheduled</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="members" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Group Members
                </CardTitle>
                <Button size="sm">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Member
                </Button>
              </div>
              <CardDescription>Manage members of this group</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {group.members && group.members.length > 0 ? (
                    group.members.map((member) => (
                      <div
                        key={member._id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {getMemberInitials(member.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {member.email}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge
                                variant="outline"
                                className="text-xs font-normal"
                              >
                                {member.roleInGroup || "Member"}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                Joined:{" "}
                                {new Date(
                                  member.joinedDate
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Members</h3>
                      <p className="text-muted-foreground mb-4">
                        This group doesn't have any members yet.
                      </p>
                      <Button>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add First Member
                      </Button>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="finances" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PiggyBank className="h-5 w-5" />
                Group Finances
              </CardTitle>
              <CardDescription>
                Financial overview of this group
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <PiggyBank className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Financial Management
                </h3>
                <p className="text-muted-foreground mb-4">
                  Track group savings, loans, and transactions.
                </p>
                <div className="flex items-center justify-center gap-4">
                  <Button variant="outline">
                    <PiggyBank className="mr-2 h-4 w-4" />
                    Manage Savings
                  </Button>
                  <Button variant="outline">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Manage Loans
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat" className="mt-6">
          {chatChannel ? (
            <ResizablePanelGroup
              direction="horizontal"
              className="min-h-[600px] rounded-lg border"
            >
              <ResizablePanel defaultSize={75}>
                <ChatInterface selectedChannel={chatChannel} />
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={25}>
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
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <Avatar>
                                <AvatarFallback>
                                  {getMemberInitials(member.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{member.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {member.roleInGroup || "Member"}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-muted-foreground">
                              No members found
                            </p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </ResizablePanel>
            </ResizablePanelGroup>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Chat Not Available
                </h3>
                <p className="text-muted-foreground text-center max-w-md mb-4">
                  The chat channel for this group is not available. This could
                  be because the group is inactive or the chat feature has not
                  been set up for this group.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GroupDetailPage;
