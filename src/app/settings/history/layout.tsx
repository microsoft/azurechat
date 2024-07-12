import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"

import { APP_NAME } from "@/app-global"

import ChatThreadsProvider from "@/features/chat/chat-ui/chat-threads-context"
import SettingsProvider from "@/features/settings/settings-provider"
import { GetTenantConfig } from "@/features/tenant-management/tenant-service"

export const metadata = {
  title: APP_NAME,
  description: APP_NAME,
}

export default async function RootLayout({ children }: { children: React.ReactNode }): Promise<JSX.Element> {
  const session = await getServerSession()
  if (!session) return redirect("/")

  const config = await GetTenantConfig()
  if (config.status !== "OK") return redirect("/")
  return (
    <SettingsProvider config={config.response}>
      <ChatThreadsProvider>
        <div className="col-span-12 size-full">{children}</div>
      </ChatThreadsProvider>
    </SettingsProvider>
  )
}
