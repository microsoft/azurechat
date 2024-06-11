import { AddExtension } from "@/features/extensions-page/add-extension/add-new-extension";
import { ExtensionModel } from "@/features/extensions-page/extension-services/models";
import { PersonaCard } from "@/features/persona-page/persona-card/persona-card";
import { PersonaModel } from "@/features/persona-page/persona-services/models";
import { AI_DESCRIPTION, AI_NAME } from "@/features/theme/theme-config";
import { Hero } from "@/features/ui/hero";
import { ScrollArea } from "@/features/ui/scroll-area";
import Image from "next/image";
import { FC } from "react";
import { cn } from "@/ui/lib";
import { ralewaySans } from "../../app/fonts";
import { ViewAllPersonas } from "./view-all-persona/view-all-persona";

interface ChatPersonaProps {
  personas: PersonaModel[];
  extensions: ExtensionModel[];
  redirectToPersona: any;
}

export const ChatHome: FC<ChatPersonaProps> = (props) => {
  return (
    <ScrollArea className="flex-1">
      <main className="flex flex-1 flex-col gap-6 pb-6 dark:bg-opacity-25 dark:bg-[#262626] bg-[#FFFFFF] bg-opacity-25 m-4 rounded-lg border-0 h-screen">
        <Hero
          title={
            <>
              <Image
                src={"/QuaBot_Light_Icon.svg"}
                width={60}
                height={60}
                quality={100}
                alt="QuaBot Icon"
              />{" "}
              <span className={cn(ralewaySans.className)}>{AI_NAME}</span>
            </>
          }
          description={AI_DESCRIPTION}
        ></Hero>
        <div className="container max-w-4xl flex gap-10 flex-col">
          <div>
            {props.personas && props.personas.length > 0 ? (
              <div>
                {props.personas.length > 3 && (
                  <div className="text-right mt-3">
                    <ViewAllPersonas />
                  </div>
                )}
                <div className="grid grid-cols-3 gap-3">
                  {props.personas.slice(0, 3).map((persona) => {
                    return (
                      <PersonaCard
                        persona={persona}
                        key={persona.id}
                        showContextMenu={false}
                      />
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground max-w-xl">
                No personas created
              </p>
            )}
          </div>
        </div>
        <AddExtension />
      </main>
    </ScrollArea>
  );
};
