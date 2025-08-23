import React from "react";
import { cn } from "../../lib/utils";
import { Label } from "./label";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Alert, AlertDescription } from "./alert";
import { AlertCircle } from "lucide-react";

/**
 * Reusable Form Field Component
 * Provides consistent styling, validation, and error handling for form inputs
 */
export const FormField = ({
  type = "text",
  label,
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  disabled = false,
  error,
  touched,
  options = [],
  icon: Icon,
  className,
  inputClassName,
  labelClassName,
  helpText,
  min,
  max,
  step,
  rows = 3,
  ...props
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ target: { name, value } });
  };

  const handleSelectChange = (value) => {
    onChange({ target: { name, value } });
  };

  const handleBlur = () => {
    if (onBlur) {
      onBlur({ target: { name } });
    }
  };

  const showError = touched && error;
  const fieldId = `field-${name}`;

  const renderInput = () => {
    const commonProps = {
      id: fieldId,
      name,
      value: value || "",
      disabled,
      className: cn(
        "transition-colors",
        Icon && "pl-10",
        showError && "border-destructive focus-visible:ring-destructive",
        inputClassName
      ),
      ...props
    };

    switch (type) {
      case "textarea":
        return (
          <Textarea
            {...commonProps}
            placeholder={placeholder}
            rows={rows}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        );

      case "select":
        return (
          <Select
            value={value || ""}
            onValueChange={handleSelectChange}
            disabled={disabled}
          >
            <SelectTrigger className={cn(commonProps.className, "pl-10")}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "number":
        return (
          <Input
            {...commonProps}
            type="number"
            placeholder={placeholder}
            min={min}
            max={max}
            step={step}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        );

      case "date":
        return (
          <Input
            {...commonProps}
            type="date"
            onChange={handleChange}
            onBlur={handleBlur}
          />
        );

      case "email":
        return (
          <Input
            {...commonProps}
            type="email"
            placeholder={placeholder}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        );

      case "password":
        return (
          <Input
            {...commonProps}
            type="password"
            placeholder={placeholder}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        );

      default:
        return (
          <Input
            {...commonProps}
            type="text"
            placeholder={placeholder}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        );
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label
          htmlFor={fieldId}
          className={cn(
            "text-sm font-medium",
            showError && "text-destructive",
            labelClassName
          )}
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}

      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        )}
        {renderInput()}
      </div>

      {showError && (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      )}

      {helpText && !showError && (
        <p className="text-sm text-muted-foreground">{helpText}</p>
      )}
    </div>
  );
};

/**
 * Form Field Group Component
 * Groups related form fields together
 */
export const FormFieldGroup = ({ title, description, children, className }) => {
  return (
    <div className={cn("space-y-4", className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && <h3 className="text-lg font-medium">{title}</h3>}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  );
};

/**
 * Form Actions Component
 * Standardized form action buttons
 */
export const FormActions = ({
  onSubmit,
  onCancel,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  loading = false,
  disabled = false,
  className,
  showCancel = true,
  submitVariant = "default",
  cancelVariant = "outline"
}) => {
  return (
    <div className={cn("flex gap-2 justify-end pt-4", className)}>
      {showCancel && onCancel && (
        <button
          type="button"
          variant={cancelVariant}
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:pointer-events-none"
        >
          {cancelLabel}
        </button>
      )}
      <button
        type="submit"
        variant={submitVariant}
        onClick={onSubmit}
        disabled={loading || disabled}
        className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none"
      >
        {loading ? "Saving..." : submitLabel}
      </button>
    </div>
  );
};

export default FormField; 