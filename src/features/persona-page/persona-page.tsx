import { FC } from "react";
import { ScrollArea } from "../ui/scroll-area";
import { AddNewPersona } from "./add-new-persona";
import { PersonaCard } from "./persona-card/persona-card";
import { PersonaHero } from "./persona-hero/persona-hero";
import { PersonaModel } from "./persona-services/models";
import { ExtensionModel } from "../extensions-page/extension-services/models";
import { userHashedId } from "../auth-page/helpers";

interface ChatPersonaProps {
  personas: PersonaModel[];
  extensions: ExtensionModel[];
}

export const ChatPersonaPage: FC<ChatPersonaProps> = (props) => {
  return (
    <ScrollArea className="flex-1">
      <main className="flex flex-1 flex-col">
        <PersonaHero />
        <div className="container max-w-4xl py-8">
          <div className="grid grid-cols-3 gap-3">
            {props.personas.map(async (persona) => {
              return (
                <PersonaCard
                  persona={persona}
                  key={persona.id}
                  showContextMenu
                  showActionMenu={persona.userId === await userHashedId()}
                />
              );
            })}
          </div>
        </div>
        <AddNewPersona extensions={props.extensions} />
      </main>
    </ScrollArea>
  );
};
