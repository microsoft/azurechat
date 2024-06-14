"use client";

import { Button } from "@/features/ui/button";
import { Pencil } from "lucide-react";
import { FC } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { ExtensionModel } from "../extension-services/models";
import { extensionStore } from "../extension-store";
import { ExtensionCardContextMenu } from "./extension-context-menu";
import { StartNewExtensionChat } from "./start-new-extension-chat";

interface Props {
  extension: ExtensionModel;
  showContextMenu: boolean;
}

export const ExtensionCard: FC<Props> = (props) => {
  const { extension } = props;
  return (
    <Card
      key={extension.id}
      className="flex flex-col gap-4 h-auto items-start text-start justify-start dark:bg-opacity-5 dark:bg-[#FFFFFF]  dark:hover:border-fuchsia-400 hover:border-fuchsia-400"
    >
      <CardHeader className="flex flex-row pb-0 w-full items-center">
        <CardTitle className="flex-1 text-base">{extension.name}</CardTitle>
        {props.showContextMenu && (
          <div>
            <ExtensionCardContextMenu extension={extension} />
          </div>
        )}
      </CardHeader>
      <CardContent className="text-muted-foreground flex-1 text-sm">
        {extension.description.length > 100
          ? `${extension.description.slice(0, 100)}...`
          : extension.description}
      </CardContent>
      <CardFooter className="content-stretch w-full gap-8">
        {props.showContextMenu && (
          <Button
            variant={"outline"}
            title="Show message"
            onClick={() => extensionStore.openAndUpdate(props.extension)}
          >
            <Pencil size={18} />
          </Button>
        )}

        <StartNewExtensionChat extension={extension} />
      </CardFooter>
    </Card>
  );
};
