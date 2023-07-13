import { Menu, MenuContent, MenuFooter, MenuHeader } from "@/components/menu";
import { FindAllChatThreadForCurrentUser } from "@/features/chat/chat-thread-service";
import { ThemeToggle } from "@/features/theme/theme-toggle";
import { MenuItems } from "./menu-items";
import { NewChat } from "./new-chat";

export const ChatMenu = async () => {
  const items = await FindAllChatThreadForCurrentUser();

  return (
    <Menu>
      <MenuHeader className="justify-end">
        <NewChat />
      </MenuHeader>
      <MenuContent>
        <MenuItems menuItems={items} />
      </MenuContent>
      <MenuFooter>
        <div className="flex flex-col gap-3">
          <ThemeToggle />
        </div>
      </MenuFooter>
    </Menu>
  );
};
