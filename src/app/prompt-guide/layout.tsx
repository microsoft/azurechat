import { AI_NAME } from "@/features/theme/theme-config"

export const dynamic = "force-dynamic"

export const metadata = {
  title: AI_NAME + " Prompting",
  description: AI_NAME + " Prompt Guide",
}

export default function RootLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <>
      <div className="flex flex-1 bg-card/70">{children}</div>
    </>
  )
}
