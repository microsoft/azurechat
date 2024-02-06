"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/features/ui/card";
import { LoadingIndicator } from "@/features/ui/loading";
import { ScrollArea } from "@/features/ui/scroll-area";
import { Button } from "@/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/ui/sheet";
import { Book } from "lucide-react";
import { FC } from "react";
import { inputPromptStore, useInputPromptState } from "./input-prompt-store";

interface SliderProps {}

export const PromptSlider: FC<SliderProps> = (props) => {
  const { prompts, isLoading, isOpened } = useInputPromptState();
  return (
    <Sheet
      open={isOpened}
      onOpenChange={(value) => {
        inputPromptStore.updateOpened(value);
      }}
    >
      <SheetTrigger asChild>
        <Button
          size="icon"
          type="button"
          variant={"ghost"}
          onClick={() => inputPromptStore.openPrompt()}
        >
          <Book size={16} />
        </Button>
      </SheetTrigger>

      <SheetContent className="min-w-[480px] flex flex-col">
        <SheetHeader>
          <SheetTitle>Prompt Library</SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-1 flex -mx-6">
          <div className="px-6 pb-6 whitespace-pre-wrap">
            <SheetDescription>
              {!isLoading && prompts.length === 0 ? "There are no prompts" : ""}
            </SheetDescription>
            <LoadingIndicator isLoading={isLoading} />
            {prompts.map((prompt) => (
              <Card
                key={prompt.id}
                className="flex flex-col cursor-pointer hover:bg-secondary/80 mt-2"
                onClick={() => inputPromptStore.selectPrompt(prompt)}
              >
                <CardHeader className="flex flex-row">
                  <CardTitle className="flex-1">{prompt.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground flex-1">
                  {prompt.description}
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
