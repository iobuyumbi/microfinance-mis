import { useEffect, useState } from "react";
import { savingsService } from "../../services/api";
import Table from "../../components/Table";
import { toast } from "sonner";

export default function Savings() {
  const [savings, setSavings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    savingsService
      .getAllSavings()
      .then((data) => setSavings(data.savings || []))
      .catch(() => toast.error("Failed to load savings"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Savings</h1>
      <Table
        columns={[
          { key: "member", label: "Member" },
          { key: "amount", label: "Amount" },
          { key: "createdAt", label: "Date" },
        ]}
        data={savings}
      />
    </div>
  );
}
