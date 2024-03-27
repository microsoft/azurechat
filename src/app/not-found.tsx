import Typography from "@/components/typography"
import { Card } from "@/features/ui/card"
import { userSession } from "@/features/auth/helpers"
import Link from "next/link"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function Home(): Promise<JSX.Element> {
  const user = await userSession()
  if (user) {
    redirect("/chat")
  }
  return (
    <Card className="relative flex h-full min-w-[300px] flex-1 flex-col items-center justify-center gap-2 overflow-hidden">
      <Typography variant="h1">Uh-Oh</Typography>
      <Typography variant="p">We couldn&apos;t find that page</Typography>
      <br />
      <Link href="/">
        <span className="inline-block rounded bg-blue-500 px-4 py-2 text-white transition duration-150 ease-in-out hover:bg-blue-700">
          Return Home
        </span>
      </Link>
    </Card>
  )
}
