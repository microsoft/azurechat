import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { FileText } from "lucide-react";
import { ChatFileUI } from "./chat-file-ui";

export const ChatFileSlider = () => {
  return (
    <div>
      <Sheet>
        <SheetTrigger>
          <Button size="icon" variant={"ghost"}>
            <FileText size={16} />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Upload File</SheetTitle>
            <SheetDescription>
              <ChatFileUI />
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  );
};
