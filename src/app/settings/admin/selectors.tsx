"use client"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"

import { useAdminContext } from "@/features/settings/admin/admin-provider"
import { Select } from "@/features/ui/select"

export const Selectors = (): JSX.Element => {
  const { tenants, users, selectTenant, selectedTenant, selectUser, selectedUser } = useAdminContext()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const [, , , tenantId, userId] = pathname.split("/")
    selectTenant(tenants.find(t => t?.id === tenantId))
    selectUser(users.find(u => u?.id === userId))
  }, [pathname, selectTenant, selectUser, tenants, users])

  const handleSelectTenant = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    const selectedTenantId = event.target.value
    if (selectedTenantId === "") {
      selectTenant(undefined)
      selectUser(undefined)
      router.push("/settings/admin")
    } else {
      const selectedTenant = tenants.find(t => t.id === selectedTenantId)
      selectTenant(selectedTenant)
      selectUser(undefined)
      router.push(`/settings/admin/${selectedTenantId}`)
    }
  }

  const handleSelectUser = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (!selectedTenant?.id) return
    const selectedUserId = event.target.value
    selectUser(users.find(u => u.id === selectedUserId))
    router.push(`/settings/admin/${selectedTenant.id}/${selectedUserId}`)
  }

  return (
    <div className="m-4 flex items-center gap-4">
      <div className="flex flex-1 items-center">
        <Select
          value={selectedTenant?.id || ""}
          options={tenants.map(t => ({
            value: t.id,
            label: `${t.departmentName || "[DEPARTMENT NAME NOT SET]"} - ${t.primaryDomain}`,
          }))}
          label="Select a Tenant"
          onChange={handleSelectTenant}
        />
      </div>
      <Select
        value={selectedUser?.id || ""}
        className="flex-1"
        options={users.map(u => ({ value: u.id, label: `${u.name || "[NAME NOT SET]"} - ${u.upn}` }))}
        label="Select a User"
        onChange={handleSelectUser}
        disabled={!selectedTenant?.id}
      />
    </div>
  )
}
