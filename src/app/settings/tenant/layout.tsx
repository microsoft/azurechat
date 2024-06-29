import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"

import { APP_NAME } from "@/app-global"

export const dynamic = "force-dynamic"

export const metadata = {
  title: `${APP_NAME} - Tenant Settings`,
  description: `${APP_NAME} - Tenant Settings`,
}

export default async function RootLayout({ children }: { children: React.ReactNode }): Promise<JSX.Element> {
  const session = await getServerSession()
  if (!session) return redirect("/")

  return <div className="mb-8 grid size-full w-full grid-cols-1 gap-8 p-4 pt-5 sm:grid-cols-2 sm:gap-2">{children}</div>
}
