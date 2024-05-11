import React from "react"

import { Menu, MenuContent, MenuHeader } from "@/components/menu"

import { SettingsMenuItems } from "./settings-menu-items"

export const SettingsMenu: React.FC = () => {
  return (
    <Menu className="col-span-1 size-full overflow-auto bg-background p-2">
      <MenuHeader className="justify-end" />
      <MenuContent>
        <SettingsMenuItems />
      </MenuContent>
    </Menu>
  )
}
