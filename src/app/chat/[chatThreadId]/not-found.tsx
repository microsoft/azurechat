import Typography from "@/components/typography"
import { NewChat } from "@/features/chat/chat-menu/new-chat"
import { Card } from "@/features/ui/card"

export default function NotFound(): JSX.Element {
  return (
    <Card className="size-full items-center justify-center">
      <div className="container mx-auto flex size-full max-w-xl items-center justify-center gap-2">
        <div className="flex flex-1 flex-col items-start gap-5">
          <Typography variant="h2" className="font-bold">
            Uh-oh! 404
          </Typography>
          <div className="justify-between">
            <div className="flex items-center gap-2">
              <Typography variant="p" className="text-muted-foreground">
                How about we start a new chat?
              </Typography>
              <NewChat />
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
