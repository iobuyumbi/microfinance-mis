import React from "react";
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: Date.now().toString(36) + Math.random().toString(36).substr(2),
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error("Error Boundary caught an error:", error, errorInfo);
    }

    // Log error to external service in production
    if (import.meta.env.PROD) {
      this.logErrorToService(error, errorInfo);
    }

    this.setState({
      errorInfo,
    });
  }

  logErrorToService = (error, errorInfo) => {
    // TODO: Implement error logging service (e.g., Sentry, LogRocket)
    // Example:
    // Sentry.captureException(error, {
    //   extra: errorInfo,
    //   tags: {
    //     errorId: this.state.errorId,
    //     component: this.props.componentName || 'Unknown',
    //   },
    // });
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  handleGoBack = () => {
    window.history.back();
  };

  render() {
    if (this.state.hasError) {
      const { error, errorId } = this.state;
      const { fallback: FallbackComponent, showDetails = false } = this.props;

      // Custom fallback component
      if (FallbackComponent) {
        return (
          <FallbackComponent
            error={error}
            errorId={errorId}
            onRetry={this.handleRetry}
          />
        );
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Something went wrong
              </CardTitle>
              <CardDescription className="text-gray-600">
                We're sorry, but something unexpected happened. Please try
                again.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Error ID for debugging */}
              {errorId && (
                <div className="text-xs text-gray-500 text-center">
                  Error ID: {errorId}
                </div>
              )}

              {/* Error details in development */}
              {import.meta.env.DEV && showDetails && error && (
                <details className="text-xs bg-gray-100 p-3 rounded">
                  <summary className="cursor-pointer font-medium mb-2">
                    Error Details (Development)
                  </summary>
                  <pre className="whitespace-pre-wrap text-red-600">
                    {error.toString()}
                  </pre>
                  {this.state.errorInfo && (
                    <pre className="whitespace-pre-wrap text-gray-600 mt-2">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </details>
              )}

              {/* Action buttons */}
              <div className="flex flex-col space-y-2">
                <Button onClick={this.handleRetry} className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={this.handleGoBack}
                    className="flex-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Go Back
                  </Button>
                  <Button
                    variant="outline"
                    onClick={this.handleGoHome}
                    className="flex-1"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Home
                  </Button>
                </div>
              </div>

              {/* Contact support */}
              <div className="text-center text-sm text-gray-500">
                If the problem persists, please{" "}
                <button
                  onClick={() => {
                    // TODO: Implement contact support functionality
                    console.log("Contact support clicked");
                  }}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  contact support
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook-based error boundary for functional components
export const useErrorHandler = () => {
  const [error, setError] = React.useState(null);

  const handleError = React.useCallback((error) => {
    console.error("Error caught by useErrorHandler:", error);
    setError(error);
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  return { error, handleError, clearError };
};

// Higher-order component for error boundaries
export const withErrorBoundary = (Component, options = {}) => {
  const WrappedComponent = (props) => (
    <ErrorBoundary {...options}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Error boundary for specific error types
export const NetworkErrorBoundary = ({ children }) => (
  <ErrorBoundary
    fallback={({ error, onRetry }) => (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
            <CardTitle className="text-xl font-semibold text-gray-900">
              Network Error
            </CardTitle>
            <CardDescription className="text-gray-600">
              Unable to connect to the server. Please check your internet
              connection.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={onRetry} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry Connection
            </Button>
          </CardContent>
        </Card>
      </div>
    )}
  >
    {children}
  </ErrorBoundary>
);

export default ErrorBoundary;
