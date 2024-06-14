import { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { PromptModel } from "./models";
import { PromptCardContextMenu } from "./prompt-card-context-menu";

interface Props {
  prompt: PromptModel;
  showContextMenu: boolean;
}

export const PromptCard: FC<Props> = (props) => {
  const { prompt } = props;
  return (
    <Card
      key={prompt.id}
      className="flex flex-col gap-4 h-auto items-start text-start justify-start dark:bg-opacity-5 dark:bg-[#FFFFFF]  dark:hover:border-fuchsia-400 hover:border-fuchsia-400"
    >
      <CardHeader className="flex flex-row pb-0 w-full items-center">
        <CardTitle className="flex-1 text-base">{prompt.name}</CardTitle>
        {props.showContextMenu && (
          <div>
            <PromptCardContextMenu prompt={prompt} />
          </div>
        )}
      </CardHeader>
      <CardContent className="content-stretch w-full gap-8 text-sm text-muted-foreground">
        {prompt.description.length > 100
          ? prompt.description.slice(0, 100).concat("...")
          : prompt.description}
      </CardContent>
    </Card>
  );
};
