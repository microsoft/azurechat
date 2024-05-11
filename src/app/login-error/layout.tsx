import { AI_NAME } from "@/features/theme/theme-config"

export const metadata = {
  title: AI_NAME + " Login Error",
  description: AI_NAME + " - Login Error",
}

export default function RootLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <>
      <div className="col-span-12 size-full">{children}</div>
    </>
  )
}
