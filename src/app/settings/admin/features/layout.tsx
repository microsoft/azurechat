import ErrorBoundary from "@/components/error-boundary"

import { FeatureModel } from "@/features/models/feature-models"
import { GetFeatures } from "@/features/services/feature-service"
import FeaturesProvider from "@/features/settings/admin/features-provider"

const getFeatures = async (): Promise<FeatureModel[]> => {
  const result = await GetFeatures()
  if (result.status !== "OK") throw new Error("Failed to get features")
  return result.response
}

export default async function Layout({ children }: { children: React.ReactNode }): Promise<JSX.Element> {
  return (
    <ErrorBoundary>
      <FeaturesProvider features={await getFeatures()}>
        <div className="flex size-full flex-col gap-4 bg-altBackground text-foreground">{children}</div>
      </FeaturesProvider>
    </ErrorBoundary>
  )
}
