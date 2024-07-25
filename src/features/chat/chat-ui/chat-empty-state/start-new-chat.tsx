import { FC } from "react"

import { APP_NAME, AI_TAGLINE } from "@/app-global"

import Typography from "@/components/typography"
import { NewChat } from "@/features/chat/chat-menu/new-chat"
import { Card } from "@/features/ui/card"

export const StartNewChat: FC<object> = () => {
  return (
    <section
      className="container mx-auto grid size-full max-w-3xl grid-cols-3 items-center justify-center gap-9"
      aria-labelledby="startChatTitle"
    >
      <Card className="col-span-3 flex flex-col gap-5 rounded-md p-5">
        <Typography variant="h4" className="text-2xl text-siteTitle" id="startChatTitle">
          {APP_NAME}
          <br />
          {AI_TAGLINE}
        </Typography>
        <div className="flex flex-col gap-2">
          <Typography variant="p">
            {APP_NAME}, your text-based virtual assistant, is equipped with cutting-edge Generative AI technology to
            empower you. Let {APP_NAME} assist you in accomplishing remarkable outcomes.
          </Typography>
        </div>
        <div className="-mx-5 -mb-5 grid grid-cols-3 items-center justify-center rounded-bl-md rounded-br-md bg-muted p-5">
          <div className="col-span-2" />
          <div>
            <NewChat />
          </div>
        </div>
      </Card>
    </section>
  )
}
