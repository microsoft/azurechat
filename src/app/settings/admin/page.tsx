import { redirect } from "next/navigation"

import { isAdmin } from "@/features/auth/helpers"

export const dynamic = "force-dynamic"

export default async function Home(): Promise<JSX.Element> {
  const admin = await isAdmin()
  if (!admin) return redirect("/")
  return redirect("/settings/admin/tenants")
}
