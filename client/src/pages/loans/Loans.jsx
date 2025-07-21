import { useEffect, useState } from "react";
import { loanService } from "../../services/api";
import Table from "../../components/Table";
import { toast } from "sonner";

export default function Loans() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loanService
      .getAllLoans()
      .then((data) => setLoans(data.loans || []))
      .catch(() => toast.error("Failed to load loans"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Loans</h1>
      <Table
        columns={[
          { key: "borrower", label: "Borrower" },
          { key: "amountRequested", label: "Requested" },
          { key: "status", label: "Status" },
        ]}
        data={loans}
      />
    </div>
  );
}
