import { useState } from "react";

export default function LoanForm({
  initialValues = {},
  onSubmit,
  onCancel,
  loading,
}) {
  const [form, setForm] = useState({
    borrower: initialValues.borrower || "",
    amount: initialValues.amount || "",
    status: initialValues.status || "pending",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.borrower || !form.amount || !form.status) {
      setError("All fields are required.");
      return;
    }
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err.message || "Failed to save loan");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="borrower">
          Borrower
        </label>
        <input
          id="borrower"
          name="borrower"
          type="text"
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
          value={form.borrower}
          onChange={handleChange}
          disabled={loading}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="amount">
          Amount
        </label>
        <input
          id="amount"
          name="amount"
          type="number"
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
          value={form.amount}
          onChange={handleChange}
          disabled={loading}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="status">
          Status
        </label>
        <select
          id="status"
          name="status"
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
          value={form.status}
          onChange={handleChange}
          disabled={loading}
          required
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      <div className="flex gap-2 justify-end">
        {onCancel && (
          <button
            type="button"
            className="px-4 py-2 rounded bg-muted"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 rounded bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
