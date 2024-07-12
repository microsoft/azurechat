import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"

import { APP_NAME } from "@/app-global"

import ErrorBoundary from "@/components/error-boundary"
import { ChatMenu } from "@/features/chat/chat-menu/chat-menu"
import { FindAllChatThreadForCurrentUser } from "@/features/chat/chat-services/chat-thread-service"
import ChatThreadsProvider from "@/features/chat/chat-ui/chat-threads-context"
import SettingsProvider from "@/features/settings/settings-provider"
import { GetTenantConfig } from "@/features/tenant-management/tenant-service"

export const dynamic = "force-dynamic"

export const metadata = {
  title: APP_NAME,
  description: APP_NAME,
}

export default async function RootLayout({ children }: { children: React.ReactNode }): Promise<JSX.Element> {
  const session = await getServerSession()
  if (!session) return redirect("/")

  const config = await GetTenantConfig()
  if (config.status !== "OK") return redirect("/")

  const threadsResult = await FindAllChatThreadForCurrentUser()
  const threads = threadsResult.status === "OK" ? threadsResult.response : undefined

  return (
    <SettingsProvider config={config.response}>
      <ChatThreadsProvider threads={threads}>
        <div className="col-span-3 size-full overflow-hidden">
          <ErrorBoundary>
            <ChatMenu />
          </ErrorBoundary>
        </div>
        <div className="col-span-9 size-full overflow-hidden">
          <ErrorBoundary>{children}</ErrorBoundary>
        </div>
      </ChatThreadsProvider>
    </SettingsProvider>
  )
}
