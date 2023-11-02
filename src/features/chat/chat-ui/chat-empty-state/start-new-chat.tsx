import Typography from "@/components/typography";
import { Card } from "@/components/ui/card";
import { AI_NAME } from "@/features/theme/customise";
import { FC } from "react";
import { NewChat } from "../../chat-menu/new-chat";

interface Prop {}

export const StartNewChat: FC<Prop> = (props) => {
  const WELCOME_MESSAGE =  process.env.NEXT_PUBLIC_WELCOME_MESSAGE ?? '';

  return (
    <div className="grid grid-cols-5 w-full items-center container mx-auto max-w-3xl justify-center h-full gap-9">
      <div className="col-span-2 gap-5 flex flex-col flex-1">
        <img src="/ai-icon.png" className="w-36" />
      </div>
      <Card className="col-span-3 flex flex-col gap-5 p-5 ">
        <Typography variant="h4" className="text-primary">
          {AI_NAME}
        </Typography>
        <div className="flex flex-col gap-2">
          { WELCOME_MESSAGE ? (
            <div className="" dangerouslySetInnerHTML={{ __html: WELCOME_MESSAGE}} />
          ) : (
            <div>
              <p className="">
                Welcome to {AI_NAME}. You should interact in a friendly manner with
                the AI assistant and refrain from participating in any harmful
                activities.
              </p>
              <p>You can start a new chat with me by clicking the button below.</p>
            </div>
          )}
        </div>
        <div className="-mx-5 -mb-5 p-5 flex flex-col border-t bg-muted">
          <NewChat />
        </div>
      </Card>
    </div>
  );
};
