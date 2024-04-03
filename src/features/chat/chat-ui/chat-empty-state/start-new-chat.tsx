"use client"

import { useRouter } from "next/navigation"
import { FC } from "react"

import Typography from "@/components/typography"
import { NewChat } from "@/features/chat/chat-menu/new-chat"
import { AI_NAME } from "@/features/theme/theme-config"
import { Button } from "@/features/ui/button"
import { Card } from "@/features/ui/card"

export const StartNewChat: FC<object> = () => {
  const router = useRouter()
  return (
    <section
      className="container mx-auto grid size-full max-w-3xl grid-cols-3 items-center justify-center gap-9 bg-altBackground"
      aria-labelledby="startChatTitle"
    >
      <Card className="col-span-3 flex flex-col gap-5 bg-altBackgroundShade p-5">
        <Typography variant="h4" className="text-2xl text-siteTitle" id="startChatTitle">
          {AI_NAME}
          <br />
          The Queensland Government AI Assistant
        </Typography>
        <div className="flex flex-col gap-2">
          <p>
            QChat, your text-based virtual assistant, is equipped with cutting-edge Generative AI technology to empower
            you in your role within the Queensland Government.
          </p>
          <p>Let QChat assist you in accomplishing remarkable outcomes.</p>
          <p className="hidden lg:block">
            Press the plus button below to get started or select one of your existing chats from the left-hand panel.
          </p>
          <p className="lg:hidden">Press the plus button below to get started.</p>
        </div>
        <div className="-mx-5 -mb-5 inline-flex items-center justify-center border-t bg-muted p-5">
          <NewChat aria-label="Start a new chat" />
          <Button onClick={() => router.push("/terms")} variant="link" className="text-foreground">
            By starting a new chat you agree to the {AI_NAME} Terms and Conditions, click here to view them.
          </Button>
        </div>
      </Card>
    </section>
  )
}
