import { useEffect, useState } from "react";
import { savingsService } from "../../services/savingsService";

export default function Savings() {
  const [savings, setSavings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    savingsService
      .getAll()
      .then((data) => setSavings(data.savings || data || []))
      .catch((err) =>
        setError(err.response?.data?.message || "Failed to load savings")
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading savings...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Savings</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b text-left">Member</th>
              <th className="px-4 py-2 border-b text-left">Amount</th>
              <th className="px-4 py-2 border-b text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {savings.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="text-center py-4 text-muted-foreground"
                >
                  No savings found.
                </td>
              </tr>
            ) : (
              savings.map((s) => (
                <tr key={s.id || s._id} className="border-b">
                  <td className="px-4 py-2">
                    {s.member?.name || s.member || "-"}
                  </td>
                  <td className="px-4 py-2">{s.amount}</td>
                  <td className="px-4 py-2">
                    {s.date ? new Date(s.date).toLocaleDateString() : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
