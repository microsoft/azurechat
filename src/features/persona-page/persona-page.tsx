import { FC } from "react";
import { ScrollArea } from "../ui/scroll-area";
import { AddNewPersona } from "./add-new-persona";
import { PersonaCard } from "./persona-card/persona-card";
import { PersonaHero } from "./persona-hero/persona-hero";
import { PersonaModel } from "./persona-services/models";
import { getCurrentUser } from "../auth-page/helpers";

interface ChatPersonaProps {
  personas: PersonaModel[];
  departments: any;
}

export const ChatPersonaPage: FC<ChatPersonaProps> = async (props) => {
  // filter departments by avoiding null values and duplicates

  const filteredDepartments = [
    { department: "All Department" },
    ...props?.departments?.value
      .filter(
        (data: any) => data.department !== null && data.department !== "Ex-Emp"
      )
      .filter((data: any, index: number, self: any[]) => {
        return (
          index === self.findIndex((d: any) => d.department === data.department)
        );
      }),
  ];

  const user = await getCurrentUser();

  return (
    <ScrollArea className="flex-1">
      <main className="flex flex-1 flex-col dark:bg-opacity-25 dark:bg-[#262626] bg-[#FFFFFF] bg-opacity-25 m-4 rounded-lg border-0 min-h-screen">
        <PersonaHero user={user} />
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
        <AddNewPersona departments={filteredDepartments} />
      </main>
    </ScrollArea>
  );
};
