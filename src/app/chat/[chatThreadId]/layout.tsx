import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"

import { APP_NAME } from "@/app-global"

import SettingsProvider from "@/features/settings/settings-provider"
import { GetTenantConfig } from "@/features/tenant-management/tenant-service"

export const dynamic = "force-dynamic"

export const metadata = {
  title: `${APP_NAME} Thread`,
  description: `${APP_NAME} - Thread`,
}

export default async function RootLayout({ children }: { children: React.ReactNode }): Promise<JSX.Element> {
  const session = await getServerSession()
  if (!session) return redirect("/")
  const config = await GetTenantConfig()
  if (config.status !== "OK") return redirect("/")

  return <SettingsProvider config={config.response}>{children}</SettingsProvider>
}
