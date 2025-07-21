import { useEffect, useState } from "react";
import { transactionService } from "../../services/transactionService";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    transactionService
      .getAll()
      .then((data) => setTransactions(data.transactions || data || []))
      .catch((err) =>
        setError(err.response?.data?.message || "Failed to load transactions")
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading transactions...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Transactions</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b text-left">Type</th>
              <th className="px-4 py-2 border-b text-left">Amount</th>
              <th className="px-4 py-2 border-b text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="text-center py-4 text-muted-foreground"
                >
                  No transactions found.
                </td>
              </tr>
            ) : (
              transactions.map((t) => (
                <tr key={t.id || t._id} className="border-b">
                  <td className="px-4 py-2">{t.type}</td>
                  <td className="px-4 py-2">{t.amount}</td>
                  <td className="px-4 py-2">
                    {t.date ? new Date(t.date).toLocaleDateString() : "-"}
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
