// src/pages/Settings.jsx
import React, { useState, useEffect, useCallback } from "react";
import { settingsService } from "@/services/settingsService";
import { useAuth } from "@/context/AuthContext"; // Import useAuth

// Shadcn UI Components
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Input,
  Label,
  Switch,
  AlertDialog, // Import AlertDialog for delete/reset confirmation
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui"; // Correct path for Shadcn UI components
import {
  PageLayout,
  PageSection,
  ContentCard,
} from "@/components/layouts/PageLayout"; // Import PageLayout, PageSection, ContentCard
import { toast } from "sonner";

// Import Lucide React Icons
import {
  Settings as SettingsIcon, // Renamed to avoid conflict with component name
  Save,
  RotateCcw,
  Building,
  DollarSign,
  Globe,
  Calendar,
  Bell,
  Lock,
  Mail,
  MessageSquare,
  CreditCard,
  Wallet,
  Percent,
  Clock,
  Activity,
  UserCheck,
  Loader2,
  AlertCircle, // Added for notifications section
  Info, // Added for Language setting
} from "lucide-react";

export default function Settings() {
  const {
    user: currentUser,
    isAuthenticated,
    loading: authLoading,
  } = useAuth();
  // isAdmin check is kept for potential future use or specific UI elements,
  // but access control for viewing the page is now based only on authentication.
  const isAdmin = currentUser && currentUser.role === "admin";

  // --- DEBUG LOG ---
  useEffect(() => {
    console.log(
      "Settings Page - Auth Status:",
      isAuthenticated,
      "User Role:",
      currentUser?.role
    );
  }, [isAuthenticated, currentUser]);
  // --- END DEBUG LOG ---

  const [activeTab, setActiveTab] = useState("general");
  // Initialize settings with a default structure to prevent undefined errors
  const [settings, setSettings] = useState({
    general: {
      organizationName: "",
      currency: "USD",
      timezone: "UTC+0",
      language: "English",
      dateFormat: "MM/DD/YYYY",
    },
    loan: {
      defaultInterestRate: 0,
      maxLoanAmount: 0,
      minLoanAmount: 0,
      defaultLoanTerm: 0,
      gracePeriod: 0,
      lateFee: 0,
    },
    savings: {
      defaultInterestRate: 0,
      minBalance: 0,
      withdrawalLimit: 0,
      maintenanceFee: 0,
      compoundingFrequency: "Monthly",
    },
    notifications: {
      emailNotifications: false,
      smsNotifications: false,
      paymentReminders: false,
      overdueAlerts: false,
      systemUpdates: false,
      reminderDays: 0,
    },
    security: {
      sessionTimeout: 0,
      passwordExpiry: 0,
      loginAttempts: 0,
      twoFactorAuth: false,
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false); // State for reset confirmation dialog

  // Memoize fetchSettings to prevent unnecessary re-renders and re-fetches
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await settingsService.get();
      // Robustly merge fetched data with default settings to ensure all keys exist
      setSettings((prevDefaults) => ({
        general: { ...prevDefaults.general, ...(data?.general || {}) },
        loan: { ...prevDefaults.loan, ...(data?.loan || {}) },
        savings: { ...prevDefaults.savings, ...(data?.savings || {}) },
        notifications: {
          ...prevDefaults.notifications,
          ...(data?.notifications || {}),
        },
        security: { ...prevDefaults.security, ...(data?.security || {}) },
      }));
    } catch (err) {
      const errorMessage = err.message || "Failed to load settings";
      setError(errorMessage);
      toast.error(errorMessage);
      // If error, settings will remain its default initialized state, which is now robust.
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies as it fetches global settings

  // Initial fetch on component mount and when auth status changes
  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        fetchSettings();
      } else {
        setLoading(false);
        setError("Access Denied: You must be logged in to view settings."); // Updated message
      }
    }
  }, [isAuthenticated, authLoading, fetchSettings]);

  const handleSettingChange = (category, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsService.update(settings);
      toast.success("Settings saved successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleResetClick = () => {
    setShowConfirmReset(true);
  };

  const confirmReset = async () => {
    setShowConfirmReset(false); // Close dialog first
    try {
      // This assumes settingsService.reset() exists and fetches defaults
      // If not, you might need to manually set default values or re-fetch.
      await settingsService.reset(); // Assuming a reset API call
      toast.success("Settings reset to default values!");
      fetchSettings(); // Re-fetch to load actual default values
    } catch (err) {
      toast.error(err.message || "Failed to reset settings.");
    }
  };

  // Render loading and error states based on authentication
  if (authLoading) {
    return (
      <PageLayout title="System Settings">
        <div className="p-6 text-center text-muted-foreground">
          Checking authentication and permissions...
        </div>
      </PageLayout>
    );
  }

  // Access is now based ONLY on isAuthenticated
  if (!isAuthenticated) {
    return (
      <PageLayout title="System Settings">
        <div className="p-6 text-center text-red-500">
          <Lock className="h-10 w-10 mx-auto mb-4 text-red-400" />
          Access Denied: You must be logged in to view this page.
        </div>
      </PageLayout>
    );
  }

  // Once authenticated, proceed with data loading or error display for settings
  // The `loading` check is sufficient now that `settings` is always initialized with a default structure.
  if (loading) {
    return (
      <PageLayout title="System Settings">
        <div className="p-6 text-center text-muted-foreground">
          Loading settings...
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout title="System Settings">
        <div className="p-6 text-center text-red-500">{error}</div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="System Settings"
      action={
        <div className="flex space-x-3">
          {/* Reset to Defaults button is now only visible to admins */}
          {isAdmin && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  onClick={handleResetClick}
                  disabled={saving}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset to Defaults
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Reset</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to reset all settings to their default
                    values? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={confirmReset}>
                    Reset
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {/* Save Changes button is now only visible to admins */}
          {isAdmin && (
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          )}
        </div>
      }
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-5">
          {[
            { id: "general", label: "General", icon: SettingsIcon },
            { id: "loan", label: "Loan Settings", icon: CreditCard },
            { id: "savings", label: "Savings Settings", icon: Wallet },
            { id: "notifications", label: "Notifications", icon: Bell },
            { id: "security", label: "Security", icon: Lock },
          ].map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex items-center space-x-2"
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="mt-6">
          <PageSection title="General Settings">
            <ContentCard isLoading={loading}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label
                    htmlFor="organizationName"
                    className="mb-2 flex items-center"
                  >
                    <Building className="h-4 w-4 mr-1" /> Organization Name
                  </Label>
                  <Input
                    id="organizationName"
                    type="text"
                    value={settings.general.organizationName}
                    onChange={(e) =>
                      handleSettingChange(
                        "general",
                        "organizationName",
                        e.target.value
                      )
                    }
                    disabled={saving} // Only disable when saving
                  />
                </div>
                <div>
                  <Label htmlFor="currency" className="mb-2 flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" /> Currency
                  </Label>
                  <Select
                    value={settings.general.currency}
                    onValueChange={(value) =>
                      handleSettingChange("general", "currency", value)
                    }
                    disabled={saving || !isAdmin} // Disable for non-admins
                  >
                    <SelectTrigger id="currency">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="KES">KES - Kenyan Shilling</SelectItem>
                      <SelectItem value="NGN">NGN - Nigerian Naira</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="timezone" className="mb-2 flex items-center">
                    <Globe className="h-4 w-4 mr-1" /> Timezone
                  </Label>
                  <Select
                    value={settings.general.timezone}
                    onValueChange={(value) =>
                      handleSettingChange("general", "timezone", value)
                    }
                    disabled={saving || !isAdmin} // Disable for non-admins
                  >
                    <SelectTrigger id="timezone">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC-5">
                        UTC-5 (Eastern Time)
                      </SelectItem>
                      <SelectItem value="UTC+0">UTC+0 (GMT)</SelectItem>
                      <SelectItem value="UTC+3">
                        UTC+3 (East Africa Time)
                      </SelectItem>
                      <SelectItem value="UTC+1">
                        UTC+1 (West Africa Time)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="language" className="mb-2 flex items-center">
                    <Info className="h-4 w-4 mr-1" /> Language
                  </Label>
                  <Select
                    value={settings.general.language}
                    onValueChange={(value) =>
                      handleSettingChange("general", "language", value)
                    }
                    disabled={saving || !isAdmin} // Disable for non-admins
                  >
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Spanish">Spanish</SelectItem>
                      <SelectItem value="French">French</SelectItem>
                      <SelectItem value="Swahili">Swahili</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label
                    htmlFor="dateFormat"
                    className="mb-2 flex items-center"
                  >
                    <Calendar className="h-4 w-4 mr-1" /> Date Format
                  </Label>
                  <Select
                    value={settings.general.dateFormat}
                    onValueChange={(value) =>
                      handleSettingChange("general", "dateFormat", value)
                    }
                    disabled={saving || !isAdmin} // Disable for non-admins
                  >
                    <SelectTrigger id="dateFormat">
                      <SelectValue placeholder="Select date format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </ContentCard>
          </PageSection>
        </TabsContent>

        {/* Loan Settings */}
        <TabsContent value="loan" className="mt-6">
          <PageSection title="Loan Settings">
            <ContentCard isLoading={loading}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label
                    htmlFor="defaultInterestRate"
                    className="mb-2 flex items-center"
                  >
                    <Percent className="h-4 w-4 mr-1" /> Default Interest Rate
                    (%)
                  </Label>
                  <Input
                    id="defaultInterestRate"
                    type="number"
                    step="0.1"
                    value={settings.loan.defaultInterestRate}
                    onChange={(e) =>
                      handleSettingChange(
                        "loan",
                        "defaultInterestRate",
                        parseFloat(e.target.value)
                      )
                    }
                    disabled={saving || !isAdmin} // Disable for non-admins
                  />
                </div>
                <div>
                  <Label
                    htmlFor="maxLoanAmount"
                    className="mb-2 flex items-center"
                  >
                    <DollarSign className="h-4 w-4 mr-1" /> Maximum Loan Amount
                  </Label>
                  <Input
                    id="maxLoanAmount"
                    type="number"
                    value={settings.loan.maxLoanAmount}
                    onChange={(e) =>
                      handleSettingChange(
                        "loan",
                        "maxLoanAmount",
                        parseInt(e.target.value)
                      )
                    }
                    disabled={saving || !isAdmin} // Disable for non-admins
                  />
                </div>
                <div>
                  <Label
                    htmlFor="minLoanAmount"
                    className="mb-2 flex items-center"
                  >
                    <DollarSign className="h-4 w-4 mr-1" /> Minimum Loan Amount
                  </Label>
                  <Input
                    id="minLoanAmount"
                    type="number"
                    value={settings.loan.minLoanAmount}
                    onChange={(e) =>
                      handleSettingChange(
                        "loan",
                        "minLoanAmount",
                        parseInt(e.target.value)
                      )
                    }
                    disabled={saving || !isAdmin} // Disable for non-admins
                  />
                </div>
                <div>
                  <Label
                    htmlFor="defaultLoanTerm"
                    className="mb-2 flex items-center"
                  >
                    <Clock className="h-4 w-4 mr-1" /> Default Loan Term
                    (months)
                  </Label>
                  <Input
                    id="defaultLoanTerm"
                    type="number"
                    value={settings.loan.defaultLoanTerm}
                    onChange={(e) =>
                      handleSettingChange(
                        "loan",
                        "defaultLoanTerm",
                        parseInt(e.target.value)
                      )
                    }
                    disabled={saving || !isAdmin} // Disable for non-admins
                  />
                </div>
                <div>
                  <Label
                    htmlFor="gracePeriod"
                    className="mb-2 flex items-center"
                  >
                    <Calendar className="h-4 w-4 mr-1" /> Grace Period (days)
                  </Label>
                  <Input
                    id="gracePeriod"
                    type="number"
                    value={settings.loan.gracePeriod}
                    onChange={(e) =>
                      handleSettingChange(
                        "loan",
                        "gracePeriod",
                        parseInt(e.target.value)
                      )
                    }
                    disabled={saving || !isAdmin} // Disable for non-admins
                  />
                </div>
                <div>
                  <Label htmlFor="lateFee" className="mb-2 flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" /> Late Fee ($)
                  </Label>
                  <Input
                    id="lateFee"
                    type="number"
                    value={settings.loan.lateFee}
                    onChange={(e) =>
                      handleSettingChange(
                        "loan",
                        "lateFee",
                        parseInt(e.target.value)
                      )
                    }
                    disabled={saving || !isAdmin} // Disable for non-admins
                  />
                </div>
              </div>
            </ContentCard>
          </PageSection>
        </TabsContent>

        {/* Savings Settings */}
        <TabsContent value="savings" className="mt-6">
          <PageSection title="Savings Settings">
            <ContentCard isLoading={loading}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label
                    htmlFor="savingsDefaultInterestRate"
                    className="mb-2 flex items-center"
                  >
                    <Percent className="h-4 w-4 mr-1" /> Default Interest Rate
                    (%)
                  </Label>
                  <Input
                    id="savingsDefaultInterestRate"
                    type="number"
                    step="0.1"
                    value={settings.savings.defaultInterestRate}
                    onChange={(e) =>
                      handleSettingChange(
                        "savings",
                        "defaultInterestRate",
                        parseFloat(e.target.value)
                      )
                    }
                    disabled={saving || !isAdmin} // Disable for non-admins
                  />
                </div>
                <div>
                  <Label
                    htmlFor="minBalance"
                    className="mb-2 flex items-center"
                  >
                    <DollarSign className="h-4 w-4 mr-1" /> Minimum Balance ($)
                  </Label>
                  <Input
                    id="minBalance"
                    type="number"
                    value={settings.savings.minBalance}
                    onChange={(e) =>
                      handleSettingChange(
                        "savings",
                        "minBalance",
                        parseInt(e.target.value)
                      )
                    }
                    disabled={saving || !isAdmin} // Disable for non-admins
                  />
                </div>
                <div>
                  <Label
                    htmlFor="withdrawalLimit"
                    className="mb-2 flex items-center"
                  >
                    <DollarSign className="h-4 w-4 mr-1" /> Daily Withdrawal
                    Limit ($)
                  </Label>
                  <Input
                    id="withdrawalLimit"
                    type="number"
                    value={settings.savings.withdrawalLimit}
                    onChange={(e) =>
                      handleSettingChange(
                        "savings",
                        "withdrawalLimit",
                        parseInt(e.target.value)
                      )
                    }
                    disabled={saving || !isAdmin} // Disable for non-admins
                  />
                </div>
                <div>
                  <Label
                    htmlFor="maintenanceFee"
                    className="mb-2 flex items-center"
                  >
                    <DollarSign className="h-4 w-4 mr-1" /> Monthly Maintenance
                    Fee ($)
                  </Label>
                  <Input
                    id="maintenanceFee"
                    type="number"
                    value={settings.savings.maintenanceFee}
                    onChange={(e) =>
                      handleSettingChange(
                        "savings",
                        "maintenanceFee",
                        parseInt(e.target.value)
                      )
                    }
                    disabled={saving || !isAdmin} // Disable for non-admins
                  />
                </div>
                <div>
                  <Label
                    htmlFor="compoundingFrequency"
                    className="mb-2 flex items-center"
                  >
                    <Clock className="h-4 w-4 mr-1" /> Interest Compounding
                  </Label>
                  <Select
                    value={settings.savings.compoundingFrequency}
                    onValueChange={(value) =>
                      handleSettingChange(
                        "savings",
                        "compoundingFrequency",
                        value
                      )
                    }
                    disabled={saving || !isAdmin} // Disable for non-admins
                  >
                    <SelectTrigger id="compoundingFrequency">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Daily">Daily</SelectItem>
                      <SelectItem value="Weekly">Weekly</SelectItem>
                      <SelectItem value="Monthly">Monthly</SelectItem>
                      <SelectItem value="Quarterly">Quarterly</SelectItem>
                      <SelectItem value="Annually">Annually</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </ContentCard>
          </PageSection>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="mt-6">
          <PageSection title="Notification Settings">
            <ContentCard isLoading={loading}>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 flex items-center">
                      <Mail className="h-4 w-4 mr-2" /> Email Notifications
                    </h3>
                    <p className="text-sm text-gray-500">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.emailNotifications}
                    onCheckedChange={(checked) =>
                      handleSettingChange(
                        "notifications",
                        "emailNotifications",
                        checked
                      )
                    }
                    disabled={saving || !isAdmin} // Disable for non-admins
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 flex items-center">
                      <MessageSquare className="h-4 w-4 mr-2" /> SMS
                      Notifications
                    </h3>
                    <p className="text-sm text-gray-500">
                      Receive notifications via SMS
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.smsNotifications}
                    onCheckedChange={(checked) =>
                      handleSettingChange(
                        "notifications",
                        "smsNotifications",
                        checked
                      )
                    }
                    disabled={saving || !isAdmin} // Disable for non-admins
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 flex items-center">
                      <Bell className="h-4 w-4 mr-2" /> Payment Reminders
                    </h3>
                    <p className="text-sm text-gray-500">
                      Send reminders for upcoming payments
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.paymentReminders}
                    onCheckedChange={(checked) =>
                      handleSettingChange(
                        "notifications",
                        "paymentReminders",
                        checked
                      )
                    }
                    disabled={saving || !isAdmin} // Disable for non-admins
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2" /> Overdue Alerts
                    </h3>
                    <p className="text-sm text-gray-500">
                      Alert for overdue payments
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.overdueAlerts}
                    onCheckedChange={(checked) =>
                      handleSettingChange(
                        "notifications",
                        "overdueAlerts",
                        checked
                      )
                    }
                    disabled={saving || !isAdmin} // Disable for non-admins
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 flex items-center">
                      <Activity className="h-4 w-4 mr-2" /> System Updates
                    </h3>
                    <p className="text-sm text-gray-500">
                      Receive notifications about system updates
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.systemUpdates}
                    onCheckedChange={(checked) =>
                      handleSettingChange(
                        "notifications",
                        "systemUpdates",
                        checked
                      )
                    }
                    disabled={saving || !isAdmin} // Disable for non-admins
                  />
                </div>
                <div>
                  <Label
                    htmlFor="reminderDays"
                    className="mb-2 flex items-center"
                  >
                    <Calendar className="h-4 w-4 mr-1" /> Payment Reminder Days
                  </Label>
                  <Input
                    id="reminderDays"
                    type="number"
                    value={settings.notifications.reminderDays}
                    onChange={(e) =>
                      handleSettingChange(
                        "notifications",
                        "reminderDays",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-32"
                    disabled={saving || !isAdmin} // Disable for non-admins
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Days before due date to send reminder
                  </p>
                </div>
              </div>
            </ContentCard>
          </PageSection>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="mt-6">
          <PageSection title="Security Settings">
            <ContentCard isLoading={loading}>
              <div className="space-y-6">
                <div>
                  <Label
                    htmlFor="sessionTimeout"
                    className="mb-2 flex items-center"
                  >
                    <Clock className="h-4 w-4 mr-1" /> Session Timeout (minutes)
                  </Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) =>
                      handleSettingChange(
                        "security",
                        "sessionTimeout",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-32"
                    disabled={saving || !isAdmin} // Disable for non-admins
                  />
                </div>
                <div>
                  <Label
                    htmlFor="passwordExpiry"
                    className="mb-2 flex items-center"
                  >
                    <Calendar className="h-4 w-4 mr-1" /> Password Expiry (days)
                  </Label>
                  <Input
                    id="passwordExpiry"
                    type="number"
                    value={settings.security.passwordExpiry}
                    onChange={(e) =>
                      handleSettingChange(
                        "security",
                        "passwordExpiry",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-32"
                    disabled={saving || !isAdmin} // Disable for non-admins
                  />
                </div>
                <div>
                  <Label
                    htmlFor="loginAttempts"
                    className="mb-2 flex items-center"
                  >
                    <UserCheck className="h-4 w-4 mr-1" /> Maximum Login
                    Attempts
                  </Label>
                  <Input
                    id="loginAttempts"
                    type="number"
                    value={settings.security.loginAttempts}
                    onChange={(e) =>
                      handleSettingChange(
                        "security",
                        "loginAttempts",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-32"
                    disabled={saving || !isAdmin} // Disable for non-admins
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 flex items-center">
                      <Lock className="h-4 w-4 mr-2" /> Two-Factor
                      Authentication
                    </h3>
                    <p className="text-sm text-gray-500">
                      Require 2FA for all users
                    </p>
                  </div>
                  <Switch
                    checked={settings.security.twoFactorAuth}
                    onCheckedChange={(checked) =>
                      handleSettingChange("security", "twoFactorAuth", checked)
                    }
                    disabled={saving || !isAdmin} // Disable for non-admins
                  />
                </div>
              </div>
            </ContentCard>
          </PageSection>
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog for Reset */}
      <AlertDialog open={showConfirmReset} onOpenChange={setShowConfirmReset}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Reset</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reset all settings to their default
              values? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmReset}>Reset</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
}
