import { ScrollArea } from "@/features/ui/scroll-area";
import { Textarea } from "@/features/ui/textarea";
import { Info } from "lucide-react";
import { FC } from "react";
import { Button } from "../../ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../ui/sheet";
import { PersonaModel } from "../persona-services/models";

interface Props {
  persona: PersonaModel;
}

export const ViewPersona: FC<Props> = (props) => {
  const { persona } = props;
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant={"outline"} title="Show message">
          <Info size={18} />
        </Button>
      </SheetTrigger>
      <SheetContent className="min-w-[480px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>{persona.name}</SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-1 -mx-6 flex" type="always">
          <div className="p-6 flex gap-8 flex-col  flex-1">
            <SheetDescription>{persona.description}</SheetDescription>
            <div className="flex flex-col gap-3">
              <Textarea
                disabled
                className="min-h-[300px]"
                defaultValue={persona.personaMessage}
                name="personaMessage"
                placeholder="Personality of your persona"
              />
              <p className="text-xs text-muted-foreground">
                {persona.isPublished
                  ? `This is published and everyone in your organisation can use ${persona.name} persona`
                  : "This is only visible to you"}
              </p>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
