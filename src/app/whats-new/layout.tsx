import { AI_NAME } from "@/features/theme/theme-config"

export const dynamic = "force-dynamic"

export const metadata = {
  title: AI_NAME + " Updates",
  description: AI_NAME + "  - What's New",
}

export default function RootLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return <div className="flex size-full flex-1 bg-card/70">{children}</div>
}
