import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"

import { AI_NAME } from "@/features/theme/theme-config"

export const dynamic = "force-dynamic"

export const metadata = {
  title: AI_NAME + " - Tenant Settings",
  description: AI_NAME + " - Tenant Settings",
}

export default async function RootLayout({ children }: { children: React.ReactNode }): Promise<JSX.Element> {
  const session = await getServerSession()
  if (!session) return redirect("/")

  return <>{children}</>
}
