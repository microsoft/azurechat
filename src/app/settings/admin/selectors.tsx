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

  const handleSelectTenant = (value: string): void => {
    if (value === "placeholder") {
      selectTenant(undefined)
      selectUser(undefined)
      router.push("/settings/admin")
    } else {
      const selectedTenant = tenants.find(t => t.id === value)
      selectTenant(selectedTenant)
      selectUser(undefined)
      router.push(`/settings/admin/${value}`)
    }
  }

  const handleSelectUser = (value: string): void => {
    if (!selectedTenant?.id) return
    selectUser(users.find(u => u.id === value))
    router.push(`/settings/admin/${selectedTenant.id}/${value}`)
  }

  return (
    <div className="m-4 flex items-center gap-4">
      <div className="flex flex-1 items-center">
        <Select
          value={selectedTenant?.id || ""}
          options={[
            {
              label: "Tenants",
              options: tenants.map(t => ({
                value: t.id,
                label: `${t.departmentName || "[DEPARTMENT NAME NOT SET]"} - ${t.primaryDomain}`,
              })),
            },
          ]}
          label="Select a Tenant"
          onValueChange={handleSelectTenant}
        />
      </div>
      <div className="flex flex-1 items-center">
        <Select
          value={selectedUser?.id || ""}
          options={[
            {
              label: "Users",
              options: users.map(u => ({
                value: u.id,
                label: `${u.name || "[NAME NOT SET]"} - ${u.upn}`,
              })),
            },
          ]}
          label="Select a User"
          onValueChange={handleSelectUser}
          disabled={!selectedTenant?.id}
        />
      </div>
    </div>
  )
}
