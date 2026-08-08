"use client";

import { DropdownMenuItemWithIcon } from "@/features/chat-page/chat-menu/chat-menu-item";
import { RevalidateCache } from "@/features/common/navigation-helpers";
import { LoadingIndicator } from "@/features/ui/loading";
import { MoreVertical, Pencil, Trash } from "lucide-react";
import { FC, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { DeleteExtension } from "../extension-services/extension-service";
import { ExtensionModel } from "../extension-services/models";
import { extensionStore } from "../extension-store";

interface Props {
  extension: ExtensionModel;
}

type DropdownAction = "edit" | "delete";

export const ExtensionCardContextMenu: FC<Props> = (props) => {
  const { isLoading, handleAction } = useDropdownAction({
    extension: props.extension,
  });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          {isLoading ? (
            <LoadingIndicator isLoading={isLoading} />
          ) : (
            <MoreVertical size={18} />
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItemWithIcon
            onClick={() => extensionStore.openAndUpdate(props.extension)}
          >
            <Pencil size={18} />
            <span>Edit</span>
          </DropdownMenuItemWithIcon>
          <DropdownMenuItemWithIcon
            onClick={async () => await handleAction("delete")}
          >
            <Trash size={18} />
            <span>Delete</span>
          </DropdownMenuItemWithIcon>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

const useDropdownAction = (props: { extension: ExtensionModel }) => {
  const { extension } = props;
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (action: DropdownAction) => {
    setIsLoading(true);
    switch (action) {
      case "delete":
        if (
          window.confirm(`Are you sure you want to delete ${extension.name}?`)
        ) {
          await DeleteExtension(extension.id);
          RevalidateCache({
            page: "extensions",
          });
        }

        break;
    }
    setIsLoading(false);
  };

  return {
    isLoading,
    handleAction,
  };
};
