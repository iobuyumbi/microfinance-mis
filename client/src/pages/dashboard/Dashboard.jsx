import { useEffect, useState } from "react";
import { reportService } from "../../services/reportService";
import { memberService } from "../../services/memberService";
import { loanService } from "../../services/loanService";
import { savingsService } from "../../services/savingsService";
import { transactionService } from "../../services/transactionService";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      memberService.getAll(),
      loanService.getAll(),
      savingsService.getAll(),
      reportService.getFinancialSummary(),
      transactionService.getAll({ limit: 5 }),
    ])
      .then(([members, loans, savings, financial, txs]) => {
        setStats({
          totalMembers: (members.members || members || []).length,
          totalLoans: (loans.loans || loans || []).length,
          totalSavings: (savings.savings || savings || []).reduce(
            (sum, s) => sum + (s.amount || 0),
            0
          ),
          totalPaid: financial?.totalPaid || 0,
        });
        setTransactions(txs.transactions || txs || []);
      })
      .catch((err) =>
        setError(err.response?.data?.message || "Failed to load dashboard")
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-card rounded shadow p-6">
          <div className="text-muted-foreground text-sm mb-1">
            Total Members
          </div>
          <div className="text-2xl font-bold">{stats.totalMembers}</div>
        </div>
        <div className="bg-card rounded shadow p-6">
          <div className="text-muted-foreground text-sm mb-1">Total Loans</div>
          <div className="text-2xl font-bold">{stats.totalLoans}</div>
        </div>
        <div className="bg-card rounded shadow p-6">
          <div className="text-muted-foreground text-sm mb-1">
            Total Savings
          </div>
          <div className="text-2xl font-bold">{stats.totalSavings}</div>
        </div>
        <div className="bg-card rounded shadow p-6">
          <div className="text-muted-foreground text-sm mb-1">Total Paid</div>
          <div className="text-2xl font-bold">{stats.totalPaid}</div>
        </div>
      </div>
      <div className="bg-card rounded shadow p-6">
        <div className="text-lg font-semibold mb-2">Recent Transactions</div>
        {transactions.length === 0 ? (
          <div className="text-muted-foreground">No recent transactions.</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Amount</th>
                <th className="px-4 py-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id || t._id} className="border-b">
                  <td className="px-4 py-2">{t.type}</td>
                  <td className="px-4 py-2">{t.amount}</td>
                  <td className="px-4 py-2">
                    {t.date ? new Date(t.date).toLocaleDateString() : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
