import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"

import { SettingsMenu } from "@/features/settings/settings-menu"
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

  return (
    <SettingsProvider config={config.response}>
      <div className="col-span-2 size-full overflow-auto">
        <SettingsMenu />
      </div>
      <div className="col-span-10 size-full overflow-auto bg-altBackground">
        <section className="mx-auto size-full justify-center bg-altBackground">{children}</section>
      </div>
    </SettingsProvider>
  )
}
