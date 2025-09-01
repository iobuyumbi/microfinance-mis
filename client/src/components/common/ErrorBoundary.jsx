
import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { 
      hasError: true,
      errorId: Date.now().toString(36) + Math.random().toString(36).substr(2)
    };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // You could also log the error to an error reporting service here
    // errorService.logError(error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  };

  render() {
    if (this.state.hasError) {
      const isNetworkError = this.state.error?.message?.includes('Network') || 
                           this.state.error?.message?.includes('fetch');
      
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-12 w-12 text-destructive" />
              </div>
              <CardTitle className="text-xl">
                {isNetworkError ? 'Connection Error' : 'Something went wrong'}
              </CardTitle>
              <CardDescription>
                {isNetworkError 
                  ? 'Unable to connect to the server. Please check your internet connection.'
                  : 'An unexpected error occurred. Our team has been notified.'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === 'development' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="text-sm font-medium text-red-800 mb-2">
                    Debug Information (Development Only)
                  </div>
                  <div className="text-xs text-red-700 font-mono">
                    <div className="mb-1">
                      <strong>Error:</strong> {this.state.error?.toString()}
                    </div>
                    <div className="mb-1">
                      <strong>Error ID:</strong> {this.state.errorId}
                    </div>
                    {this.state.errorInfo?.componentStack && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="mt-1 text-xs overflow-auto max-h-32">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex flex-col space-y-2">
                <Button onClick={this.handleRetry} className="w-full">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                <Button 
                  variant="outline" 
                  onClick={this.handleReload} 
                  className="w-full"
                >
                  Reload Page
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={this.handleGoHome} 
                  className="w-full"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Go to Dashboard
                </Button>
              </div>

              {!isNetworkError && (
                <div className="text-center text-sm text-muted-foreground">
                  Error ID: {this.state.errorId}
                  <br />
                  Please include this ID when reporting the issue.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
