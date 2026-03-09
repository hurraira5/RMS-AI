'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = "Something went wrong. Please try again later.";
      
      try {
        // Try to parse Firestore JSON error
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.error && parsed.error.includes('permission')) {
            errorMessage = "You don't have permission to perform this action. Please make sure you are logged in.";
          }
        }
      } catch (e) {
        // Not a JSON error, use default
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <div className="bg-white p-8 rounded-[32px] shadow-2xl shadow-red-100 max-w-md w-full text-center space-y-6 border border-red-50">
            <div className="bg-red-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-gray-900">Oops!</h2>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">
                {errorMessage}
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-red-100 hover:bg-red-700 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCcw className="w-5 h-5" />
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
