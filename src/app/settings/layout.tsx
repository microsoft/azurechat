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
      <div className="grid size-full grid-cols-6 overflow-hidden">
        <SettingsMenu />
        <div className="col-span-6 size-full overflow-auto sm:col-span-5">
          <Card className="col-span-6 flex size-full flex-1 items-center justify-center overflow-auto sm:col-span-6 md:col-span-5 lg:col-span-4 xl:col-span-5">
            <div className="size-full bg-altBackground text-foreground shadow-sm">
              <section className="container mx-auto size-full justify-center gap-4 bg-altBackground">
                {children}
              </section>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
