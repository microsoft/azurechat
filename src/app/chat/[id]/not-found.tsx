import Typography from "@/components/typography";
import { Card } from "@/components/ui/card";
import { NewChat } from "@/features/chat/chat-menu/new-chat";

export default async function NotFound() {
  return (
    <Card className="h-full items-center flex flex-col gap-4 justify-center">
      <div className="text-center">
        <Typography className="" variant="h3">
          Uh-oh! 404
        </Typography>
        <div className="text-muted-foreground text-sm">
          How about we start a new chat?
        </div>
      </div>
      <NewChat></NewChat>
    </Card>
  );
}
