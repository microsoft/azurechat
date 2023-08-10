import { Card } from "@/components/ui/card";
import { NewChat } from "@/features/chat/chat-menu/new-chat";

export default async function NotFound() {
  return (
    <Card className="h-full items-center flex flex-col gap-4 justify-center">
      <div className="flex w-full items-center container mx-auto max-w-xl justify-center h-full gap-2">
        <div className="gap-5 flex flex-col items-start  flex-1">
          <h2 className="text-4xl font-bold"> Uh-oh! 404</h2>
          <p className="text-sm text-muted-foreground">
            How about we start a new chat?
          </p>
          <NewChat />
        </div>
      </div>
    </Card>
  );
}
