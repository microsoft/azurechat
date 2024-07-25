import ErrorBoundary from "@/components/error-boundary"

import { Selectors } from "./selectors"

export default function Layout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <div className="flex size-full flex-col gap-4 bg-altBackground text-foreground">
      <Selectors />
      <ErrorBoundary>{children}</ErrorBoundary>
    </div>
  )
}
