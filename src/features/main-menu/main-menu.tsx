import { MenuTrayToggle } from "@/features/main-menu/menu-tray-toggle";
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
  MessageCircle,
  PocketKnife,
  Sheet,
  VenetianMask,
} from "lucide-react";
import { getCurrentUser } from "../auth-page/helpers";
import { MenuLink } from "./menu-link";
import { UserProfile } from "./user-profile";

export const MainMenu = async () => {
  const user = await getCurrentUser();

  return (
    <Menu>
      <MenuBar>
        <MenuItemContainer>
          <MenuItem tooltip="Home" asChild>
            <MenuLink href="/chat">
              <Home {...menuIconProps} />
            </MenuLink>
          </MenuItem>
          <MenuTrayToggle />
        </MenuItemContainer>
        <MenuItemContainer>
          <MenuItem tooltip="Chat">
            <MenuLink href="/chat">
              <MessageCircle {...menuIconProps} />
            </MenuLink>
          </MenuItem>
          <MenuItem tooltip="Persona">
            <MenuLink href="/persona">
              <VenetianMask {...menuIconProps} />
            </MenuLink>
          </MenuItem>
          <MenuItem tooltip="extensions">
            <MenuLink href="/extensions">
              <PocketKnife {...menuIconProps} />
            </MenuLink>
          </MenuItem>
          <MenuItem tooltip="prompts">
            <MenuLink href="/prompt">
              <Book {...menuIconProps} />
            </MenuLink>
          </MenuItem>
          {user.isAdmin && (
            <>
              <MenuItem tooltip="reporting">
                <MenuLink href="/reporting">
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
