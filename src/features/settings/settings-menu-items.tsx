import { UserRoundCog, FileClock, Building2, ShieldCheck, Factory } from "lucide-react"

import { isTenantAdmin, isAdmin } from "@/features/auth/helpers"
import { SettingsMenuItem } from "@/features/settings/settings-menu-item"

const menuItems = [
  { url: "/settings", icon: <UserRoundCog size={16} />, text: "Your details" },
  { url: "/settings/history", icon: <FileClock size={16} />, text: "Chat history" },
  { url: "/settings/tenant", icon: <Building2 size={16} />, text: "Department details", tenantAdminRequired: true },
  { url: "/settings/tenants", icon: <Factory size={16} />, text: "Tenants", adminRequired: true },
  { url: "/settings/admin", icon: <ShieldCheck size={16} />, text: "Admin", adminRequired: true },
]

const adminFilters =
  (tenantAdmin: boolean, admin: boolean) =>
  (menuItem: { tenantAdminRequired?: boolean; adminRequired?: boolean }): boolean =>
    (!menuItem.tenantAdminRequired && !menuItem.adminRequired) || // No restrictions required
    (!!menuItem.tenantAdminRequired && tenantAdmin) || // Restricted to tenant admin
    (!!menuItem.adminRequired && admin) || // Admin only
    (tenantAdmin && !!menuItem.adminRequired) // Tenant admin can also access admin options

export const SettingsMenuItems = async (): Promise<JSX.Element> => {
  const tenantAdmin = await isTenantAdmin()
  const admin = await isAdmin()

  return (
    <div className="flex flex-col gap-4">
      {menuItems.filter(adminFilters(tenantAdmin, admin)).map(item => (
        <SettingsMenuItem key={item.url} url={item.url} icon={item.icon} text={item.text} />
      ))}
    </div>
  )
}
