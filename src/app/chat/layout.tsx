import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"

import { ChatMenu } from "@/features/chat/chat-menu/chat-menu"
import { ChatMenuContainer } from "@/features/chat/chat-menu/chat-menu-container"
import { AI_NAME } from "@/features/theme/theme-config"

export const dynamic = "force-dynamic"

export const metadata = {
  title: AI_NAME,
  description: AI_NAME,
}

export default async function RootLayout({ children }: { children: React.ReactNode }): Promise<JSX.Element> {
  const session = await getServerSession()
  if (!session) return redirect("/")

  return (
    <div className="grid h-full grid-cols-6 overflow-hidden bg-card/100">
      <ChatMenuContainer>
        <ChatMenu />
      </ChatMenuContainer>
      {children}
    </div>
  )
}
