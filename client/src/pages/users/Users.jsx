import { useEffect, useState } from "react";
import { userService } from "../../services/userService";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    userService
      .getAll()
      .then((data) => setUsers(data.users || data || []))
      .catch((err) =>
        setError(err.response?.data?.message || "Failed to load users")
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading users...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Users</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b text-left">Name</th>
              <th className="px-4 py-2 border-b text-left">Email</th>
              <th className="px-4 py-2 border-b text-left">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="text-center py-4 text-muted-foreground"
                >
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id || u._id} className="border-b">
                  <td className="px-4 py-2">{u.name}</td>
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2">{u.role}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
