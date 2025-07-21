import { useEffect, useState } from "react";
import { notificationService } from "../../services/notificationService";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    notificationService
      .getAll()
      .then((data) => setNotifications(data.notifications || data || []))
      .catch((err) =>
        setError(err.response?.data?.message || "Failed to load notifications")
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading notifications...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      {notifications.length === 0 ? (
        <div className="text-muted-foreground">No notifications found.</div>
      ) : (
        <ul className="space-y-4">
          {notifications.map((n) => (
            <li
              key={n.id || n._id}
              className={`p-4 rounded border shadow flex flex-col gap-1 ${
                n.read ? "bg-muted" : "bg-card"
              }`}
            >
              <div className="text-base">{n.message}</div>
              <div className="text-xs text-muted-foreground">
                {n.date ? new Date(n.date).toLocaleString() : "-"}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
