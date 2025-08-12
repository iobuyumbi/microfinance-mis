import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Slider } from "../components/ui/slider";
import { toast } from "sonner";
import { Settings, Save, RotateCcw, Globe, Coins, PiggyBank, Bell, Shield, Loader2 } from "lucide-react";
import { settingsService } from "../services/settingsService";
import { useAuth } from "../context/AuthContext";

const SettingsPage = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsService.get();
      setSettings(response.data.data);
    } catch (error) {
      toast.error("Failed to load settings");
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!isAdmin) {
      toast.error("Only administrators can update settings");
      return;
    }

    try {
      setSaving(true);
      await settingsService.update(settings);
      toast.success("Settings updated successfully");
    } catch (error) {
      toast.error("Failed to update settings");
      console.error("Error updating settings:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleResetSettings = async () => {
    if (!isAdmin) {
      toast.error("Only administrators can reset settings");
      return;
    }

    if (!confirm("Are you sure you want to reset all settings to default values? This action cannot be undone.")) {
      return;
    }

    try {
      setSaving(true);
      await settingsService.reset();
      toast.success("Settings reset to defaults");
      fetchSettings();
    } catch (error) {
      toast.error("Failed to reset settings");
      console.error("Error resetting settings:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage system settings and configurations
          </p>
        </div>
        <div className="flex space-x-2">
          {isAdmin && (
            <>
              <Button variant="outline" onClick={handleResetSettings} disabled={saving}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset Defaults
              </Button>
              <Button onClick={handleSaveSettings} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Changes
              </Button>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Settings
          </CardTitle>
          <CardDescription>
            Configure system parameters and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 mb-8">
              <TabsTrigger value="general" className="flex items-center">
                <Globe className="mr-2 h-4 w-4" />
                General
              </TabsTrigger>
              <TabsTrigger value="loan" className="flex items-center">
                <Coins className="mr-2 h-4 w-4" />
                Loan
              </TabsTrigger>
              <TabsTrigger value="savings" className="flex items-center">
                <PiggyBank className="mr-2 h-4 w-4" />
                Savings
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center">
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center">
                <Shield className="mr-2 h-4 w-4" />
                Security
              </TabsTrigger>
            </TabsList>

            {/* General Settings */}
            <TabsContent value="general" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="organizationName">Organization Name</Label>
                  <Input
                    id="organizationName"
                    value={settings?.general?.organizationName || ''}
                    onChange={(e) => handleChange('general', 'organizationName', e.target.value)}
                    disabled={!isAdmin}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={settings?.general?.currency || 'KES'}
                    onValueChange={(value) => handleChange('general', 'currency', value)}
                    disabled={!isAdmin}
                  >
                    <SelectTrigger id="currency">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KES">Kenyan Shilling (KES)</SelectItem>
                      <SelectItem value="USD">US Dollar (USD)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                      <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                      <SelectItem value="TZS">Tanzanian Shilling (TZS)</SelectItem>
                      <SelectItem value="UGX">Ugandan Shilling (UGX)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={settings?.general?.timezone || 'Africa/Nairobi'}
                    onValueChange={(value) => handleChange('general', 'timezone', value)}
                    disabled={!isAdmin}
                  >
                    <SelectTrigger id="timezone">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Africa/Nairobi">East Africa Time (EAT)</SelectItem>
                      <SelectItem value="Africa/Lagos">West Africa Time (WAT)</SelectItem>
                      <SelectItem value="Africa/Cairo">Eastern European Time (EET)</SelectItem>
                      <SelectItem value="Europe/London">Greenwich Mean Time (GMT)</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={settings?.general?.language || 'English'}
                    onValueChange={(value) => handleChange('general', 'language', value)}
                    disabled={!isAdmin}
                  >
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Swahili">Swahili</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select
                    value={settings?.general?.dateFormat || 'DD/MM/YYYY'}
                    onValueChange={(value) => handleChange('general', 'dateFormat', value)}
                    disabled={!isAdmin}
                  >
                    <SelectTrigger id="dateFormat">
                      <SelectValue placeholder="Select date format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Loan Settings */}
            <TabsContent value="loan" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="defaultInterestRate">Default Interest Rate (%)</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="defaultInterestRate"
                      type="number"
                      value={settings?.loan?.defaultInterestRate || 0}
                      onChange={(e) => handleChange('loan', 'defaultInterestRate', parseFloat(e.target.value))}
                      disabled={!isAdmin}
                    />
                    <span>%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxLoanAmount">Maximum Loan Amount</Label>
                  <Input
                    id="maxLoanAmount"
                    type="number"
                    value={settings?.loan?.maxLoanAmount || 0}
                    onChange={(e) => handleChange('loan', 'maxLoanAmount', parseFloat(e.target.value))}
                    disabled={!isAdmin}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minLoanAmount">Minimum Loan Amount</Label>
                  <Input
                    id="minLoanAmount"
                    type="number"
                    value={settings?.loan?.minLoanAmount || 0}
                    onChange={(e) => handleChange('loan', 'minLoanAmount', parseFloat(e.target.value))}
                    disabled={!isAdmin}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultLoanTerm">Default Loan Term (months)</Label>
                  <Input
                    id="defaultLoanTerm"
                    type="number"
                    value={settings?.loan?.defaultLoanTerm || 0}
                    onChange={(e) => handleChange('loan', 'defaultLoanTerm', parseInt(e.target.value))}
                    disabled={!isAdmin}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gracePeriod">Grace Period (days)</Label>
                  <Input
                    id="gracePeriod"
                    type="number"
                    value={settings?.loan?.gracePeriod || 0}
                    onChange={(e) => handleChange('loan', 'gracePeriod', parseInt(e.target.value))}
                    disabled={!isAdmin}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lateFee">Late Fee</Label>
                  <Input
                    id="lateFee"
                    type="number"
                    value={settings?.loan?.lateFee || 0}
                    onChange={(e) => handleChange('loan', 'lateFee', parseFloat(e.target.value))}
                    disabled={!isAdmin}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Savings Settings */}
            <TabsContent value="savings" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="savingsInterestRate">Interest Rate (%)</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="savingsInterestRate"
                      type="number"
                      value={settings?.savings?.defaultInterestRate || 0}
                      onChange={(e) => handleChange('savings', 'defaultInterestRate', parseFloat(e.target.value))}
                      disabled={!isAdmin}
                    />
                    <span>%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minBalance">Minimum Balance</Label>
                  <Input
                    id="minBalance"
                    type="number"
                    value={settings?.savings?.minBalance || 0}
                    onChange={(e) => handleChange('savings', 'minBalance', parseFloat(e.target.value))}
                    disabled={!isAdmin}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="withdrawalLimit">Withdrawal Limit</Label>
                  <Input
                    id="withdrawalLimit"
                    type="number"
                    value={settings?.savings?.withdrawalLimit || 0}
                    onChange={(e) => handleChange('savings', 'withdrawalLimit', parseFloat(e.target.value))}
                    disabled={!isAdmin}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maintenanceFee">Maintenance Fee</Label>
                  <Input
                    id="maintenanceFee"
                    type="number"
                    value={settings?.savings?.maintenanceFee || 0}
                    onChange={(e) => handleChange('savings', 'maintenanceFee', parseFloat(e.target.value))}
                    disabled={!isAdmin}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="compoundingFrequency">Compounding Frequency</Label>
                  <Select
                    value={settings?.savings?.compoundingFrequency || 'Monthly'}
                    onValueChange={(value) => handleChange('savings', 'compoundingFrequency', value)}
                    disabled={!isAdmin}
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
            </TabsContent>

            {/* Notifications Settings */}
            <TabsContent value="notifications" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={settings?.notifications?.emailNotifications || false}
                    onCheckedChange={(checked) => handleChange('notifications', 'emailNotifications', checked)}
                    disabled={!isAdmin}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="smsNotifications">SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                  </div>
                  <Switch
                    id="smsNotifications"
                    checked={settings?.notifications?.smsNotifications || false}
                    onCheckedChange={(checked) => handleChange('notifications', 'smsNotifications', checked)}
                    disabled={!isAdmin}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="paymentReminders">Payment Reminders</Label>
                    <p className="text-sm text-muted-foreground">Receive reminders for upcoming payments</p>
                  </div>
                  <Switch
                    id="paymentReminders"
                    checked={settings?.notifications?.paymentReminders || false}
                    onCheckedChange={(checked) => handleChange('notifications', 'paymentReminders', checked)}
                    disabled={!isAdmin}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="overdueAlerts">Overdue Alerts</Label>
                    <p className="text-sm text-muted-foreground">Receive alerts for overdue payments</p>
                  </div>
                  <Switch
                    id="overdueAlerts"
                    checked={settings?.notifications?.overdueAlerts || false}
                    onCheckedChange={(checked) => handleChange('notifications', 'overdueAlerts', checked)}
                    disabled={!isAdmin}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="systemUpdates">System Updates</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications about system updates</p>
                  </div>
                  <Switch
                    id="systemUpdates"
                    checked={settings?.notifications?.systemUpdates || false}
                    onCheckedChange={(checked) => handleChange('notifications', 'systemUpdates', checked)}
                    disabled={!isAdmin}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reminderDays">Reminder Days Before Due Date</Label>
                  <Input
                    id="reminderDays"
                    type="number"
                    value={settings?.notifications?.reminderDays || 0}
                    onChange={(e) => handleChange('notifications', 'reminderDays', parseInt(e.target.value))}
                    disabled={!isAdmin}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Security Settings */}
            <TabsContent value="security" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings?.security?.sessionTimeout || 0}
                    onChange={(e) => handleChange('security', 'sessionTimeout', parseInt(e.target.value))}
                    disabled={!isAdmin}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                  <Input
                    id="passwordExpiry"
                    type="number"
                    value={settings?.security?.passwordExpiry || 0}
                    onChange={(e) => handleChange('security', 'passwordExpiry', parseInt(e.target.value))}
                    disabled={!isAdmin}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Require 2FA for all users</p>
                  </div>
                  <Switch
                    id="twoFactorAuth"
                    checked={settings?.security?.twoFactorAuth || false}
                    onCheckedChange={(checked) => handleChange('security', 'twoFactorAuth', checked)}
                    disabled={!isAdmin}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loginAttempts">Max Login Attempts</Label>
                  <Input
                    id="loginAttempts"
                    type="number"
                    value={settings?.security?.loginAttempts || 0}
                    onChange={(e) => handleChange('security', 'loginAttempts', parseInt(e.target.value))}
                    disabled={!isAdmin}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auditLog">Audit Logging</Label>
                    <p className="text-sm text-muted-foreground">Enable detailed audit logs</p>
                  </div>
                  <Switch
                    id="auditLog"
                    checked={settings?.security?.auditLog || false}
                    onCheckedChange={(checked) => handleChange('security', 'auditLog', checked)}
                    disabled={!isAdmin}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {!isAdmin && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-md">
          <p className="text-yellow-800 dark:text-yellow-400 text-sm">
            Note: Only administrators can modify system settings. Please contact your system administrator for any changes.
          </p>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
