import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import { Button } from "./Button";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  componentStack: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    componentStack: "",
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, componentStack: "" };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ componentStack: errorInfo.componentStack || "" });
    console.error("Uncaught error:", error, errorInfo.componentStack);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 m-6">
          <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-6">
            <AlertTriangle size={40} />
          </div>
          <h2 className="text-2xl font-display font-bold text-white mb-2">Protocol Failure</h2>
          <p className="text-white/40 max-w-md mb-8">
            An unexpected error occurred in the mesh synchronization. The node might be temporarily offline or corrupted.
          </p>
          <div className="flex gap-4">
            <Button 
                variant="premium" 
                onClick={() => window.location.reload()}
                className="rounded-xl px-6"
            >
                <RefreshCcw size={16} className="mr-2" /> REBOOT SYSTEM
            </Button>
            <Button 
                variant="glass" 
                onClick={() => window.location.href = '/'}
                className="rounded-xl px-6"
            >
                <Home size={16} className="mr-2" /> RETURN HOME
            </Button>
          </div>
          {process.env.NODE_ENV === 'development' && (
              <pre className="mt-8 p-4 bg-black/40 rounded-xl text-left text-[10px] text-red-400 overflow-auto max-w-full">
                  {this.state.error?.message}
                  {this.state.error?.stack}
                  {this.state.componentStack}
              </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
