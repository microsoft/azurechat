"use client";
import { MenuItem } from "@/components/menu";
import { Button } from "@/components/ui/button";
import { SoftDeleteChatThreadByID } from "@/features/chat/chat-services/chat-thread-service";
import { useGlobalMessageContext } from "@/features/global-message/global-message-context";
import { FileText, MessageCircle, Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { FC } from "react";
import { ChatThreadModel } from "../chat-services/models";

interface Prop {
  menuItems: Array<ChatThreadModel>;
}

export const MenuItems: FC<Prop> = (props) => {
  const { id } = useParams();
  const router = useRouter();
  const { showError } = useGlobalMessageContext();

  const sendData = async (threadID: string) => {
    try {
      await SoftDeleteChatThreadByID(threadID);
      router.refresh();
      router.replace("/chat");
    } catch (e) {
      console.log(e);
      showError("" + e);
    }
  };

  return (
    <>
      {props.menuItems.map((thread, index) => (
        <MenuItem
          href={"/chat/" + thread.id}
          isSelected={id === thread.id}
          key={index}
          className="justify-between group/item"
        >
          {thread.chatType === "data" ? (
            <FileText
              size={16}
              className={id === thread.id ? " text-brand" : ""}
            />
          ) : (
            <MessageCircle
              size={16}
              className={id === thread.id ? " text-brand" : ""}
            />
          )}

          <span className="flex gap-2 items-center overflow-hidden flex-1">
            <span className="overflow-ellipsis truncate"> {thread.name}</span>
          </span>
          <Button
            className="invisible  group-hover/item:visible hover:text-brand"
            size={"sm"}
            variant={"ghost"}
            onClick={async (e) => {
              e.preventDefault();
              const yesDelete = confirm(
                "Are you sure you want to delete this chat?"
              );
              if (yesDelete) {
                await sendData(thread.id);
              }
            }}
          >
            <Trash size={16} />
          </Button>
        </MenuItem>
      ))}
    </>
  );
};
