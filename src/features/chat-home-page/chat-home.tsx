"use client";
import { AddExtension } from "@/features/extensions-page/add-extension/add-new-extension";
import { ExtensionModel } from "@/features/extensions-page/extension-services/models";
import { PersonaCard } from "@/features/persona-page/persona-card/persona-card";
import { PersonaModel } from "@/features/persona-page/persona-services/models";
import { AI_DESCRIPTION, AI_NAME } from "@/features/theme/theme-config";
import { Hero } from "@/features/ui/hero";
import { ScrollArea } from "@/features/ui/scroll-area";
import Image from "next/image";
import { FC, useState } from "react";
import { NewsArticleModel } from "@/features/common/services/news-service/news-model";
import { NewsArticle } from "./news-article";
import { Button } from "../ui/button";
import { ExternalLink, House, Logs } from "lucide-react";
import { Changelog } from "./changelog";

interface ChatPersonaProps {
  personas: PersonaModel[];
  extensions: ExtensionModel[];
  news: NewsArticleModel[];
}

export const ChatHome: FC<ChatPersonaProps> = (props) => {
  const [showChanglog, setShowChangelog] = useState<boolean>(false);

  return (
    <ScrollArea className="flex-1 px-3">
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
          {showChanglog ? (
            <div>
              <div className="flex justify-between">
                <h2 className="text-2xl font-bold mb-3">Changelog</h2>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    className="flex items-center gap-3"
                    onClick={() =>
                      window.open(
                        "https://forms.office.com/Pages/ResponsePage.aspx?id=M8Rk7OgevU2Dejn1bHzc6qjXxr1TIg9Fg1aYy60PnqtUOVdLNjhPVTVZU1RXVUpSUEVDNTRPUDBMRy4u",
                        "_blank"
                      )
                    }
                  >
                    <ExternalLink className="h-5 w-5" />
                    Report Feedback
                  </Button>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-3"
                    onClick={() => setShowChangelog(false)}
                  >
                    <House className="h-5 w-5" />
                    <p>Home</p>
                  </Button>
                </div>
              </div>
              <Changelog
                // owner="buhlergroup"
                // repo="azurechat"
                // path="docs/changelog.md"

                owner="SchickliCop"
                repo="azurechat"
                path="docs/changelog.md"
                branch="feature/ms/introduce-changelog"
              />
            </div>
          ) : (
            <>
              <div>
                <div>
                  <div className="flex justify-between">
                    <h2 className="text-2xl font-bold mb-3">Articles</h2>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        className="flex items-center gap-3"
                        onClick={() =>
                          window.open(
                            "https://forms.office.com/Pages/ResponsePage.aspx?id=M8Rk7OgevU2Dejn1bHzc6qjXxr1TIg9Fg1aYy60PnqtUOVdLNjhPVTVZU1RXVUpSUEVDNTRPUDBMRy4u",
                            "_blank"
                          )
                        }
                      >
                        <ExternalLink className="h-5 w-5" />
                        Report Feedback
                      </Button>
                      <Button
                        variant={"ghost"}
                        className="gap-3"
                        onClick={() => setShowChangelog(true)}
                      >
                        <Logs className="h-5 w-5" />
                        <p>Changelog</p>
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {props.news && props.news.length > 0 ? (
                      props.news.map((newsArticle) => {
                        return (
                          <NewsArticle
                            newsArticle={newsArticle}
                            key={newsArticle.id}
                          />
                        );
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
                          showActionMenu={false}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground max-w-xl">
                    No personas created
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </ScrollArea>
  );
};
