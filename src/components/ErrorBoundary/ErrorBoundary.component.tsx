import React from 'react';

type ErrorBoundaryProps = {
  children?: React.ReactNode;
  fallback: React.FC<any>;
};

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  { hasError: boolean }
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  renderFallback() {
    const Fallback = this.props.fallback as React.FC;
    return <Fallback />;
  }

  render(): React.ReactNode {
    return this.state.hasError ? this.renderFallback() : this.props.children;
  }
}

export default ErrorBoundary;
