import React from "react"
import { Menu, MenuContent, MenuHeader } from "@/components/menu"
import { UserSettings } from "./menu-items"

export const UserSettingsMenu: React.FC = () => {
  return (
    <Menu className="col-span-1 hidden h-full w-auto overflow-auto bg-background p-2 sm:block md:block">
      <MenuHeader className="justify-end"></MenuHeader>
      <MenuContent>
        <UserSettings />
      </MenuContent>
    </Menu>
  )
}
