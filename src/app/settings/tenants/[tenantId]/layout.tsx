import ErrorBoundary from "@/components/error-boundary"

export default async function Layout({ children }: { children: React.ReactNode }): Promise<JSX.Element> {
  return await Promise.resolve(
    <div>
      <ErrorBoundary>{children}</ErrorBoundary>
    </div>
  )
}
