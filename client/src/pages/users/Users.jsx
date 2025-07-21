import { useEffect, useState } from "react";
import { userService } from "../../services/api";
import Table from "../../components/Table";
import { toast } from "sonner";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userService
      .getAllUsers()
      .then((data) => setUsers(data.users || []))
      .catch(() => toast.error("Failed to load users"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Users</h1>
      <Table
        columns={[
          { key: "name", label: "Name" },
          { key: "email", label: "Email" },
          { key: "role", label: "Role" },
        ]}
        data={users}
      />
    </div>
  );
}
