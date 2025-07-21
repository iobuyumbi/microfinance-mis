import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { userService } from "../../services/api";
import { Card } from "../../components/ui/card";
import { toast } from "sonner";

export default function UserDetail() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userService
      .getUserById(id)
      .then((data) => setUser(data.user))
      .catch(() => toast.error("Failed to load user"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found.</div>;

  return (
    <Card className="p-6">
      <h1 className="text-2xl font-bold mb-2">{user.name}</h1>
      <div className="mb-2 text-muted-foreground">Email: {user.email}</div>
      <div className="text-sm">Role: {user.role}</div>
      {/* Add more user details as needed */}
    </Card>
  );
}
