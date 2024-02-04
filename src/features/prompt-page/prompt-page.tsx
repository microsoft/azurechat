import { FC } from "react";

import { DisplayError } from "../ui/error/display-error";
import { ScrollArea } from "../ui/scroll-area";
import { AddPromptSlider } from "./add-new-prompt";
import { PromptCard } from "./prompt-card";
import { PromptHero } from "./prompt-hero/prompt-hero";
import { FindAllPrompts } from "./prompt-service";

interface ChatSamplePromptProps {}

export const ChatSamplePromptPage: FC<ChatSamplePromptProps> = async (
  props
) => {
  const promptsResponse = await FindAllPrompts();

  if (promptsResponse.status !== "OK") {
    return <DisplayError errors={promptsResponse.errors} />;
  }

  return (
    <ScrollArea className="flex-1">
      <main className="flex flex-1 flex-col">
        <PromptHero />
        <div className="container max-w-4xl py-3">
          <div className="grid grid-cols-3 gap-3">
            {promptsResponse.response.map((prompt) => {
              return (
                <PromptCard prompt={prompt} key={prompt.id} showContextMenu />
              );
            })}
          </div>
        </div>
        <AddPromptSlider />
      </main>
    </ScrollArea>
  );
};
