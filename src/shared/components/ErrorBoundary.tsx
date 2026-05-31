import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("[ErrorBoundary]", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <div className="text-center space-y-4">
              <p className="text-lg font-semibold text-gray-800">
                Something went wrong
              </p>
              <p className="text-sm text-gray-500">
                Please refresh the page to continue.
              </p>
              <button
                onClick={() => {
                  this.setState({ hasError: false });
                  window.location.href = "/dashboard";
                }}
                className="rounded-lg bg-[#1E3A8A] px-4 py-2 text-sm font-medium text-white"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
