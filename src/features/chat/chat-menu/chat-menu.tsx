import { Menu, MenuContent, MenuHeader } from "@/components/menu"
import { FindAllChatThreadForCurrentUser } from "@/features/chat/chat-services/chat-thread-service"
import { DisplayError } from "@/features/ui/display-error"

import { MenuItems } from "./menu-items"
import { NewChat } from "./new-chat"

export const ChatMenu = async (): Promise<JSX.Element> => {
  const result = await FindAllChatThreadForCurrentUser()
  if (result.status !== "OK") return <DisplayError errors={result.errors} />

  return (
    <Menu className="col-span-3 size-full overflow-auto">
      <MenuHeader className="justify-end">
        <NewChat />
      </MenuHeader>
      <MenuContent>
        <MenuItems menuItems={result.response} />
      </MenuContent>
    </Menu>
  )
}
