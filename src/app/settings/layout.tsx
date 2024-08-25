import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"

import { APP_NAME } from "@/app-global"

import { GetTenantConfig } from "@/features/services/tenant-service"
import { SettingsMenu } from "@/features/settings/settings-menu"
import SettingsProvider from "@/features/settings/settings-provider"

export const dynamic = "force-dynamic"

export const metadata = {
  title: `${APP_NAME} Settings`,
  description: `${APP_NAME} - Settings`,
}

export default async function RootLayout({ children }: { children: React.ReactNode }): Promise<JSX.Element> {
  const [session, config] = await Promise.all([getServerSession(), GetTenantConfig()])
  if (!session || config.status !== "OK") return redirect("/")

  return (
    <SettingsProvider config={config.response}>
      <div className="col-span-2 size-full overflow-auto">
        <SettingsMenu />
      </div>
      <div className="col-span-10 size-full overflow-auto bg-altBackground">
        <section className="mx-auto size-full justify-center bg-altBackground p-4">{children}</section>
      </div>
    </SettingsProvider>
  )
}
