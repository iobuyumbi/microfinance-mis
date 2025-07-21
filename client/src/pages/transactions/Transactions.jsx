import { useEffect, useState } from "react";
import { transactionService } from "../../services/api";
import Table from "../../components/Table";
import { toast } from "sonner";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    transactionService
      .getAllTransactions()
      .then((data) => setTransactions(data.transactions || []))
      .catch(() => toast.error("Failed to load transactions"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Transactions</h1>
      <Table
        columns={[
          { key: "type", label: "Type" },
          { key: "amount", label: "Amount" },
          { key: "createdAt", label: "Date" },
        ]}
        data={transactions}
      />
    </div>
  );
}
