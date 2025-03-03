'use client';

import React, { Component, ErrorInfo } from 'react';
import { getBaseUrl } from '@/lib/utils/urlUtils';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    // Clear any stored state that might be causing issues
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.error('Error clearing storage:', e);
    }
    
    // Reset the error boundary state
    this.setState({
      hasError: false,
      error: null
    });
    
    // Redirect to home page
    window.location.href = getBaseUrl('/');
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Something went wrong!</h1>
            <p className="text-gray-600 mb-2">We apologize for the inconvenience.</p>
            <p className="text-sm text-gray-500 mb-8">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <div className="space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                Try again
              </button>
              <button
                onClick={this.handleReset}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
} 