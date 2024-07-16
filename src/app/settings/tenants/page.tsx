"use client"

import TenantList from "@/features/tenant-management/tenant-list"

const TenantsPage: React.FC = () => {
  return <TenantList searchParams={{ pageSize: 10, pageNumber: 0 }} />
}
export default TenantsPage
