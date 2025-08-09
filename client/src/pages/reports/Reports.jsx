import { useEffect, useState } from "react";
// import { reportService } from "../../services/reportService"; // Uncomment if dynamic

const STATIC_REPORTS = [
  { key: "summary", label: "Summary Report" },
  { key: "loans", label: "Loans Report" },
  { key: "savings", label: "Savings Report" },
  { key: "defaulters", label: "Defaulters Report" },
  { key: "transactions", label: "Transactions Report" },
];

export default function Reports() {
  // For future dynamic fetching:
  // const [reports, setReports] = useState([]);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState("");

  // useEffect(() => {
  //   reportService.getAll()
  //     .then((data) => setReports(data.reports || data || []))
  //     .catch((err) => setError(err.response?.data?.message || "Failed to load reports"))
  //     .finally(() => setLoading(false));
  // }, []);

  // For now, use static reports:
  const [loading] = useState(false);
  const [error] = useState("");
  const reports = STATIC_REPORTS;

  if (loading) return <div>Loading reports...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Reports</h1>
      {reports.length === 0 ? (
        <div className="text-muted-foreground">No reports available.</div>
      ) : (
        <ul className="space-y-4">
          {reports.map((r) => (
            <li
              key={r.key}
              className="p-4 rounded border shadow flex items-center justify-between bg-card"
            >
              <span className="font-medium">{r.label}</span>
              <button
                className="bg-primary text-primary-foreground px-4 py-2 rounded font-semibold hover:bg-primary/90 transition text-sm"
                disabled
                title="Coming soon"
              >
                View
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
