import { Button } from "@/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/ui/sheet";
import { FC } from "react";
import { useFormState } from "react-dom";
import { ScrollArea } from "../scroll-area";
import { useMarkdownContext } from "./markdown-context";

interface SliderProps {
  name: string;
  index: number;
  id: string;
}

export const CitationSlider: FC<SliderProps> = (props) => {
  const { onCitationClick } = useMarkdownContext();

  if (!onCitationClick) throw new Error("onCitationClick is null");

  const [node, formAction] = useFormState(onCitationClick, null);

  return (
    <form>
      <input type="hidden" name="id" value={props.id} />
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            formAction={formAction}
            type="submit"
          >
            {props.index}
          </Button>
        </SheetTrigger>
        <SheetContent className="min-w-[480px] sm:w-[540px] flex flex-col">
          <SheetHeader>
            <SheetTitle>Citation</SheetTitle>
          </SheetHeader>
          <ScrollArea className="flex-1 flex -mx-6">
            <div className="px-6 whitespace-pre-wrap">{node}</div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </form>
  );
};
