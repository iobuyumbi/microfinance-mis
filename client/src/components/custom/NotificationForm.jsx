import { useState } from "react";

export default function NotificationForm({
  initialValues = {},
  onSubmit,
  onCancel,
  loading,
}) {
  const [form, setForm] = useState({
    message: initialValues.message || "",
    date: initialValues.date ? initialValues.date.slice(0, 10) : "",
    read: initialValues.read || false,
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.message || !form.date) {
      setError("Message and date are required.");
      return;
    }
    try {
      await onSubmit({ ...form, date: new Date(form.date).toISOString() });
    } catch (err) {
      setError(err.message || "Failed to save notification");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="message">
          Message
        </label>
        <input
          id="message"
          name="message"
          type="text"
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
          value={form.message}
          onChange={handleChange}
          disabled={loading}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="date">
          Date
        </label>
        <input
          id="date"
          name="date"
          type="date"
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
          value={form.date}
          onChange={handleChange}
          disabled={loading}
          required
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          id="read"
          name="read"
          type="checkbox"
          checked={form.read}
          onChange={handleChange}
          disabled={loading}
        />
        <label htmlFor="read" className="text-sm">
          Read
        </label>
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
