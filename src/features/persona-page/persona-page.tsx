import { FC } from "react";
import { ScrollArea } from "../ui/scroll-area";
import { AddNewPersona } from "./add-new-persona";
import { PersonaCard } from "./persona-card/persona-card";
import { PersonaHero } from "./persona-hero/persona-hero";
import { PersonaModel } from "./persona-services/models";

interface ChatPersonaProps {
  personas: PersonaModel[];
}

export const ChatPersonaPage: FC<ChatPersonaProps> = (props) => {
  return (
    <ScrollArea className="flex-1">
      <main className="flex flex-1 flex-col dark:bg-opacity-25 dark:bg-[#262626] bg-[#FFFFFF] bg-opacity-25 m-4 rounded-md border-0 min-h-screen">
        <PersonaHero />
        <div className="container max-w-4xl py-3">
          <div className="grid grid-cols-3 gap-3">
            {props.personas.map((persona) => {
              return (
                <PersonaCard
                  persona={persona}
                  key={persona.id}
                  showContextMenu
                />
              );
            })}
          </div>
        </div>
        <AddNewPersona />
      </main>
    </ScrollArea>
  );
};
