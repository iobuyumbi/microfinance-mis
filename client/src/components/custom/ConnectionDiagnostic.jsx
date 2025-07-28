// src/components/custom/ConnectionDiagnostic.jsx
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { healthService } from "@/services/healthService";
import { toast } from "sonner";

// Lucide React Icons
import {
  Wifi,
  WifiOff,
  Server,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Settings,
} from "lucide-react";

export default function ConnectionDiagnostic() {
  const [diagnostics, setDiagnostics] = useState({
    server: null,
    auth: null,
    public: null,
  });
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    try {
      const [serverHealth, publicAccess, authStatus] = await Promise.all([
        healthService.checkHealth(),
        healthService.checkPublicAccess(),
        healthService.testAuth(),
      ]);

      setDiagnostics({
        server: serverHealth,
        public: publicAccess,
        auth: authStatus,
      });

      // Show summary toast
      const allHealthy = [serverHealth, publicAccess, authStatus].every(
        (d) =>
          d.status === "healthy" ||
          d.status === "accessible" ||
          d.status === "authenticated"
      );

      if (allHealthy) {
        toast.success("All connections are healthy!");
      } else {
        toast.error("Some connection issues detected. Check details below.");
      }
    } catch (error) {
      toast.error("Failed to run diagnostics");
      console.error("Diagnostic error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case "healthy":
      case "accessible":
      case "authenticated":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "unhealthy":
      case "inaccessible":
      case "auth-failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "no-token":
        return <Settings className="h-4 w-4 text-yellow-500" />;
      default:
        return <WifiOff className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "healthy":
      case "accessible":
      case "authenticated":
        return "bg-green-100 text-green-800 border-green-200";
      case "unhealthy":
      case "inaccessible":
      case "auth-failed":
        return "bg-red-100 text-red-800 border-red-200";
      case "no-token":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "healthy":
        return "Server Healthy";
      case "unhealthy":
        return "Server Unhealthy";
      case "accessible":
        return "Public Access OK";
      case "inaccessible":
        return "Public Access Failed";
      case "authenticated":
        return "Authentication OK";
      case "auth-failed":
        return "Authentication Failed";
      case "no-token":
        return "No Token Found";
      default:
        return "Unknown Status";
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Server className="h-5 w-5" />
          <span>Connection Diagnostic</span>
          <Button
            variant="outline"
            size="sm"
            onClick={runDiagnostics}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              {getStatusIcon(diagnostics.server?.status)}
            </div>
            <Badge className={getStatusColor(diagnostics.server?.status)}>
              {getStatusText(diagnostics.server?.status)}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">Server</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              {getStatusIcon(diagnostics.public?.status)}
            </div>
            <Badge className={getStatusColor(diagnostics.public?.status)}>
              {getStatusText(diagnostics.public?.status)}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">Public API</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              {getStatusIcon(diagnostics.auth?.status)}
            </div>
            <Badge className={getStatusColor(diagnostics.auth?.status)}>
              {getStatusText(diagnostics.auth?.status)}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">Authentication</p>
          </div>
        </div>

        {/* Details Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDetails(!showDetails)}
          className="w-full"
        >
          {showDetails ? "Hide Details" : "Show Details"}
        </Button>

        {/* Detailed Information */}
        {showDetails && (
          <div className="space-y-3 text-sm">
            <div className="border rounded-lg p-3">
              <h4 className="font-medium mb-2">Server Health</h4>
              <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                {JSON.stringify(diagnostics.server, null, 2)}
              </pre>
            </div>

            <div className="border rounded-lg p-3">
              <h4 className="font-medium mb-2">Public Access</h4>
              <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                {JSON.stringify(diagnostics.public, null, 2)}
              </pre>
            </div>

            <div className="border rounded-lg p-3">
              <h4 className="font-medium mb-2">Authentication</h4>
              <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                {JSON.stringify(diagnostics.auth, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Troubleshooting Tips */}
        {(diagnostics.server?.status === "unhealthy" ||
          diagnostics.public?.status === "inaccessible") && (
          <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-3">
            <h4 className="font-medium text-yellow-800 mb-2">
              Troubleshooting Tips:
            </h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Ensure the backend server is running on port 5000</li>
              <li>
                • Check if the server URL is correct in your environment
                variables
              </li>
              <li>• Verify CORS settings on the backend</li>
              <li>• Check server logs for any error messages</li>
            </ul>
          </div>
        )}

        {diagnostics.auth?.status === "auth-failed" && (
          <div className="border border-red-200 bg-red-50 rounded-lg p-3">
            <h4 className="font-medium text-red-800 mb-2">
              Authentication Issues:
            </h4>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Your session may have expired - try logging in again</li>
              <li>• Check if the authentication token is valid</li>
              <li>• Verify the backend authentication endpoints are working</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
