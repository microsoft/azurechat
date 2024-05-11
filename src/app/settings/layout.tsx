import { SettingsMenu } from "@/features/settings/settings-menu"
import { AI_NAME } from "@/features/theme/theme-config"
import { Card } from "@/features/ui/card"

export const dynamic = "force-dynamic"

export const metadata = {
  title: AI_NAME + " Settings",
  description: AI_NAME + " - Settings",
}

export default function RootLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <>
      <div className="col-span-3 size-full overflow-auto">
        <SettingsMenu />
      </div>
      <div className="col-span-9 size-full overflow-auto">
        <Card className="size-full overflow-auto bg-altBackground">
          <div className="size-full bg-altBackground text-foreground">
            <section className="container mx-auto size-full justify-center gap-4 bg-altBackground">{children}</section>
          </div>
        </Card>
      </div>
    </>
  )
}
