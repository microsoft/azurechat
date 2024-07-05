"use client"

import { useEffect } from "react"

import { useAdminContext } from "@/features/settings/admin/admin-provider"
import UserList from "@/features/user-management/user-list"

const UsersPageContent: React.FC = () => {
  const { tenants, selectTenant } = useAdminContext()

  useEffect(() => {
    if (tenants.length > 0) {
      selectTenant(tenants[0])
    }
  }, [tenants, selectTenant])

  return <UserList searchParams={{ pageSize: 10, pageNumber: 0 }} />
}

const UsersPage: React.FC = () => {
  return <UsersPageContent />
}

export default UsersPage
