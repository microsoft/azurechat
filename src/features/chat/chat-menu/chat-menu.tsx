import { Menu, MenuContent, MenuHeader } from "@/components/menu"

import { MenuItems } from "./menu-items"
import { NewChat } from "./new-chat"

export const ChatMenu = (): JSX.Element => (
  <Menu className="col-span-3 size-full overflow-auto">
    <MenuHeader className="justify-end">
      <NewChat />
    </MenuHeader>
    <MenuContent>
      <MenuItems />
    </MenuContent>
  </Menu>
)
