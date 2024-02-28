import { Card } from "@/components/ui/card";
import { StartNewChat } from "@/features/chat/chat-ui/chat-empty-state/start-new-chat";

export const dynamic = "force-dynamic";

export default async function Home() {
  return (
    <Card className="h-full items-center flex justify-center flex-1 col-span-6 sm:col-span-6 md:col-span-5 lg:col-span-4 xl:col-span-5">
      <StartNewChat />
    </Card>
  );
};
