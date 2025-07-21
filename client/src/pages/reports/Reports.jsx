import { useEffect, useState } from "react";
import { reportService } from "../../services/api";
import { Card } from "../../components/ui/card";
import { toast } from "sonner";

export default function Reports() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportService
      .getFinancialSummary()
      .then((data) => setSummary(data))
      .catch(() => toast.error("Failed to load reports"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!summary) return <div>No report data available.</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Reports</h1>
      <Card className="p-6">
        <div>Total Disbursed: ${summary.totalDisbursed?.toLocaleString()}</div>
        <div>Total Collected: ${summary.totalCollected?.toLocaleString()}</div>
        <div>
          Total Outstanding: ${summary.totalOutstanding?.toLocaleString()}
        </div>
        {/* Add more report details as needed */}
      </Card>
    </div>
  );
}
