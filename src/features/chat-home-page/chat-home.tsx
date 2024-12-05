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
import { NewsArticleModel } from "@/features/common/services/news-service/news-model";
import { NewsArticle } from "./news-article";

interface ChatPersonaProps {
  personas: PersonaModel[];
  extensions: ExtensionModel[];
  news: NewsArticleModel[];
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
            <div>
              <h2 className="text-2xl font-bold mb-3">Articles</h2>
              <div className="space-y-4">
                {props.news && props.news.length > 0 ? (
                  props.news.map((newsArticle) => {
                  return <NewsArticle newsArticle={newsArticle} key={newsArticle.id} />;
                  })
                ) : (
                  <p className="text-muted-foreground max-w-xl">
                  No current news
                  </p>
                )}
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">Personas</h2>

            {props.personas && props.personas.length > 0 ? (
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
            ) :
              <p className="text-muted-foreground max-w-xl">No personas created</p>
            }
          </div>
        </div>
        <AddExtension />
      </main>
    </ScrollArea>
  );
};
