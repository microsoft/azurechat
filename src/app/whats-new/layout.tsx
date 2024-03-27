import { AI_NAME } from "@/features/theme/theme-config"

export const dynamic = "force-dynamic"

export const metadata = {
  title: AI_NAME,
  description: AI_NAME,
}

export default function RootLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return <div className="flex h-full flex-1 overflow-scroll bg-card/70">{children}</div>
}
