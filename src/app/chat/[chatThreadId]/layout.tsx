import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"

import SettingsProvider from "@/features/settings/settings-provider"
import { GetTenantConfig } from "@/features/tenant-management/tenant-service"
import { AI_NAME } from "@/features/theme/theme-config"

export const dynamic = "force-dynamic"

export const metadata = {
  title: AI_NAME + " Settings",
  description: AI_NAME + " - Settings",
}

export default async function RootLayout({ children }: { children: React.ReactNode }): Promise<JSX.Element> {
  const session = await getServerSession()
  if (!session) return redirect("/")
  const config = await GetTenantConfig()
  if (config.status !== "OK") return redirect("/")

  return <SettingsProvider config={config.response}>{children}</SettingsProvider>
}
