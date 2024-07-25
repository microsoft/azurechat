import Typography from "@/components/typography"
import { TenantDetails, toTenantDetails } from "@/features/tenant-management/models"
import TenantList from "@/features/tenant-management/tenant-list"
import { GetTenants } from "@/features/tenant-management/tenant-service"

const getTenants = async (): Promise<TenantDetails[]> => {
  const result = await GetTenants()
  if (result.status !== "OK") throw new Error("Failed to get user preferences")
  const details = result.response.map<TenantDetails>(toTenantDetails)
  return details
}

export default async function TenantsPage(): Promise<JSX.Element> {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <Typography variant="h2" className="text-2xl font-bold tracking-tight">
          Tenant Management
        </Typography>
        <Typography variant="h3" className="text-muted-foreground">
          Below is a list of all tenants
        </Typography>
      </div>
      <TenantList
        searchParams={{ pageSize: 10, pageNumber: 0 }}
        tenants={await getTenants()}
        baseUrl="/settings/admin/tenants"
      />
    </div>
  )
}
