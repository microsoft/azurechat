import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"

import { ContextGuide, UserDetailsForm } from "@/features/settings/user-details"
import { UserPreferences } from "@/features/user-management/models"
import { GetUserPreferences } from "@/features/user-management/user-service"

const getUserPreferences = async (): Promise<UserPreferences> => {
  const result = await GetUserPreferences()
  if (result.status !== "OK") throw new Error("Failed to get user preferences")
  return result.response
}

export const dynamic = "force-dynamic"
export default async function Home(): Promise<JSX.Element> {
  const preferences = await getUserPreferences()
  const session = await getServerSession()
  if (!session) return redirect("/")

  return (
    <div className="mb-8 grid size-full w-full grid-cols-1 gap-8 p-4 pt-5 sm:grid-cols-2 sm:gap-2">
      <div>
        <UserDetailsForm preferences={preferences} name={session.user?.name || ""} email={session.user?.email || ""} />
      </div>
      <div>
        <ContextGuide />
      </div>
    </div>
  )
}
