import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { groupService } from "../../services/api";
import { Card } from "../../components/ui/card";
import { toast } from "sonner";

export default function GroupDetail() {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    groupService
      .getGroupById(id)
      .then((data) => setGroup(data.group))
      .catch(() => toast.error("Failed to load group"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!group) return <div>Group not found.</div>;

  return (
    <Card className="p-6">
      <h1 className="text-2xl font-bold mb-2">{group.name}</h1>
      <div className="mb-2 text-muted-foreground">{group.description}</div>
      <div className="text-sm">
        Created: {new Date(group.createdAt).toLocaleDateString()}
      </div>
      {/* Add more group details as needed */}
    </Card>
  );
}
