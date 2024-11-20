import { MenuTrayToggle } from "@/features/main-menu/menu-tray-toggle";
import { CreateChatAndRedirect } from "@/features/chat-page/chat-services/chat-thread-service";
import { ChatContextMenu } from "@/features/chat-page/chat-menu/chat-context-menu";
import { NewChat } from "@/features/chat-page/chat-menu/new-chat";
import {
  Menu,
  MenuBar,
  MenuItem,
  MenuItemContainer,
  menuIconProps,
} from "@/ui/menu";
import {
  Book,
  Home,
  // Image,
  MessageCircle,
  PocketKnife,
  Sheet,
  VenetianMask,
} from "lucide-react";
import { getCurrentUser } from "../auth-page/helpers";
import { MenuLink } from "./menu-link";
import { UserProfile } from "./user-profile";
import Image from "next/image";




export const MainMenu = async () => {
  const user = await getCurrentUser();
 
  
  return (
    <Menu>
      <MenuBar>
        <MenuItemContainer>
          <MenuItem tooltip="Corporate" asChild>
            <MenuLink href="https://www.comau.com/en/" ariaLabel="Go to the Corporate Site">
              <Home/>
              <Image 
                src="/ai-icon.png"
                width={80}
                height={80}
                quality={100}
                alt="ai-icon"
              />
            </MenuLink>
          </MenuItem>
          <MenuTrayToggle />
        </MenuItemContainer>
        <MenuItemContainer>
          {/* <MenuItem tooltip="Chat">
            <MenuLink href="/chat" ariaLabel="Go to the Chat page">
              <MessageCircle {...menuIconProps} />
            </MenuLink>
          </MenuItem> */}
          {/* <MenuItem tooltip="Persona">
            <MenuLink href="/persona" ariaLabel="Go to the Persona configuration page">
              <VenetianMask {...menuIconProps} />
            </MenuLink>
          </MenuItem> */}
          {/* <MenuItem tooltip="extensions">
            <MenuLink href="/extensions" ariaLabel="Go to the Extensions configuration page">
              <PocketKnife {...menuIconProps} />
            </MenuLink>
          </MenuItem>
          <MenuItem tooltip="prompts">
            <MenuLink href="/prompt" ariaLabel="Go to the Prompt Library configuration page">
              <Book {...menuIconProps} />
            </MenuLink>
          </MenuItem> */}
          {user.isAdmin && (
            <>
              <MenuItem tooltip="reporting">
                <MenuLink
                  href="/reporting"
                  ariaLabel="Go to the Admin reporting"
                >
                  <Sheet {...menuIconProps} />
                </MenuLink>
              </MenuItem>
            </>
          )}
        </MenuItemContainer>
        <MenuItemContainer>
          <MenuItem tooltip="Profile">
            <UserProfile />
          </MenuItem>
        </MenuItemContainer>
      </MenuBar>
    </Menu>
  );
};
