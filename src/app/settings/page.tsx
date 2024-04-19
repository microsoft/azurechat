import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default function Home(): JSX.Element {
  redirect("/settings/details")
}
