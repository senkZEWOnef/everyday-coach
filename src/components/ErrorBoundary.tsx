"use client";
import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="card p-8 text-center space-y-6">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
              
              <div className="space-y-2">
                <h1 className="text-xl font-semibold">Something went wrong</h1>
                <p className="text-white/60 text-sm">
                  We&apos;re sorry, but something unexpected happened. Please try refreshing the page or go back to the homepage.
                </p>
              </div>

              {process.env.NODE_ENV === "development" && this.state.error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-left">
                  <h3 className="font-medium text-red-400 mb-2">Error Details:</h3>
                  <pre className="text-xs text-red-300 overflow-auto max-h-32">
                    {this.state.error.toString()}
                  </pre>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={this.handleReset}
                  className="btn-ghost flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </button>
                <button
                  onClick={this.handleReload}
                  className="btn-ghost flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reload Page
                </button>
                <button
                  onClick={this.handleHome}
                  className="btn-primary flex-1"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    console.error("Error in component:", error, errorInfo);
    // You could send to error reporting service here
  };
}