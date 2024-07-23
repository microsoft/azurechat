import * as VisuallyHidden from "@radix-ui/react-visually-hidden"
import { FilePlus } from "lucide-react"

import { Button } from "@/features/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/features/ui/sheet"

import { ChatFileUI } from "./chat-file-ui"

export const ChatFileSlider = (): JSX.Element => {
  return (
    <div>
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant={"ghost"} ariaLabel="Add a file">
            <FilePlus size={16} />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Upload File</SheetTitle>
            <VisuallyHidden.Root>
              <SheetDescription>File Upload Dialog</SheetDescription>
            </VisuallyHidden.Root>
          </SheetHeader>
          <div className="py-4">
            <ChatFileUI />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
