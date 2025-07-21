import { useState } from "react";

export default function MemberForm({
  initialValues = {},
  onSubmit,
  onCancel,
  loading,
}) {
  const [form, setForm] = useState({
    name: initialValues.name || "",
    email: initialValues.email || "",
    phone: initialValues.phone || "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.phone) {
      setError("All fields are required.");
      return;
    }
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err.message || "Failed to save member");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="name">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
          value={form.name}
          onChange={handleChange}
          disabled={loading}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
          value={form.email}
          onChange={handleChange}
          disabled={loading}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="phone">
          Phone
        </label>
        <input
          id="phone"
          name="phone"
          type="text"
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
          value={form.phone}
          onChange={handleChange}
          disabled={loading}
          required
        />
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
