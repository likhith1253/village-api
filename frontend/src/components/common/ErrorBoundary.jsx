import React, { Component } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
          <div className="max-w-md w-full bg-background-card border border-border/80 rounded-xl p-8 text-center">
            <div className="h-12 w-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mx-auto mb-4">
              <AlertCircle size={24} />
            </div>
            <h2 className="text-lg font-bold text-text-primary mb-2">Something went wrong</h2>
            <p className="text-sm text-text-secondary mb-6">
              The application encountered an unexpected error. Please refresh the page to try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-lg transition-colors"
            >
              <RefreshCw size={16} />
              <span>Refresh Page</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
