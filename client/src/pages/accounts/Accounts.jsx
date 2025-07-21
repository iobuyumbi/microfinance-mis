import { useEffect, useState } from "react";
import { accountService } from "../../services/api";
import Table from "../../components/Table";
import { toast } from "sonner";

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    accountService
      .getAllAccounts()
      .then((data) => setAccounts(data.accounts || []))
      .catch(() => toast.error("Failed to load accounts"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Accounts</h1>
      <Table
        columns={[
          { key: "owner", label: "Owner" },
          { key: "balance", label: "Balance" },
          { key: "createdAt", label: "Date" },
        ]}
        data={accounts}
      />
    </div>
  );
}
