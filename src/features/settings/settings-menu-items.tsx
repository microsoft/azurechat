import { UserRoundCog, FileClock, CircleHelp, Building2 } from "lucide-react"

import { isTenantAdmin } from "@/features/auth/helpers"
import { SettingsMenuItem } from "@/features/settings/settings-menu-item"

const menuItems = [
  { url: "/settings/details", icon: <UserRoundCog size={16} />, text: "Your details" },
  { url: "/settings/history", icon: <FileClock size={16} />, text: "Chat history" },
  { url: "/settings/help", icon: <CircleHelp size={16} />, text: "Help & Support" },
  { url: "/settings/tenant", icon: <Building2 size={16} />, text: "Department details", adminRequired: true },
]

export const SettingsMenuItems = async (): Promise<JSX.Element> => {
  const isAdmin = await isTenantAdmin()

  return (
    <div className="flex flex-col gap-4">
      {menuItems
        .filter(m => !m.adminRequired || (m.adminRequired && isAdmin))
        .map(item => (
          <SettingsMenuItem key={item.url} url={item.url} icon={item.icon} text={item.text} />
        ))}
    </div>
  )
}
