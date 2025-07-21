import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { groupService } from "../../services/api";
import { Card, CardHeader, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { toast } from "sonner";

export default function GroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroup();
    // eslint-disable-next-line
  }, [id]);

  const fetchGroup = async () => {
    setLoading(true);
    try {
      const data = await groupService.getGroupById(id);
      setGroup(data.group || data);
    } catch (error) {
      toast.error("Failed to load group");
      navigate("/groups");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (!group) {
    return (
      <div className="text-center text-muted-foreground">Group not found.</div>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <h2 className="text-xl font-bold">{group.name}</h2>
        <Button variant="outline" onClick={() => navigate("/groups")}>
          Back to Groups
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <span className="font-semibold">Description:</span>{" "}
          {group.description || "N/A"}
        </div>
        <div>
          <span className="font-semibold">Meeting Day:</span> {group.meetingDay}
        </div>
        <div>
          <span className="font-semibold">Meeting Time:</span>{" "}
          {group.meetingTime}
        </div>
        <div>
          <span className="font-semibold">Max Members:</span> {group.maxMembers}
        </div>
        <div>
          <span className="font-semibold">Status:</span>{" "}
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              group.status === "active"
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
            }`}
          >
            {group.status?.charAt(0).toUpperCase() + group.status?.slice(1)}
          </span>
        </div>
        <div>
          <span className="font-semibold">Members:</span>
          <ul className="list-disc ml-6 mt-1">
            {group.members && group.members.length > 0 ? (
              group.members.map((member) => (
                <li key={member._id || member.id}>
                  {member.name || member.email}
                </li>
              ))
            ) : (
              <li>No members yet.</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
