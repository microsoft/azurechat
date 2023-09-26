'use client'

import { useState, useEffect } from 'react';
import { Menu, MenuContent, MenuHeader } from "@/components/menu";
import { FindAllChatThreadForCurrentUser } from "@/features/chat/chat-services/chat-thread-service";
import { MenuItems } from "./menu-items";
import { NewChat } from "./new-chat";
import { ChatThreadModel } from '../chat-services/models';

export const ChatMenu = () => {
  const [items, setItems] = useState<ChatThreadModel[]>([]);

  const [refresh, setRefresh] = useState(true);
  // Fetch data when the component mounts and refreshes
  useEffect(() => {
    const fetchData = async () => {
      console.log("fetching items")
      const data = await FindAllChatThreadForCurrentUser();
      setItems(data);
    };

    fetchData();
  }, [refresh]);

  const doRefresh = () => {
    console.log("should refresh")
    setRefresh(!refresh);
  }

  return (
    <Menu className=" p-2">
      <MenuHeader className="justify-end">
        <NewChat />
      </MenuHeader>
      <MenuContent>
        <MenuItems refresh={doRefresh} menuItems={items} />
      </MenuContent>
    </Menu>
  );
};
