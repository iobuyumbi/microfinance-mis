
import React from 'react';
import { Controller } from 'react-hook-form';
import { cn } from '../../lib/utils';
import { Label } from './label';
import { Input } from './input';
import { Textarea } from './textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Checkbox } from './checkbox';
import { RadioGroup, RadioGroupItem } from './radio-group';

const FormField = React.forwardRef(({
  name,
  control,
  label,
  type = 'text',
  placeholder,
  options = [],
  className,
  error,
  required = false,
  disabled = false,
  description,
  ...props
}, ref) => {
  const renderInput = (field) => {
    const inputProps = {
      ...field,
      ...props,
      className: cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        error && "border-destructive focus-visible:ring-destructive",
        className
      ),
      placeholder,
      disabled,
      ref
    };

    switch (type) {
      case 'textarea':
        return (
          <Textarea
            {...inputProps}
            className={cn(
              "min-h-[80px] resize-none",
              error && "border-destructive focus-visible:ring-destructive",
              className
            )}
          />
        );

      case 'select':
        return (
          <Select
            value={field.value || ''}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <SelectTrigger
              className={cn(
                error && "border-destructive focus:ring-destructive",
                className
              )}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem
                  key={typeof option === 'string' ? option : option.value}
                  value={typeof option === 'string' ? option : option.value}
                >
                  {typeof option === 'string' ? option : option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={name}
              checked={field.value || false}
              onCheckedChange={field.onChange}
              disabled={disabled}
              className={cn(
                error && "border-destructive",
                className
              )}
            />
            <Label
              htmlFor={name}
              className={cn(
                "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                error && "text-destructive"
              )}
            >
              {label}
            </Label>
          </div>
        );

      case 'radio':
        return (
          <RadioGroup
            value={field.value || ''}
            onValueChange={field.onChange}
            disabled={disabled}
            className={cn("grid grid-cols-1 gap-2", className)}
          >
            {options.map((option) => (
              <div key={typeof option === 'string' ? option : option.value} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={typeof option === 'string' ? option : option.value}
                  id={`${name}-${typeof option === 'string' ? option : option.value}`}
                  className={cn(error && "border-destructive")}
                />
                <Label
                  htmlFor={`${name}-${typeof option === 'string' ? option : option.value}`}
                  className="text-sm font-medium"
                >
                  {typeof option === 'string' ? option : option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'number':
        return (
          <Input
            {...inputProps}
            type="number"
            step="0.01"
            min="0"
          />
        );

      case 'email':
        return (
          <Input
            {...inputProps}
            type="email"
            autoComplete="email"
          />
        );

      case 'password':
        return (
          <Input
            {...inputProps}
            type="password"
            autoComplete={name === 'confirmPassword' ? 'new-password' : 'current-password'}
          />
        );

      case 'tel':
        return (
          <Input
            {...inputProps}
            type="tel"
            autoComplete="tel"
          />
        );

      case 'date':
        return (
          <Input
            {...inputProps}
            type="date"
          />
        );

      case 'datetime-local':
        return (
          <Input
            {...inputProps}
            type="datetime-local"
          />
        );

      default:
        return <Input {...inputProps} />;
    }
  };

  return (
    <div className="space-y-2">
      {label && type !== 'checkbox' && (
        <Label
          htmlFor={name}
          className={cn(
            "text-sm font-medium leading-none",
            error && "text-destructive",
            required && "after:content-['*'] after:ml-0.5 after:text-destructive"
          )}
        >
          {label}
        </Label>
      )}
      
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      <Controller
        name={name}
        control={control}
        render={({ field }) => renderInput(field)}
      />

      {error && (
        <p className="text-sm text-destructive">{error.message}</p>
      )}
    </div>
  );
});

FormField.displayName = 'FormField';

export default FormField;
