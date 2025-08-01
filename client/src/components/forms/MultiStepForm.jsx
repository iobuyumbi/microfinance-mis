import React, { useState, useCallback, useMemo } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronLeft, ChevronRight, Check, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

// Multi-step form component
const MultiStepForm = ({
  steps = [],
  onSubmit,
  onStepChange,
  initialData = {},
  className,
  showProgress = true,
  showStepNumbers = true,
  allowStepNavigation = true,
  autoSave = false,
  ...props
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create combined validation schema
  const combinedSchema = useMemo(() => {
    const schemas = steps.map((step) => step.validation || z.object({}));
    return z.object(
      schemas.reduce((acc, schema) => ({ ...acc, ...schema.shape }), {})
    );
  }, [steps]);

  // Initialize form
  const methods = useForm({
    resolver: zodResolver(combinedSchema),
    defaultValues: initialData,
    mode: "onChange",
  });

  const {
    handleSubmit,
    trigger,
    getValues,
    setValue,
    formState: { errors, isValid },
  } = methods;

  // Calculate progress
  const progress = useMemo(() => {
    return ((currentStep + 1) / steps.length) * 100;
  }, [currentStep, steps.length]);

  // Check if current step is valid
  const isCurrentStepValid = useMemo(() => {
    const currentStepSchema = steps[currentStep]?.validation;
    if (!currentStepSchema) return true;

    try {
      const currentData = getValues();
      currentStepSchema.parse(currentData);
      return true;
    } catch {
      return false;
    }
  }, [currentStep, steps, getValues]);

  // Navigate to step
  const goToStep = useCallback(
    async (stepIndex) => {
      if (!allowStepNavigation) return;

      // Validate current step before navigation
      if (stepIndex > currentStep) {
        const isValid = await trigger();
        if (!isValid) return;
      }

      setCurrentStep(stepIndex);
      onStepChange?.(stepIndex, steps[stepIndex]);
    },
    [currentStep, steps, trigger, allowStepNavigation, onStepChange]
  );

  // Navigate to next step
  const nextStep = useCallback(async () => {
    if (currentStep < steps.length - 1) {
      const isValid = await trigger();
      if (isValid) {
        setCompletedSteps((prev) => new Set([...prev, currentStep]));
        goToStep(currentStep + 1);
      }
    }
  }, [currentStep, steps.length, trigger, goToStep]);

  // Navigate to previous step
  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      goToStep(currentStep - 1);
    }
  }, [currentStep, goToStep]);

  // Handle form submission
  const handleFormSubmit = useCallback(
    async (data) => {
      setIsSubmitting(true);
      try {
        await onSubmit?.(data, currentStep);
        setCompletedSteps((prev) => new Set([...prev, currentStep]));
      } catch (error) {
        console.error("Form submission error:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSubmit, currentStep]
  );

  // Auto-save functionality
  const autoSaveData = useCallback(() => {
    if (autoSave) {
      const currentData = getValues();
      localStorage.setItem("multistep-form-data", JSON.stringify(currentData));
    }
  }, [autoSave, getValues]);

  // Load auto-saved data
  React.useEffect(() => {
    if (autoSave) {
      const savedData = localStorage.getItem("multistep-form-data");
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          Object.entries(parsedData).forEach(([key, value]) => {
            setValue(key, value);
          });
        } catch (error) {
          console.error("Error loading auto-saved data:", error);
        }
      }
    }
  }, [autoSave, setValue]);

  // Auto-save on form changes
  React.useEffect(() => {
    const subscription = methods.watch(() => {
      autoSaveData();
    });
    return () => subscription.unsubscribe();
  }, [methods, autoSaveData]);

  const currentStepData = steps[currentStep];

  if (!currentStepData) {
    return <div>No steps defined</div>;
  }

  return (
    <div className={cn("w-full max-w-4xl mx-auto", className)} {...props}>
      {/* Progress Bar */}
      {showProgress && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-text-secondary">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm font-medium text-text-secondary">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {/* Step Navigation */}
      {showStepNumbers && (
        <div className="flex items-center justify-center mb-8">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center">
              <button
                onClick={() => goToStep(index)}
                disabled={!allowStepNavigation}
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors",
                  {
                    "border-primary-600 bg-primary-600 text-white":
                      index === currentStep,
                    "border-border-primary text-text-secondary hover:border-primary-600":
                      index !== currentStep && allowStepNavigation,
                    "border-border-primary text-text-tertiary cursor-not-allowed":
                      index !== currentStep && !allowStepNavigation,
                    "border-success-600 bg-success-600 text-white":
                      completedSteps.has(index) && index !== currentStep,
                  }
                )}
              >
                {completedSteps.has(index) ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </button>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "w-16 h-0.5 mx-2",
                    completedSteps.has(index)
                      ? "bg-success-600"
                      : "bg-border-primary"
                  )}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Form Content */}
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {currentStepData.icon && (
                  <currentStepData.icon className="w-5 h-5" />
                )}
                {currentStepData.title}
              </CardTitle>
              {currentStepData.description && (
                <p className="text-text-secondary">
                  {currentStepData.description}
                </p>
              )}
            </CardHeader>
            <CardContent>
              <currentStepData.component />
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            >
              Previous
            </Button>

            <div className="flex items-center gap-2">
              {currentStep < steps.length - 1 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={!isCurrentStepValid}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  loading={isSubmitting}
                  disabled={!isValid}
                  leftIcon={<Save className="w-4 h-4" />}
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
              )}
            </div>
          </div>
        </form>
      </FormProvider>

      {/* Step Summary */}
      {currentStepData.summary && (
        <div className="mt-6 p-4 bg-surface-secondary rounded-lg">
          <h4 className="font-medium mb-2">Step Summary</h4>
          <currentStepData.summary data={getValues()} />
        </div>
      )}
    </div>
  );
};

// Step configuration helper
export const createStep = (config) => ({
  title: "",
  description: "",
  component: null,
  validation: null,
  icon: null,
  summary: null,
  ...config,
});

// Form step builder
export const FormStepBuilder = ({ children, validation, ...props }) => {
  return <div {...props}>{children}</div>;
};

export default MultiStepForm;
