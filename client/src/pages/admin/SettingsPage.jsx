import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Form } from "@/components/common/Form";
import { z } from "zod";
import { toast } from "sonner";
import { settingsService } from "@/services/settingsService";
import { Loader2, Save, RotateCcw } from "lucide-react";

const settingsSchema = z.object({
  organizationName: z.string().min(1, "Organization name is required"),
  currency: z.string().min(1, "Currency is required"),
  timezone: z.string().min(1, "Timezone is required"),
  maxLoanAmount: z.number().positive("Max loan amount must be positive"),
  minLoanAmount: z.number().positive("Min loan amount must be positive"),
  interestRate: z.number().min(0, "Interest rate must be non-negative"),
  latePaymentPenalty: z
    .number()
    .min(0, "Late payment penalty must be non-negative"),
  maxGroupSize: z.number().positive("Max group size must be positive"),
  minGroupSize: z.number().positive("Min group size must be positive"),
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
});

const formFields = [
  {
    name: "organizationName",
    label: "Organization Name",
    type: "text",
    placeholder: "Enter organization name",
    required: true,
  },
  {
    name: "currency",
    label: "Currency",
    type: "select",
    required: true,
    options: [
      { value: "USD", label: "USD" },
      { value: "EUR", label: "EUR" },
      { value: "GBP", label: "GBP" },
      { value: "KES", label: "KES" },
      { value: "UGX", label: "UGX" },
      { value: "TZS", label: "TZS" },
    ],
  },
  {
    name: "timezone",
    label: "Timezone",
    type: "select",
    required: true,
    options: [
      { value: "UTC", label: "UTC" },
      { value: "Africa/Nairobi", label: "Africa/Nairobi" },
      { value: "Africa/Kampala", label: "Africa/Kampala" },
      { value: "Africa/Dar_es_Salaam", label: "Africa/Dar_es_Salaam" },
    ],
  },
  {
    name: "maxLoanAmount",
    label: "Maximum Loan Amount",
    type: "number",
    placeholder: "Enter maximum loan amount",
    required: true,
  },
  {
    name: "minLoanAmount",
    label: "Minimum Loan Amount",
    type: "number",
    placeholder: "Enter minimum loan amount",
    required: true,
  },
  {
    name: "interestRate",
    label: "Interest Rate (%)",
    type: "number",
    placeholder: "Enter interest rate",
    required: true,
  },
  {
    name: "latePaymentPenalty",
    label: "Late Payment Penalty (%)",
    type: "number",
    placeholder: "Enter late payment penalty",
    required: true,
  },
  {
    name: "maxGroupSize",
    label: "Maximum Group Size",
    type: "number",
    placeholder: "Enter maximum group size",
    required: true,
  },
  {
    name: "minGroupSize",
    label: "Minimum Group Size",
    type: "number",
    placeholder: "Enter minimum group size",
    required: true,
  },
  {
    name: "emailNotifications",
    label: "Email Notifications",
    type: "checkbox",
  },
  {
    name: "smsNotifications",
    label: "SMS Notifications",
    type: "checkbox",
  },
];

const AdminSettingsPage = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Fetch settings
  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await settingsService.get();
      setSettings(res.data);
    } catch (err) {
      setError("Failed to load settings");
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Handle save settings
  const handleSaveSettings = async (data) => {
    setSaving(true);
    try {
      await settingsService.update(data);
      toast.success("Settings updated successfully");
      fetchSettings();
    } catch (error) {
      toast.error("Failed to update settings");
      throw error;
    } finally {
      setSaving(false);
    }
  };

  // Handle reset settings
  const handleResetSettings = async () => {
    if (
      !confirm(
        "Are you sure you want to reset all settings to default? This action cannot be undone."
      )
    ) {
      return;
    }

    setSaving(true);
    try {
      await settingsService.reset();
      toast.success("Settings reset successfully");
      fetchSettings();
    } catch (error) {
      toast.error("Failed to reset settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading settings...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchSettings}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Settings</h1>
          <p className="text-muted-foreground">Configure system parameters</p>
        </div>
        <Button
          variant="outline"
          onClick={handleResetSettings}
          disabled={saving}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset to Default
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Configure basic system parameters</CardDescription>
        </CardHeader>
        <CardContent>
          <Form
            fields={formFields}
            onSubmit={handleSaveSettings}
            validationSchema={settingsSchema}
            defaultValues={settings || {}}
            title=""
            showCancel={false}
            submitText={saving ? "Saving..." : "Save Settings"}
            submitIcon={saving ? Loader2 : Save}
            disabled={saving}
          />
        </CardContent>
      </Card>

      {settings && (
        <Card>
          <CardHeader>
            <CardTitle>Current Settings</CardTitle>
            <CardDescription>
              Overview of current system configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Organization
                </label>
                <p className="text-sm font-medium">
                  {settings.organizationName}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Currency
                </label>
                <p className="text-sm font-medium">{settings.currency}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Timezone
                </label>
                <p className="text-sm font-medium">{settings.timezone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Loan Range
                </label>
                <p className="text-sm font-medium">
                  {settings.minLoanAmount?.toLocaleString()} -{" "}
                  {settings.maxLoanAmount?.toLocaleString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Interest Rate
                </label>
                <p className="text-sm font-medium">{settings.interestRate}%</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Group Size
                </label>
                <p className="text-sm font-medium">
                  {settings.minGroupSize} - {settings.maxGroupSize}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Notifications
                </label>
                <div className="flex gap-2 mt-1">
                  <Badge
                    variant={
                      settings.emailNotifications ? "default" : "secondary"
                    }
                  >
                    Email {settings.emailNotifications ? "On" : "Off"}
                  </Badge>
                  <Badge
                    variant={
                      settings.smsNotifications ? "default" : "secondary"
                    }
                  >
                    SMS {settings.smsNotifications ? "On" : "Off"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminSettingsPage;
