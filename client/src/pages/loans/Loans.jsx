import { useEffect, useState } from "react";
import { loanService } from "../../services/loanService";

export default function Loans() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loanService
      .getAll()
      .then((data) => setLoans(data.loans || data || []))
      .catch((err) =>
        setError(err.response?.data?.message || "Failed to load loans")
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading loans...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Loans</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b text-left">Borrower</th>
              <th className="px-4 py-2 border-b text-left">Amount</th>
              <th className="px-4 py-2 border-b text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {loans.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="text-center py-4 text-muted-foreground"
                >
                  No loans found.
                </td>
              </tr>
            ) : (
              loans.map((l) => (
                <tr key={l.id || l._id} className="border-b">
                  <td className="px-4 py-2">
                    {l.borrower?.name || l.borrower || "-"}
                  </td>
                  <td className="px-4 py-2">{l.amount}</td>
                  <td className="px-4 py-2">{l.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
