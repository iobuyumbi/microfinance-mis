import { useState, useEffect } from "react";
import { FormField, FormFieldGroup, FormActions } from "../ui/form-field";
import { Alert, AlertDescription } from "../ui/alert";
import { AlertCircle, Calendar, MapPin, Users, CheckCircle2, FileText } from "lucide-react";
import { cn } from "../../lib/utils";

export default function MeetingForm({
  initialValues = {},
  onSubmit,
  onCancel,
  loading,
  groups = [] // Add groups prop for dropdown
}) {
  const [form, setForm] = useState({
    group: initialValues.group || "",
    date: initialValues.date ? initialValues.date.slice(0, 10) : "",
    time: initialValues.time || "09:00",
    location: initialValues.location || "",
    agenda: initialValues.agenda || "",
    status: initialValues.status || "scheduled",
  });
  
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Reset form when initialValues change
  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      setForm({
        group: initialValues.group || "",
        date: initialValues.date ? initialValues.date.slice(0, 10) : "",
        time: initialValues.time || "09:00",
        location: initialValues.location || "",
        agenda: initialValues.agenda || "",
        status: initialValues.status || "scheduled",
      });
      setTouched({});
      setErrors({});
    }
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, form[name]);
  };

  const validateField = (name, value) => {
    let error = null;

    switch (name) {
      case "group":
        if (!value) {
          error = "Please select a group for the meeting";
        }
        break;
      case "date":
        if (!value) {
          error = "Please select a meeting date";
        } else {
          const selectedDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (selectedDate < today && form.status === "scheduled") {
            error = "Meeting date cannot be in the past for scheduled meetings";
          }
        }
        break;
      case "time":
        if (!value) {
          error = "Please select a meeting time";
        }
        break;
      case "location":
        if (!value.trim()) {
          error = "Please enter a meeting location";
        } else if (value.trim().length < 3) {
          error = "Location must be at least 3 characters long";
        }
        break;
      case "agenda":
        if (value && value.trim().length > 500) {
          error = "Agenda cannot exceed 500 characters";
        }
        break;
    }

    setErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Validate all required fields
    if (!validateField("group", form.group)) isValid = false;
    if (!validateField("date", form.date)) isValid = false;
    if (!validateField("time", form.time)) isValid = false;
    if (!validateField("location", form.location)) isValid = false;

    // Mark all fields as touched
    setTouched({
      group: true,
      date: true,
      time: true,
      location: true,
      agenda: true,
      status: true,
    });

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Combine date and time
      const dateTime = new Date(`${form.date}T${form.time}`);
      
      const meetingData = {
        ...form,
        date: dateTime.toISOString(),
        // Remove time from form data as it's now combined with date
        time: undefined
      };

      await onSubmit(meetingData);
    } catch (err) {
      console.error("Form submission error:", err);
    }
  };

  // Prepare group options for dropdown
  const groupOptions = groups.map(group => ({
    value: group._id || group.id,
    label: group.name
  }));

  const statusOptions = [
    { value: "scheduled", label: "Scheduled" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Meeting Details Group */}
      <FormFieldGroup
        title="Meeting Details"
        description="Basic information about the meeting"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            type="select"
            label="Group"
            name="group"
            value={form.group}
            onChange={handleChange}
            onBlur={handleBlur}
            options={groupOptions}
            placeholder="Select a group"
            required
            error={errors.group}
            touched={touched.group}
            icon={Users}
            helpText="Choose the group that will attend this meeting"
          />

          <FormField
            type="select"
            label="Status"
            name="status"
            value={form.status}
            onChange={handleChange}
            onBlur={handleBlur}
            options={statusOptions}
            error={errors.status}
            touched={touched.status}
            icon={CheckCircle2}
            helpText="Current status of the meeting"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            type="date"
            label="Meeting Date"
            name="date"
            value={form.date}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            error={errors.date}
            touched={touched.date}
            icon={Calendar}
            helpText="When the meeting will take place"
          />

          <FormField
            type="time"
            label="Meeting Time"
            name="time"
            value={form.time}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            error={errors.time}
            touched={touched.time}
            helpText="What time the meeting will start"
          />
        </div>

        <FormField
          type="text"
          label="Meeting Location"
          name="location"
          value={form.location}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Enter meeting location (e.g., Community Hall, Office)"
          required
          error={errors.location}
          touched={touched.location}
          icon={MapPin}
          helpText="Where the meeting will be held"
        />
      </FormFieldGroup>

      {/* Additional Information Group */}
      <FormFieldGroup
        title="Additional Information"
        description="Optional details about the meeting"
      >
        <FormField
          type="textarea"
          label="Meeting Agenda"
          name="agenda"
          value={form.agenda}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="What will be discussed in this meeting?"
          error={errors.agenda}
          touched={touched.agenda}
          icon={FileText}
          helpText="Topics to be discussed (optional)"
          rows={4}
        />
      </FormFieldGroup>

      {/* Form Actions */}
      <FormActions
        onSubmit={handleSubmit}
        onCancel={onCancel}
        submitLabel={initialValues._id ? "Update Meeting" : "Create Meeting"}
        loading={loading}
        disabled={Object.keys(errors).some(key => errors[key])}
      />
    </form>
  );
}
