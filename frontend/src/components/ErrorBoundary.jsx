import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // You can log error to an error reporting service here
    // console.error("ErrorBoundary caught: ", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="max-w-md text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">
              Something went wrong.
            </h2>
            <p className="text-slate-600 text-sm mb-4">
              An unexpected error occurred while rendering this section. Please
              try again.
            </p>
            <button
              className="px-4 py-2 rounded bg-slate-800 text-white"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Retry
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
