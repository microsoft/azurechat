import { AI_NAME } from "@/features/theme/theme-config"

export const metadata = {
  title: AI_NAME + " Unathorised",
  description: AI_NAME + " - Unathorised",
}

export default function RootLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <>
      <div className="flex size-full items-center justify-center bg-altBackground">{children}</div>
    </>
  )
}
