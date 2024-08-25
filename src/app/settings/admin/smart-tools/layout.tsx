import ErrorBoundary from "@/components/error-boundary"

import { SmartToolModel } from "@/features/models/smart-tool-models"
import { GetSmartTools } from "@/features/services/smart-tools-service"
import SmartToolProvider from "@/features/settings/admin/smart-tools-provider"

const getSmartTools = async (): Promise<SmartToolModel[]> => {
  const result = await GetSmartTools()
  if (result.status !== "OK") throw new Error("Failed to get smart tools")
  return result.response
}

export default async function Layout({ children }: { children: React.ReactNode }): Promise<JSX.Element> {
  return (
    <ErrorBoundary>
      <SmartToolProvider smartTools={await getSmartTools()}>
        <div className="flex size-full flex-col gap-4 bg-altBackground text-foreground">{children}</div>
      </SmartToolProvider>
    </ErrorBoundary>
  )
}
