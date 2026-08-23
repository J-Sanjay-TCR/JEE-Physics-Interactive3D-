import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  AlertTriangle,
  RotateCcw,
  RefreshCw,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export interface ErrorBoundaryProps {
  children: ReactNode;
  onReset?: () => void;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class GlobalErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Three.js / Physics Studio Caught Runtime Exception:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleRecoverAndReset = () => {
    // 1. Clear any transient simulation or corrupt parameter cache
    try {
      sessionStorage.removeItem('current_sim_params');
      sessionStorage.removeItem('active_concept_id');
    } catch {
      // Ignore storage errors
    }

    // 2. Call optional reset callback from App
    if (this.props.onReset) {
      this.props.onReset();
    }

    // 3. Reset internal error boundary state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
  };

  handleHardRefresh = () => {
    try {
      sessionStorage.clear();
    } catch {
      // Ignore
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#07070A] text-white flex items-center justify-center p-4 sm:p-6 select-none font-sans">
          <div className="max-w-xl w-full bg-[#11121C] border border-rose-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-rose-950/40 relative overflow-hidden backdrop-blur-xl animate-fadeIn">
            {/* Ambient Background Glow */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Error Header */}
            <div className="flex items-start gap-4 mb-6 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0 shadow-lg shadow-rose-500/10">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    WebGL / Runtime Exception
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                  Simulation Pipeline Interrupted
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  An unexpected numerical overflow or WebGL render buffer error occurred.
                  Your JEE physics progress is safe.
                </p>
              </div>
            </div>

            {/* Recovery Action Card */}
            <div className="bg-[#171829] border border-white/[0.08] rounded-2xl p-4 sm:p-5 mb-6 space-y-3 relative z-10">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Instant Self-Healing Recovery</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Clicking <strong className="text-white">"Recover & Reset"</strong> resets the 3D physics scene, normalizes parameter bounds, restarts the simulation loop, and restores standard canonical presets without losing your page session.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2">
                <button
                  id="recover-reset-btn"
                  onClick={this.handleRecoverAndReset}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-98 transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Recover & Reset Simulation</span>
                </button>

                <button
                  onClick={this.handleHardRefresh}
                  className="px-4 py-3 rounded-xl bg-[#1F2138] hover:bg-[#282B49] text-zinc-200 hover:text-white border border-white/[0.1] text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition active:scale-98"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Full Refresh</span>
                </button>
              </div>
            </div>

            {/* Error Diagnostics Toggle */}
            <div className="relative z-10">
              <button
                onClick={() => this.setState((prev) => ({ showDetails: !prev.showDetails }))}
                className="w-full flex items-center justify-between text-xs text-zinc-400 hover:text-zinc-200 py-1.5 transition"
              >
                <span className="font-mono text-[11px]">Technical Diagnostics & Stack</span>
                {this.state.showDetails ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>

              {this.state.showDetails && (
                <div className="mt-2 p-3 bg-[#0A0A0F] border border-white/[0.06] rounded-xl text-[11px] font-mono text-rose-300/90 max-h-40 overflow-y-auto space-y-2 select-text">
                  <div className="font-bold text-rose-400">
                    {this.state.error?.toString()}
                  </div>
                  {this.state.errorInfo?.componentStack && (
                    <pre className="text-[10px] text-zinc-500 whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
