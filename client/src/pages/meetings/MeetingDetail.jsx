import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { meetingService } from "../../services/api";
import { Card } from "../../components/ui/card";
import { toast } from "sonner";

export default function MeetingDetail() {
  const { id } = useParams();
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    meetingService
      .getMeetingById(id)
      .then((data) => setMeeting(data.meeting))
      .catch(() => toast.error("Failed to load meeting"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!meeting) return <div>Meeting not found.</div>;

  return (
    <Card className="p-6">
      <h1 className="text-2xl font-bold mb-2">
        Meeting for {meeting.group?.name || "N/A"}
      </h1>
      <div className="mb-2 text-muted-foreground">
        Location: {meeting.location}
      </div>
      <div className="text-sm">
        Date: {new Date(meeting.date).toLocaleDateString()}
      </div>
      {/* Add more meeting details as needed */}
    </Card>
  );
}
