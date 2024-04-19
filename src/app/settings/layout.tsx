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
        <div className="col-span-5 size-full">
          <Card className="col-span-6 flex h-full flex-1 items-center justify-center sm:col-span-6 md:col-span-5 lg:col-span-4 xl:col-span-5">
            <div className="col-span-5 h-full bg-altBackground text-foreground shadow-sm">
              <section className="container mx-auto size-full max-w-3xl justify-center gap-9 bg-altBackground">
                {children}
                <div className="col-span-5 gap-8 py-8 sm:col-span-6">
                  <div className="prose prose-slate max-w-4xl break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0"></div>
                </div>
              </section>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
