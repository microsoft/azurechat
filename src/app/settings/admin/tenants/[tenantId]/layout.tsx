import ErrorBoundary from "@/components/error-boundary"

export default async function Layout({ children }: { children: React.ReactNode }): Promise<JSX.Element> {
  return await Promise.resolve(
    <div className="flex size-full flex-col gap-4 bg-altBackground text-foreground">
      <ErrorBoundary>{children}</ErrorBoundary>
    </div>
  )
}
