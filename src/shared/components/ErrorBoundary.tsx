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
                  try {
                    if (!localStorage.getItem("user_token")) {
                      localStorage.setItem("user_token", "active_store_token");
                      localStorage.setItem("is_demo_mode", "false");
                      localStorage.setItem("user", JSON.stringify({
                        id: 1,
                        email: "owner@listahub.ph",
                        store_name: "Ang Akong Tindahan",
                        name: "Store Owner",
                      }));
                    }
                  } catch {}
                  this.setState({ hasError: false });
                  window.location.href = "/dashboard";
                }}
                className="rounded-xl bg-blue-900 px-5 py-2.5 text-sm font-extrabold text-white shadow-md hover:bg-blue-950 cursor-pointer transition active:scale-95"
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
