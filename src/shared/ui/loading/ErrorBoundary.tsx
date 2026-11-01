import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ErrorScreen, type ErrorType } from './ErrorScreen';
import { isNetworkError } from '../../lib/apiErrors';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

function classifyError(error: Error | null): ErrorType {
  return isNetworkError(error) ? 'network' : 'general';
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
  public state: State = { hasError: false, error: null };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component tree:', error, errorInfo);
  }

  private handleRetry = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <ErrorScreen
          errorType={classifyError(this.state.error)}
          onRetry={this.handleRetry}
        />
      );
    }
    return this.props.children;
  }
}
