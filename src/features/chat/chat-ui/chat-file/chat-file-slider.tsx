import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
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
        <SheetTrigger asChild>
          <Button size="icon" variant={"ghost"}>
            <FileText size={16} />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Upload File</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <ChatFileUI />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
