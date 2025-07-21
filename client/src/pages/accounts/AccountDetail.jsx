import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { accountService } from "../../services/api";
import { Card } from "../../components/ui/card";
import { toast } from "sonner";

export default function AccountDetail() {
  const { id } = useParams();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    accountService
      .getAccountById(id)
      .then((data) => setAccount(data.account))
      .catch(() => toast.error("Failed to load account"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!account) return <div>Account not found.</div>;

  return (
    <Card className="p-6">
      <h1 className="text-2xl font-bold mb-2">
        Account for {account.owner?.name || "N/A"}
      </h1>
      <div className="mb-2 text-muted-foreground">
        Balance: ${account.balance}
      </div>
      <div className="text-sm">
        Created: {new Date(account.createdAt).toLocaleDateString()}
      </div>
      {/* Add more account details as needed */}
    </Card>
  );
}
