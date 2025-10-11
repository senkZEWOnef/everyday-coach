"use client";
import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="card p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-xl font-semibold">Oops! Something went wrong</h1>
            <p className="text-white/60 text-sm">
              We encountered an unexpected error. Please try again or return to the homepage.
            </p>
          </div>

          {process.env.NODE_ENV === "development" && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-left">
              <h3 className="font-medium text-red-400 mb-2">Error Details:</h3>
              <pre className="text-xs text-red-300 overflow-auto max-h-32">
                {error.message}
              </pre>
              {error.digest && (
                <p className="text-xs text-red-400 mt-2">Error ID: {error.digest}</p>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={reset}
              className="btn-primary flex-1"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </button>
            <button
              onClick={() => window.location.href = "/"}
              className="btn-ghost flex-1"
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