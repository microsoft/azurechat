"use client"
import React, { Component, ErrorInfo, ReactNode } from "react"

import logger from "@/features/insights/app-insights"

type Props = {
  children?: ReactNode
  fallback?: ReactNode
}

type State = {
  hasError: boolean
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(error: Error): State {
    logger.error("[ErrorBoundary] getDerivedStateFromError caught an error", { error })
    // Update state so the next render will show the fallback UI.
    return { hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.error("[ErrorBoundary] componentDidCatch caught an error", { error, errorInfo })
  }

  public render(): ReactNode {
    if (this.state.hasError)
      return this.props.fallback || <h1>Oops! Looks like there&apos;s a hiccup, please try again later.</h1>
    return this.props.children
  }
}

export default ErrorBoundary
