import { useState } from "react";

export default function MeetingForm({
  initialValues = {},
  onSubmit,
  onCancel,
  loading,
}) {
  const [form, setForm] = useState({
    group: initialValues.group || "",
    date: initialValues.date ? initialValues.date.slice(0, 10) : "",
    location: initialValues.location || "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.group || !form.date || !form.location) {
      setError("All fields are required.");
      return;
    }
    try {
      await onSubmit({ ...form, date: new Date(form.date).toISOString() });
    } catch (err) {
      setError(err.message || "Failed to save meeting");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="group">
          Group
        </label>
        <input
          id="group"
          name="group"
          type="text"
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
          value={form.group}
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
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="location">
          Location
        </label>
        <input
          id="location"
          name="location"
          type="text"
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
          value={form.location}
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
