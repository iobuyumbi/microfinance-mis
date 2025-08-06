import React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Eye, EyeOff } from "lucide-react";
import { format } from "date-fns";

const FormField = ({
  type = "text",
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  required = false,
  disabled = false,
  options = [],
  className,
  ...props
}) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [date, setDate] = React.useState(value ? new Date(value) : undefined);

  const handleChange = (newValue) => {
    if (type === "date" && newValue) {
      setDate(newValue);
      onChange({ target: { name, value: newValue.toISOString() } });
    } else if (type === "select" || type === "radio") {
      onChange({ target: { name, value: newValue } });
    } else if (type === "checkbox") {
      onChange({ target: { name, value: newValue } });
    } else if (type === "switch") {
      onChange({ target: { name, value: newValue } });
    } else {
      onChange({ target: { name, value: newValue } });
    }
  };

  const renderField = () => {
    switch (type) {
      case "textarea":
        return (
          <Textarea
            name={name}
            value={value || ""}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(error && "border-red-500 focus:border-red-500")}
            {...props}
          />
        );

      case "select":
        return (
          <Select
            value={value || ""}
            onValueChange={handleChange}
            disabled={disabled}
          >
            <SelectTrigger
              className={cn(error && "border-red-500 focus:border-red-500")}
            >
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

      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={name}
              checked={value || false}
              onCheckedChange={handleChange}
              disabled={disabled}
            />
            <Label htmlFor={name} className="text-sm font-normal">
              {label}
            </Label>
          </div>
        );

      case "switch":
        return (
          <div className="flex items-center space-x-2">
            <Switch
              id={name}
              checked={value || false}
              onCheckedChange={handleChange}
              disabled={disabled}
            />
            <Label htmlFor={name} className="text-sm font-normal">
              {label}
            </Label>
          </div>
        );

      case "radio":
        return (
          <RadioGroup
            value={value || ""}
            onValueChange={handleChange}
            disabled={disabled}
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
        );

      case "date":
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground",
                  error && "border-red-500 focus:border-red-500"
                )}
                disabled={disabled}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>{placeholder}</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleChange}
                disabled={disabled}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );

      case "password":
        return (
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              name={name}
              value={value || ""}
              onChange={onChange}
              onBlur={onBlur}
              placeholder={placeholder}
              disabled={disabled}
              className={cn(
                "pr-10",
                error && "border-red-500 focus:border-red-500"
              )}
              {...props}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
              disabled={disabled}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        );

      case "number":
        return (
          <Input
            type="number"
            name={name}
            value={value || ""}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(error && "border-red-500 focus:border-red-500")}
            {...props}
          />
        );

      case "email":
        return (
          <Input
            type="email"
            name={name}
            value={value || ""}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(error && "border-red-500 focus:border-red-500")}
            {...props}
          />
        );

      case "tel":
        return (
          <Input
            type="tel"
            name={name}
            value={value || ""}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(error && "border-red-500 focus:border-red-500")}
            {...props}
          />
        );

      case "url":
        return (
          <Input
            type="url"
            name={name}
            value={value || ""}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(error && "border-red-500 focus:border-red-500")}
            {...props}
          />
        );

      default:
        return (
          <Input
            type="text"
            name={name}
            value={value || ""}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(error && "border-red-500 focus:border-red-500")}
            {...props}
          />
        );
    }
  };

  // For checkbox and switch, we don't need a separate label
  if (type === "checkbox" || type === "switch") {
    return (
      <div className={cn("space-y-2", className)}>
        {renderField()}
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={name} className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      {renderField()}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default FormField;
