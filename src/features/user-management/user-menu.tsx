import React from 'react';
import { Menu, MenuContent, MenuHeader } from "@/components/menu";
import { UserSettings } from "./menu-items";

export const UserSettingsMenu: React.FC = () => {
  return (
    <Menu className="w-auto hidden sm:block col-span-1 p-2 bg-background h-full md:block overflow-auto">
      <MenuHeader className="justify-end">
      </MenuHeader>
      <MenuContent>
        <UserSettings />
      </MenuContent>
    </Menu>
  );
};
