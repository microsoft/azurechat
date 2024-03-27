import { Card } from "@/features/ui/card"
import { StartNewChat } from "@/features/chat/chat-ui/chat-empty-state/start-new-chat"

export const dynamic = "force-dynamic"

export default function Home(): JSX.Element {
  return (
    <Card className="col-span-6 flex h-full flex-1 items-center justify-center bg-altBackground sm:col-span-6 md:col-span-5 lg:col-span-4 xl:col-span-5">
      <StartNewChat />
    </Card>
  )
}
