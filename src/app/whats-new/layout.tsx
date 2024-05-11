import { AI_NAME } from "@/features/theme/theme-config"

export const dynamic = "force-dynamic"

export const metadata = {
  title: AI_NAME + " Updates",
  description: AI_NAME + " - What's New",
}

export default function RootLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return <div className="col-span-12 size-full">{children}</div>
}
