import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Settings,
  Bell,
  Shield,
  Globe,
  Database,
  Save,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const SettingsPage = () => {
  const { getSettings, updateSettings, loading } = useApi();
  const { hasRole } = useAuth();
  const [settings, setSettings] = useState({
    app: {
      name: "Microfinance MIS",
      version: "1.0.0",
      maintenanceMode: false,
      maxFileSize: 5,
      allowedFileTypes: ["jpg", "png", "pdf", "doc", "docx"],
      sessionTimeout: 30,
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
      },
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      loanAlerts: true,
      paymentReminders: true,
      meetingReminders: true,
      systemUpdates: false,
    },
    security: {
      twoFactorAuth: false,
      loginAttempts: 5,
      lockoutDuration: 15,
      passwordExpiry: 90,
      sessionManagement: true,
      auditLogging: true,
    },
    system: {
      backupFrequency: "daily",
      backupRetention: 30,
      logLevel: "info",
      debugMode: false,
      autoUpdates: true,
    },
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const result = await getSettings();
      if (result.success) {
        setSettings(result.data);
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  };

  const handleSaveSettings = async (section) => {
    try {
      const result = await updateSettings({ [section]: settings[section] });
      if (result.success) {
        toast.success(`${section} settings updated successfully`);
      }
    } catch (error) {
      console.error("Failed to update settings:", error);
      toast.error("Failed to update settings");
    }
  };

  const handleInputChange = (section, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleNestedInputChange = (section, parent, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [parent]: {
          ...prev[section][parent],
          [field]: value,
        },
      },
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">
            Manage system and user preferences
          </p>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          {hasRole(["admin"]) && (
            <TabsTrigger value="system">System</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Application Settings</CardTitle>
              <CardDescription>
                Configure general application settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="appName">Application Name</Label>
                  <Input
                    id="appName"
                    value={settings.app.name}
                    onChange={(e) =>
                      handleInputChange("app", "name", e.target.value)
                    }
                    placeholder="Enter application name"
                  />
                </div>
                <div>
                  <Label htmlFor="version">Version</Label>
                  <Input
                    id="version"
                    value={settings.app.version}
                    onChange={(e) =>
                      handleInputChange("app", "version", e.target.value)
                    }
                    placeholder="Enter version"
                  />
                </div>
                <div>
                  <Label htmlFor="maxFileSize">Maximum File Size (MB)</Label>
                  <Input
                    id="maxFileSize"
                    type="number"
                    value={settings.app.maxFileSize}
                    onChange={(e) =>
                      handleInputChange(
                        "app",
                        "maxFileSize",
                        parseInt(e.target.value)
                      )
                    }
                    min="1"
                    max="50"
                  />
                </div>
                <div>
                  <Label htmlFor="sessionTimeout">
                    Session Timeout (minutes)
                  </Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.app.sessionTimeout}
                    onChange={(e) =>
                      handleInputChange(
                        "app",
                        "sessionTimeout",
                        parseInt(e.target.value)
                      )
                    }
                    min="5"
                    max="480"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                  <p className="text-sm text-gray-500">
                    Enable maintenance mode to restrict access during updates
                  </p>
                </div>
                <Switch
                  id="maintenanceMode"
                  checked={settings.app.maintenanceMode}
                  onCheckedChange={(checked) =>
                    handleInputChange("app", "maintenanceMode", checked)
                  }
                />
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-4">Password Policy</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minLength">Minimum Length</Label>
                    <Input
                      id="minLength"
                      type="number"
                      value={settings.app.passwordPolicy.minLength}
                      onChange={(e) =>
                        handleNestedInputChange(
                          "app",
                          "passwordPolicy",
                          "minLength",
                          parseInt(e.target.value)
                        )
                      }
                      min="6"
                      max="20"
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="requireUppercase">
                        Require Uppercase
                      </Label>
                      <Switch
                        id="requireUppercase"
                        checked={settings.app.passwordPolicy.requireUppercase}
                        onCheckedChange={(checked) =>
                          handleNestedInputChange(
                            "app",
                            "passwordPolicy",
                            "requireUppercase",
                            checked
                          )
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="requireLowercase">
                        Require Lowercase
                      </Label>
                      <Switch
                        id="requireLowercase"
                        checked={settings.app.passwordPolicy.requireLowercase}
                        onCheckedChange={(checked) =>
                          handleNestedInputChange(
                            "app",
                            "passwordPolicy",
                            "requireLowercase",
                            checked
                          )
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="requireNumbers">Require Numbers</Label>
                      <Switch
                        id="requireNumbers"
                        checked={settings.app.passwordPolicy.requireNumbers}
                        onCheckedChange={(checked) =>
                          handleNestedInputChange(
                            "app",
                            "passwordPolicy",
                            "requireNumbers",
                            checked
                          )
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="requireSpecialChars">
                        Require Special Characters
                      </Label>
                      <Switch
                        id="requireSpecialChars"
                        checked={
                          settings.app.passwordPolicy.requireSpecialChars
                        }
                        onCheckedChange={(checked) =>
                          handleNestedInputChange(
                            "app",
                            "passwordPolicy",
                            "requireSpecialChars",
                            checked
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => handleSaveSettings("app")}
                  disabled={loading}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure how you receive notifications and alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">
                  Notification Channels
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailNotifications">
                        Email Notifications
                      </Label>
                      <p className="text-sm text-gray-500">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch
                      id="emailNotifications"
                      checked={settings.notifications.emailNotifications}
                      onCheckedChange={(checked) =>
                        handleInputChange(
                          "notifications",
                          "emailNotifications",
                          checked
                        )
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="smsNotifications">
                        SMS Notifications
                      </Label>
                      <p className="text-sm text-gray-500">
                        Receive notifications via SMS
                      </p>
                    </div>
                    <Switch
                      id="smsNotifications"
                      checked={settings.notifications.smsNotifications}
                      onCheckedChange={(checked) =>
                        handleInputChange(
                          "notifications",
                          "smsNotifications",
                          checked
                        )
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="pushNotifications">
                        Push Notifications
                      </Label>
                      <p className="text-sm text-gray-500">
                        Receive push notifications in browser
                      </p>
                    </div>
                    <Switch
                      id="pushNotifications"
                      checked={settings.notifications.pushNotifications}
                      onCheckedChange={(checked) =>
                        handleInputChange(
                          "notifications",
                          "pushNotifications",
                          checked
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-4">Notification Types</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="loanAlerts">Loan Alerts</Label>
                      <p className="text-sm text-gray-500">
                        Notifications about loan status changes
                      </p>
                    </div>
                    <Switch
                      id="loanAlerts"
                      checked={settings.notifications.loanAlerts}
                      onCheckedChange={(checked) =>
                        handleInputChange(
                          "notifications",
                          "loanAlerts",
                          checked
                        )
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="paymentReminders">
                        Payment Reminders
                      </Label>
                      <p className="text-sm text-gray-500">
                        Reminders for upcoming payments
                      </p>
                    </div>
                    <Switch
                      id="paymentReminders"
                      checked={settings.notifications.paymentReminders}
                      onCheckedChange={(checked) =>
                        handleInputChange(
                          "notifications",
                          "paymentReminders",
                          checked
                        )
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="meetingReminders">
                        Meeting Reminders
                      </Label>
                      <p className="text-sm text-gray-500">
                        Reminders for scheduled meetings
                      </p>
                    </div>
                    <Switch
                      id="meetingReminders"
                      checked={settings.notifications.meetingReminders}
                      onCheckedChange={(checked) =>
                        handleInputChange(
                          "notifications",
                          "meetingReminders",
                          checked
                        )
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="systemUpdates">System Updates</Label>
                      <p className="text-sm text-gray-500">
                        Notifications about system updates
                      </p>
                    </div>
                    <Switch
                      id="systemUpdates"
                      checked={settings.notifications.systemUpdates}
                      onCheckedChange={(checked) =>
                        handleInputChange(
                          "notifications",
                          "systemUpdates",
                          checked
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => handleSaveSettings("notifications")}
                  disabled={loading}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure security preferences and authentication settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="loginAttempts">Maximum Login Attempts</Label>
                  <Input
                    id="loginAttempts"
                    type="number"
                    value={settings.security.loginAttempts}
                    onChange={(e) =>
                      handleInputChange(
                        "security",
                        "loginAttempts",
                        parseInt(e.target.value)
                      )
                    }
                    min="3"
                    max="10"
                  />
                </div>
                <div>
                  <Label htmlFor="lockoutDuration">
                    Lockout Duration (minutes)
                  </Label>
                  <Input
                    id="lockoutDuration"
                    type="number"
                    value={settings.security.lockoutDuration}
                    onChange={(e) =>
                      handleInputChange(
                        "security",
                        "lockoutDuration",
                        parseInt(e.target.value)
                      )
                    }
                    min="5"
                    max="60"
                  />
                </div>
                <div>
                  <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                  <Input
                    id="passwordExpiry"
                    type="number"
                    value={settings.security.passwordExpiry}
                    onChange={(e) =>
                      handleInputChange(
                        "security",
                        "passwordExpiry",
                        parseInt(e.target.value)
                      )
                    }
                    min="30"
                    max="365"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="twoFactorAuth">
                      Two-Factor Authentication
                    </Label>
                    <p className="text-sm text-gray-500">
                      Enable 2FA for additional security
                    </p>
                  </div>
                  <Switch
                    id="twoFactorAuth"
                    checked={settings.security.twoFactorAuth}
                    onCheckedChange={(checked) =>
                      handleInputChange("security", "twoFactorAuth", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sessionManagement">
                      Session Management
                    </Label>
                    <p className="text-sm text-gray-500">
                      Allow users to manage active sessions
                    </p>
                  </div>
                  <Switch
                    id="sessionManagement"
                    checked={settings.security.sessionManagement}
                    onCheckedChange={(checked) =>
                      handleInputChange(
                        "security",
                        "sessionManagement",
                        checked
                      )
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auditLogging">Audit Logging</Label>
                    <p className="text-sm text-gray-500">
                      Log user actions for security monitoring
                    </p>
                  </div>
                  <Switch
                    id="auditLogging"
                    checked={settings.security.auditLogging}
                    onCheckedChange={(checked) =>
                      handleInputChange("security", "auditLogging", checked)
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => handleSaveSettings("security")}
                  disabled={loading}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {hasRole(["admin"]) && (
          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>
                  Advanced system configuration and maintenance settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="backupFrequency">Backup Frequency</Label>
                    <Select
                      value={settings.system.backupFrequency}
                      onValueChange={(value) =>
                        handleInputChange("system", "backupFrequency", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="backupRetention">
                      Backup Retention (days)
                    </Label>
                    <Input
                      id="backupRetention"
                      type="number"
                      value={settings.system.backupRetention}
                      onChange={(e) =>
                        handleInputChange(
                          "system",
                          "backupRetention",
                          parseInt(e.target.value)
                        )
                      }
                      min="1"
                      max="365"
                    />
                  </div>
                  <div>
                    <Label htmlFor="logLevel">Log Level</Label>
                    <Select
                      value={settings.system.logLevel}
                      onValueChange={(value) =>
                        handleInputChange("system", "logLevel", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="error">Error</SelectItem>
                        <SelectItem value="warn">Warning</SelectItem>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="debug">Debug</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="debugMode">Debug Mode</Label>
                      <p className="text-sm text-gray-500">
                        Enable debug mode for development
                      </p>
                    </div>
                    <Switch
                      id="debugMode"
                      checked={settings.system.debugMode}
                      onCheckedChange={(checked) =>
                        handleInputChange("system", "debugMode", checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="autoUpdates">Auto Updates</Label>
                      <p className="text-sm text-gray-500">
                        Automatically install system updates
                      </p>
                    </div>
                    <Switch
                      id="autoUpdates"
                      checked={settings.system.autoUpdates}
                      onCheckedChange={(checked) =>
                        handleInputChange("system", "autoUpdates", checked)
                      }
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">System Actions</h3>
                  <div className="flex space-x-4">
                    <Button variant="outline">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Clear Cache
                    </Button>
                    <Button variant="outline">
                      <Database className="mr-2 h-4 w-4" />
                      Backup Now
                    </Button>
                    <Button variant="outline">
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      System Health
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={() => handleSaveSettings("system")}
                    disabled={loading}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {loading ? "Saving..." : "Save Settings"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default SettingsPage;
