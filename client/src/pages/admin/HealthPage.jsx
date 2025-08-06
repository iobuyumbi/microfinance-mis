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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Heart,
  Activity,
  Shield,
  Wifi,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { healthService } from "@/services/healthService";
import { toast } from "sonner";
import { formatDate } from "@/utils/formatters";

const AdminHealthPage = () => {
  const [healthStatus, setHealthStatus] = useState(null);
  const [publicAccess, setPublicAccess] = useState(null);
  const [authStatus, setAuthStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all health checks
  const fetchHealthStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const [health, publicAccessResult, authResult] = await Promise.all([
        healthService.checkHealth(),
        healthService.checkPublicAccess(),
        healthService.testAuth(),
      ]);

      setHealthStatus(health);
      setPublicAccess(publicAccessResult);
      setAuthStatus(authResult);
    } catch (err) {
      setError("Failed to load health status");
      toast.error("Failed to load health status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthStatus();
  }, []);

  // Handle refresh
  const handleRefresh = async () => {
    await fetchHealthStatus();
    toast.success("Health status refreshed");
  };

  const getStatusBadge = (status) => {
    const variants = {
      healthy: "default",
      unhealthy: "destructive",
      accessible: "default",
      inaccessible: "destructive",
      authenticated: "default",
      "auth-failed": "destructive",
      "no-token": "secondary",
    };

    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const getStatusIcon = (status) => {
    const icons = {
      healthy: Heart,
      unhealthy: Activity,
      accessible: Wifi,
      inaccessible: Activity,
      authenticated: Shield,
      "auth-failed": Activity,
      "no-token": Activity,
    };

    const IconComponent = icons[status] || Activity;
    return <IconComponent className="h-4 w-4" />;
  };

  if (loading && !healthStatus) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Checking system health...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchHealthStatus}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Health</h1>
          <p className="text-muted-foreground">
            Monitor system status and performance
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={loading}>
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              System Health
            </CardTitle>
            <CardDescription>Overall system status</CardDescription>
          </CardHeader>
          <CardContent>
            {healthStatus ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  {getStatusBadge(healthStatus.status)}
                </div>
                {healthStatus.data && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uptime:</span>
                      <span>{healthStatus.data.uptime || "N/A"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Version:</span>
                      <span>{healthStatus.data.version || "N/A"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Environment:</span>
                      <span>{healthStatus.data.environment || "N/A"}</span>
                    </div>
                  </div>
                )}
                {healthStatus.error && (
                  <Alert>
                    <AlertDescription>{healthStatus.error}</AlertDescription>
                  </Alert>
                )}
                <div className="text-xs text-muted-foreground">
                  Last checked: {formatDate(new Date(healthStatus.timestamp))}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
                <p>Checking system health...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Public Access */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="h-5 w-5" />
              Public Access
            </CardTitle>
            <CardDescription>Public API accessibility</CardDescription>
          </CardHeader>
          <CardContent>
            {publicAccess ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  {getStatusBadge(publicAccess.status)}
                </div>
                {publicAccess.data && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Status:</span>
                      <span>{publicAccess.data.status || "N/A"}</span>
                    </div>
                  </div>
                )}
                {publicAccess.error && (
                  <Alert>
                    <AlertDescription>{publicAccess.error}</AlertDescription>
                  </Alert>
                )}
                <div className="text-xs text-muted-foreground">
                  Last checked: {formatDate(new Date(publicAccess.timestamp))}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
                <p>Checking public access...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Authentication */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Authentication
            </CardTitle>
            <CardDescription>User authentication status</CardDescription>
          </CardHeader>
          <CardContent>
            {authStatus ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  {getStatusBadge(authStatus.status)}
                </div>
                {authStatus.data && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>User:</span>
                      <span>{authStatus.data.name || "N/A"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Role:</span>
                      <span>{authStatus.data.role || "N/A"}</span>
                    </div>
                  </div>
                )}
                {authStatus.error && (
                  <Alert>
                    <AlertDescription>{authStatus.error}</AlertDescription>
                  </Alert>
                )}
                {authStatus.message && (
                  <Alert>
                    <AlertDescription>{authStatus.message}</AlertDescription>
                  </Alert>
                )}
                <div className="text-xs text-muted-foreground">
                  Last checked: {formatDate(new Date(authStatus.timestamp))}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
                <p>Checking authentication...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Information */}
      {healthStatus?.data && (
        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
            <CardDescription>Detailed system information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(healthStatus.data).map(([key, value]) => (
                <div key={key}>
                  <label className="text-sm font-medium text-muted-foreground capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </label>
                  <p className="text-sm font-medium">{value || "N/A"}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminHealthPage;
