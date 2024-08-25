import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"

import { APP_NAME } from "@/app-global"

import ChatThreadsProvider from "@/features/chat/chat-ui/chat-threads-context"
import { GetTenantConfig } from "@/features/services/tenant-service"
import SettingsProvider from "@/features/settings/settings-provider"

export const metadata = {
  title: APP_NAME,
  description: APP_NAME,
}

export default async function RootLayout({ children }: { children: React.ReactNode }): Promise<JSX.Element> {
  const [session, config] = await Promise.all([getServerSession(), GetTenantConfig()])
  if (!session || config.status !== "OK") return redirect("/")

  return (
    <SettingsProvider config={config.response}>
      <ChatThreadsProvider>
        <div className="col-span-12 size-full">{children}</div>
      </ChatThreadsProvider>
    </SettingsProvider>
  )
}
