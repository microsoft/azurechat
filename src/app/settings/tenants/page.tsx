"use client"

import { useEffect } from "react"

import { useAdminContext } from "@/features/settings/admin/admin-provider"
import TenantList from "@/features/tenant-management/tenant-list"

const TenantsPageContent: React.FC = () => {
  const { tenants, selectTenant } = useAdminContext()

  useEffect(() => {
    if (tenants.length > 0) {
      selectTenant(tenants[0])
    }
  }, [tenants, selectTenant])

  return <TenantList searchParams={{ pageSize: 10, pageNumber: 0 }} />
}

const TenantsPage: React.FC = () => {
  return <TenantsPageContent />
}

export default TenantsPage
