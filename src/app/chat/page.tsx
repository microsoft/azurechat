import { Card } from "@/components/ui/card";
import { StartNewChat } from "@/features/chat/chat-ui/start-new-chat";

export default async function Home() {
  return (
    <Card className="h-full items-center flex justify-center flex-1">
      <StartNewChat />
    </Card>
  );
}
