import { AddExtension } from "@/features/extensions-page/add-extension/add-new-extension";
import { ExtensionCard } from "@/features/extensions-page/extension-card/extension-card";
import { ExtensionModel } from "@/features/extensions-page/extension-services/models";
import { PersonaCard } from "@/features/persona-page/persona-card/persona-card";
import { PersonaModel } from "@/features/persona-page/persona-services/models";
import { AI_DESCRIPTION, AI_NAME } from "@/features/theme/theme-config";
import { Hero } from "@/features/ui/hero";
import { ScrollArea } from "@/features/ui/scroll-area";
import Image from "next/image";
import { FC } from "react";

interface ChatPersonaProps {
  personas: PersonaModel[];
  extensions: ExtensionModel[];
}

export const ChatHome: FC<ChatPersonaProps> = (props) => {
  return (
    <ScrollArea className="flex-1">
      <main className="flex flex-1 flex-col gap-6 pb-6">
        <Hero
          title={
            <>
              <Image
                src={"/ai-icon.png"}
                width={60}
                height={60}
                quality={100}
                alt="ai-icon"
              />{" "}
              {AI_NAME}
            </>
          }
          description={AI_DESCRIPTION}
        ></Hero>
        <div className="container max-w-4xl flex gap-20 flex-col">
          <div>
            <h2 className="text-2xl font-bold mb-3">Extensions</h2>

            <div className="grid grid-cols-3 gap-3">
              {props.extensions.map((extension) => {
                return (
                  <ExtensionCard
                    extension={extension}
                    key={extension.id}
                    showContextMenu={false}
                  />
                );
              })}
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">Persona</h2>

            <div className="grid grid-cols-3 gap-3">
              {props.personas.map((persona) => {
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
        </div>
        <AddExtension />
      </main>
    </ScrollArea>
  );
};
