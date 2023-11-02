import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
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
        <SheetTrigger asChild>
          <div>
            <input type="hidden" name="id" value={props.id} />
            <Button
              variant="outline"
              size="sm"
              formAction={formAction}
              value={22}
            >
              {props.index}
            </Button>
          </div>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Citation</SheetTitle>
          </SheetHeader>
          <div className="text-sm text-muted-foreground">{node}</div>
        </SheetContent>
      </Sheet>
    </form>
  );
};
