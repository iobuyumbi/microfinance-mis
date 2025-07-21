import { useEffect, useState } from "react";
import { reportService } from "../../services/reportService";

export default function Reports() {
  const [summary, setSummary] = useState(null);
  const [defaulters, setDefaulters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      reportService.getFinancialSummary(),
      reportService.getDefaulters(),
      reportService.getTotalLoans(),
      reportService.getGroupSavings(),
    ])
      .then(([financial, defaultersData, loans, savings]) => {
        setSummary({
          totalLoans: loans?.total || 0,
          totalSavings:
            savings?.data?.reduce?.(
              (sum, g) => sum + (g.totalSavings || 0),
              0
            ) || 0,
          totalPaid: financial?.totalPaid || 0,
          totalOutstanding: financial?.totalOutstanding || 0,
        });
        setDefaulters(defaultersData?.data || []);
      })
      .catch((err) =>
        setError(err.response?.data?.message || "Failed to load reports")
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading reports...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Reports</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card rounded shadow p-6">
          <div className="text-muted-foreground text-sm mb-1">Total Loans</div>
          <div className="text-2xl font-bold">{summary.totalLoans}</div>
        </div>
        <div className="bg-card rounded shadow p-6">
          <div className="text-muted-foreground text-sm mb-1">
            Total Savings
          </div>
          <div className="text-2xl font-bold">{summary.totalSavings}</div>
        </div>
        <div className="bg-card rounded shadow p-6">
          <div className="text-muted-foreground text-sm mb-1">Defaulters</div>
          <div className="text-2xl font-bold">{defaulters.length}</div>
        </div>
      </div>
      <div className="bg-card rounded shadow p-6">
        <div className="text-lg font-semibold mb-2">Defaulters List</div>
        {defaulters.length === 0 ? (
          <div className="text-muted-foreground">No defaulters found.</div>
        ) : (
          <ul className="list-disc pl-6 space-y-1">
            {defaulters.map((d) => (
              <li key={d._id || d.id}>
                {d.borrower?.name || d.borrower || "-"}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
