import { SearchX } from "lucide-react"
import React, { Component } from "react"
interface ErrorBoundaryProps {
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(_error: Error): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("ErrorBoundary caught an error", error, errorInfo)
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div
          className="my-2 flex max-w-none justify-center space-x-2 rounded-md bg-backgroundShade p-2 text-base text-text md:text-base"
          tabIndex={0}
        >
          <div className="flex items-center justify-center text-alert">
            <SearchX size={20} />
          </div>
          <div className="flex flex-grow items-center justify-center text-center">
            Oops! Looks like there&apos;s a hiccup, and we can&apos;t show the response right now. But no worries, feel
            free to keep the conversation going!
          </div>
          <div className="flex items-center justify-center text-alert">
            <SearchX size={20} />
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
