import ErrorBoundary from "@/components/error-boundary"

import { TenantDetails } from "@/features/models/tenant-models"
import { UserRecord } from "@/features/models/user-models"
import { GetTenants } from "@/features/services/tenant-service"
import { GetUsersByTenantId } from "@/features/services/user-service"
import AdminProvider from "@/features/settings/admin/admin-provider"

const getTenants = async (): Promise<TenantDetails[]> => {
  const result = await GetTenants()
  if (result.status !== "OK") throw new Error("Failed to get tenants")
  const details = result.response
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
        <ErrorBoundary>{children}</ErrorBoundary>
      </div>
    </AdminProvider>
  )
}
