"use client"

import Typography from "@/components/typography"

import { useAdminContext } from "@/features/settings/admin/admin-provider"
import TenantList from "@/features/settings/admin/tenant-list"

export default function TenantsPage(): JSX.Element {
  const { tenants } = useAdminContext()

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
      <TenantList searchParams={{ pageSize: 10, pageNumber: 0 }} tenants={tenants} baseUrl="/settings/admin/tenants" />
    </div>
  )
}
