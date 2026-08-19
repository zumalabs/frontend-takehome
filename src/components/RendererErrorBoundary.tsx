import { Component, type ErrorInfo, type ReactNode } from 'react';

interface RendererErrorBoundaryProps {
  children: ReactNode;
}

interface RendererErrorBoundaryState {
  error: Error | null;
}

export class RendererErrorBoundary extends Component<
  RendererErrorBoundaryProps,
  RendererErrorBoundaryState
> {
  state: RendererErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error): RendererErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('The React renderer failed.', error, errorInfo);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="app-shell">
          <div className="ambient ambient--one" />
          <div className="ambient ambient--two" />
          <main className="workspace workspace--error" role="alert">
            <span className="eyebrow">Renderer error</span>
            <h1>Market Pulse could not start</h1>
            <p>
              The React renderer encountered an unexpected error. Check the
              browser console for details.
            </p>
            <code>{this.state.error.message}</code>
          </main>
        </div>
      );
    }

    return this.props.children;
  }
}
