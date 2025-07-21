import { useEffect, useState } from "react";
import { meetingService } from "../../services/meetingService";

export default function Meetings() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    meetingService
      .getAll()
      .then((data) => setMeetings(data.meetings || data || []))
      .catch((err) =>
        setError(err.response?.data?.message || "Failed to load meetings")
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading meetings...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Meetings</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b text-left">Group</th>
              <th className="px-4 py-2 border-b text-left">Date</th>
              <th className="px-4 py-2 border-b text-left">Location</th>
            </tr>
          </thead>
          <tbody>
            {meetings.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="text-center py-4 text-muted-foreground"
                >
                  No meetings found.
                </td>
              </tr>
            ) : (
              meetings.map((m) => (
                <tr key={m.id || m._id} className="border-b">
                  <td className="px-4 py-2">
                    {m.group?.name || m.group || "-"}
                  </td>
                  <td className="px-4 py-2">
                    {m.date ? new Date(m.date).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-4 py-2">{m.location}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
