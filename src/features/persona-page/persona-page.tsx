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
      <main className="flex flex-1 flex-col">
        <PersonaHero />
        <div className="container max-w-4xl py-8">
          {props.personas.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No personas yet. Create one to get started.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
          )}
        </div>
        <AddNewPersona />
      </main>
    </ScrollArea>
  );
};
