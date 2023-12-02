"use client";
import { Menu, MenuContent, MenuHeader, MenuItem } from "@/components/menu";
import { FindAllChatThreadForCurrentUser } from "@/features/chat/chat-services/chat-thread-service";
import { MenuItems } from "../../chat/chat-menu/menu-items";
import { NewChat } from "../../chat/chat-menu/new-chat";
import { useRouter } from "next/router";

const adminMenuItems = [
  {
    page: "/admin/metrics",
    name: "Metrics",
  },
  {
    page: "/admin/models",
    name: "Models",
  },
  {
    page: "/admin/audit",
    name: "Audit",
  },
  {
    page: "/admin/users",
    name: "Users",
  },
];

export const AdminMenu = async () => {
  if (typeof window === "undefined") return <></>;
  const currentPage = window?.location?.pathname;

  return (
    <Menu className=" p-2">
      <MenuHeader>
        <h3 className="text-lg font-semibold">Settings</h3>
      </MenuHeader>
      <MenuContent>
        {adminMenuItems.map((menuItem, index) => (
          <MenuItem
            href={menuItem.page}
            isSelected={currentPage === menuItem.page}
            key={index}
            className="justify-between"
          >
            <span className="flex gap-2 items-center">
              <span className="overflow-ellipsis truncate">
                {menuItem.name}
              </span>
            </span>
          </MenuItem>
        ))}
      </MenuContent>
    </Menu>
  );
};
