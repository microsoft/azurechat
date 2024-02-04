import { Button } from "@/features/ui/button";
import { ScrollArea } from "@/features/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/features/ui/sheet";
import { File } from "lucide-react";
import { FC } from "react";
import { ChatDocumentModel } from "../chat-services/models";

interface Props {
  chatDocuments: Array<ChatDocumentModel>;
}

export const DocumentDetail: FC<Props> = (props) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant={"outline"} className="gap-2">
          <File size={16} /> {props.chatDocuments.length}
        </Button>
      </SheetTrigger>
      <SheetContent className="min-w-[480px] sm:w-[540px] flex flex-col">
        <SheetHeader>
          <SheetTitle>Documents</SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-1 -mx-6 flex" type="always">
          <div className="pb-6 px-6 flex gap-2 flex-col  flex-1">
            {props.chatDocuments.map((doc) => {
              return (
                <div className="flex gap-2 items-center" key={doc.id}>
                  <File size={16} /> <div>{doc.name}</div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
