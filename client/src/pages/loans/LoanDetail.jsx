import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { loanService } from "../../services/api";
import { Card } from "../../components/ui/card";
import { toast } from "sonner";

export default function LoanDetail() {
  const { id } = useParams();
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loanService
      .getLoanById(id)
      .then((data) => setLoan(data.loan))
      .catch(() => toast.error("Failed to load loan"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!loan) return <div>Loan not found.</div>;

  return (
    <Card className="p-6">
      <h1 className="text-2xl font-bold mb-2">
        Loan for {loan.borrower?.name || "N/A"}
      </h1>
      <div className="mb-2 text-muted-foreground">Status: {loan.status}</div>
      <div className="text-sm">Amount Requested: ${loan.amountRequested}</div>
      <div className="text-sm">Amount Approved: ${loan.amountApproved}</div>
      <div className="text-sm">Interest Rate: {loan.interestRate}%</div>
      <div className="text-sm">Loan Term: {loan.loanTerm} months</div>
      {/* Add more loan details as needed */}
    </Card>
  );
}
