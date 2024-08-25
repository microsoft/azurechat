import ErrorBoundary from "@/components/error-boundary"

import { IndexModel } from "@/features/models/index-models"
import { GetIndexes } from "@/features/services/index-service"
import IndexesProvider from "@/features/settings/admin/indexes-provider"

const getIndexes = async (): Promise<IndexModel[]> => {
  const result = await GetIndexes()
  if (result.status !== "OK") throw new Error("Failed to get indexes")
  return result.response
}

export default async function Layout({ children }: { children: React.ReactNode }): Promise<JSX.Element> {
  return (
    <ErrorBoundary>
      <IndexesProvider indexes={await getIndexes()}>
        <div className="flex size-full flex-col gap-4 bg-altBackground text-foreground">{children}</div>
      </IndexesProvider>
    </ErrorBoundary>
  )
}
