import { AI_NAME } from "@/features/theme/theme-config"
import { UserSettingsMenu } from "@/features/user-management/user-menu"

export const dynamic = "force-dynamic"

export const metadata = {
  title: AI_NAME + " - Settings",
  description: AI_NAME,
}

export default function RootLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <>
      <div className="bg-card grid size-full grid-cols-6 overflow-hidden">
        <UserSettingsMenu />
        {children}
      </div>
    </>
  )
}
