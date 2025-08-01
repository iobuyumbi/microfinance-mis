import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Loader2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const Form = ({
  fields = [],
  onSubmit,
  onCancel,
  defaultValues = {},
  validationSchema,
  loading = false,
  error = null,
  title = "Form",
  description = "",
  submitText = "Submit",
  cancelText = "Cancel",
  showCancel = true,
  className = "",
  layout = "vertical", // vertical, horizontal, grid
  columns = 1,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    reset,
    control,
  } = useForm({
    resolver: validationSchema ? zodResolver(validationSchema) : undefined,
    defaultValues,
    mode: "onChange",
  });

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  const handleFormSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    reset();
    onCancel?.();
  };

  const renderField = (field) => {
    const {
      name,
      label,
      type = "text",
      placeholder,
      required = false,
      disabled = false,
      options = [],
      validation,
      ...fieldProps
    } = field;

    const error = errors[name];
    const value = watch(name);

    const commonProps = {
      id: name,
      disabled: disabled || loading,
      className: error ? "border-red-500" : "",
    };

    switch (type) {
      case "text":
      case "email":
      case "password":
      case "number":
      case "tel":
      case "url":
        return (
          <div key={name} className="space-y-2">
            <Label htmlFor={name} className={required ? "required" : ""}>
              {label}
            </Label>
            <Input
              {...register(name, validation)}
              type={type}
              placeholder={placeholder}
              {...commonProps}
              {...fieldProps}
            />
            {error && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {error.message}
              </p>
            )}
          </div>
        );

      case "textarea":
        return (
          <div key={name} className="space-y-2">
            <Label htmlFor={name} className={required ? "required" : ""}>
              {label}
            </Label>
            <Textarea
              {...register(name, validation)}
              placeholder={placeholder}
              {...commonProps}
              {...fieldProps}
            />
            {error && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {error.message}
              </p>
            )}
          </div>
        );

      case "select":
        return (
          <div key={name} className="space-y-2">
            <Label htmlFor={name} className={required ? "required" : ""}>
              {label}
            </Label>
            <Select
              value={value}
              onValueChange={(val) => setValue(name, val)}
              disabled={disabled || loading}
            >
              <SelectTrigger className={error ? "border-red-500" : ""}>
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
            {error && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {error.message}
              </p>
            )}
          </div>
        );

      case "checkbox":
        return (
          <div key={name} className="flex items-center space-x-2">
            <Checkbox
              {...register(name, validation)}
              id={name}
              disabled={disabled || loading}
              checked={value}
              onCheckedChange={(checked) => setValue(name, checked)}
            />
            <Label htmlFor={name} className="text-sm font-normal">
              {label}
            </Label>
            {error && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {error.message}
              </p>
            )}
          </div>
        );

      case "radio":
        return (
          <div key={name} className="space-y-2">
            <Label className={required ? "required" : ""}>{label}</Label>
            <RadioGroup
              value={value}
              onValueChange={(val) => setValue(name, val)}
              disabled={disabled || loading}
            >
              {options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={option.value}
                    id={`${name}-${option.value}`}
                  />
                  <Label
                    htmlFor={`${name}-${option.value}`}
                    className="text-sm font-normal"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {error && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {error.message}
              </p>
            )}
          </div>
        );

      case "switch":
        return (
          <div key={name} className="flex items-center justify-between">
            <Label htmlFor={name} className="text-sm font-normal">
              {label}
            </Label>
            <Switch
              {...register(name, validation)}
              id={name}
              disabled={disabled || loading}
              checked={value}
              onCheckedChange={(checked) => setValue(name, checked)}
            />
            {error && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {error.message}
              </p>
            )}
          </div>
        );

      case "date":
        return (
          <div key={name} className="space-y-2">
            <Label htmlFor={name} className={required ? "required" : ""}>
              {label}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !value && "text-muted-foreground",
                    error && "border-red-500"
                  )}
                  disabled={disabled || loading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {value ? format(value, "PPP") : placeholder}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={value}
                  onSelect={(date) => setValue(name, date)}
                  disabled={disabled || loading}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {error && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {error.message}
              </p>
            )}
          </div>
        );

      case "custom":
        return (
          <div key={name} className="space-y-2">
            {label && (
              <Label htmlFor={name} className={required ? "required" : ""}>
                {label}
              </Label>
            )}
            {fieldProps.render?.({
              value,
              onChange: (val) => setValue(name, val),
              error,
              disabled: disabled || loading,
              ...commonProps,
            })}
            {error && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {error.message}
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const renderFields = () => {
    if (layout === "grid") {
      return (
        <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-4`}>
          {fields.map(renderField)}
        </div>
      );
    }

    if (layout === "horizontal") {
      return (
        <div className="space-y-4">
          {fields.map((field) => (
            <div
              key={field.name}
              className="grid grid-cols-3 gap-4 items-center"
            >
              <Label
                htmlFor={field.name}
                className={field.required ? "required" : ""}
              >
                {field.label}
              </Label>
              <div className="col-span-2">{renderField(field)}</div>
            </div>
          ))}
        </div>
      );
    }

    return <div className="space-y-4">{fields.map(renderField)}</div>;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </p>
            </div>
          )}

          {renderFields()}

          <div className="flex items-center justify-end space-x-2 pt-4">
            {showCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading || isSubmitting}
              >
                {cancelText}
              </Button>
            )}
            <Button
              type="submit"
              disabled={!isValid || loading || isSubmitting}
            >
              {(loading || isSubmitting) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {submitText}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default Form;
