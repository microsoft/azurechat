import { FC } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { PersonaModel } from "../persona-services/models";
import { PersonaCardContextMenu } from "./persona-card-context-menu";
import { ViewPersona } from "./persona-view";
import { StartNewPersonaChat } from "./start-new-persona-chat";
import { CopyToClipboardButton } from "./copy-to-clipboard-button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/features/ui/tooltip";

interface Props {
  persona: PersonaModel;
  showContextMenu: boolean;
  showActionMenu: boolean;
}

export const PersonaCard: FC<Props> = (props) => {
  const { persona } = props;

  return (
    <Card key={persona.id} className="flex flex-col">
      <CardHeader className="flex flex-row">
        <CardTitle className="flex-1">{persona.name}</CardTitle>
        {props.showActionMenu && (
          <div>
            <PersonaCardContextMenu persona={persona} />
          </div>
        )}
      </CardHeader>
      <CardContent className="text-muted-foreground flex-1">
        {persona.description}
      </CardContent>
      <CardFooter className="gap-1 content-stretch f">
        {props.showContextMenu && <ViewPersona persona={persona} />}
        <StartNewPersonaChat persona={persona} />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger >
                <CopyToClipboardButton
                  relativeLink={`/persona/${persona.id}/chat`}
                />
            </TooltipTrigger>
            <TooltipContent>
              <p>Copy link to Persona</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardFooter>
    </Card>
  );
};
