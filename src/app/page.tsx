import { LogIn } from "@/components/login/login"
import { userSession } from "@/features/auth/helpers"
import { Card } from "@/features/ui/card"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function Home(): Promise<JSX.Element> {
  const user = await userSession()
  if (user) {
    redirect("/chat")
  }
  return (
    <Card className="relative flex h-full flex-1 items-center justify-center overflow-hidden">
      <LogIn />
    </Card>
  )
}
