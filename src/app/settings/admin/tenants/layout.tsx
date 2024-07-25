import ErrorBoundary from "@/components/error-boundary"

export default function Layout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <div className="flex size-full flex-col gap-4 bg-altBackground text-foreground">
      <ErrorBoundary>{children}</ErrorBoundary>
    </div>
  )
}
