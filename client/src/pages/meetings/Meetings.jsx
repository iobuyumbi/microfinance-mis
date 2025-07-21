import { useEffect, useState } from "react";
import { meetingService } from "../../services/api";
import Table from "../../components/Table";
import { toast } from "sonner";

export default function Meetings() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    meetingService
      .getAllMeetings()
      .then((data) => setMeetings(data.meetings || []))
      .catch(() => toast.error("Failed to load meetings"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Meetings</h1>
      <Table
        columns={[
          { key: "group", label: "Group" },
          { key: "date", label: "Date" },
          { key: "location", label: "Location" },
        ]}
        data={meetings}
      />
    </div>
  );
}
