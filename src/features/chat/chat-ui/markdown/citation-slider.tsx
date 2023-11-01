import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { FC } from "react";
import { useFormState } from "react-dom";
import { CitationAction } from "./citation-action";

interface SliderProps {
  name: string;
  index: number;
  id: string;
}

export const CitationSlider: FC<SliderProps> = (props) => {
  const [node, formAction] = useFormState(CitationAction, null);
  return (
    <form>
      <Sheet>
        <SheetTrigger>
          <input type="hidden" name="id" value={props.id} />
          <Button
            variant="outline"
            size="sm"
            formAction={formAction}
            value={22}
          >
            {props.index}
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Citation</SheetTitle>
            <SheetDescription>{node}</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </form>
  );
};
