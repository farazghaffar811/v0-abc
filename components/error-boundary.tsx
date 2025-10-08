import React, { type ErrorInfo } from "react"

interface ErrorBoundaryProps {
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Oops! Something went wrong.</h1>
            <p className="text-gray-600 mb-4">
              We're sorry for the inconvenience. Please try refreshing the page or contact support if the problem
              persists.
            </p>
            <p className="text-sm text-gray-500">Error: {this.state.error?.message}</p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
