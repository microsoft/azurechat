import ErrorBoundary from "@/components/error-boundary"
import AdminProvider from "@/features/settings/admin/admin-provider"
import { TenantDetails, toTenantDetails } from "@/features/tenant-management/models"
import { GetTenants } from "@/features/tenant-management/tenant-service"
import { UserRecord } from "@/features/user-management/models"
import { GetUsersByTenantId } from "@/features/user-management/user-service"

import { Selectors } from "./selectors"

const getTenants = async (): Promise<TenantDetails[]> => {
  const result = await GetTenants()
  if (result.status !== "OK") throw new Error("Failed to get user preferences")
  const details = result.response.map<TenantDetails>(toTenantDetails)
  return details
}

const getUsersByTenantId = async (tenantId: string): Promise<UserRecord[]> => {
  "use server"
  const result = await GetUsersByTenantId(tenantId)
  if (result.status !== "OK") throw new Error("Failed to get user records")
  return result.response
}

export default async function Layout({ children }: { children: React.ReactNode }): Promise<JSX.Element> {
  return (
    <AdminProvider tenants={await getTenants()} fetchUserRecords={getUsersByTenantId}>
      <div className="flex size-full flex-col gap-4 bg-altBackground text-foreground">
        <ErrorBoundary>
          <Selectors />
        </ErrorBoundary>
        <ErrorBoundary>{children}</ErrorBoundary>
      </div>
    </AdminProvider>
  )
}
