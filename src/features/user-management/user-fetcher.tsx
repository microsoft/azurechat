import { getSession } from "next-auth/react"
import React, { useEffect, useState, FC } from "react"

import { PromptForm } from "@/features/ui/form"
import { GetUserByUpn } from "@/features/user-management/user-service"
import { UserRecord } from "@/features/user-management/user-service"

export const UserDataFetcher: FC = () => {
  const [userData, setUserData] = useState<UserRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      setLoading(true)
      try {
        const session = await getSession()
        if (session?.user) {
          const response = await GetUserByUpn(session.user.tenantId, session.user.upn)
          if (response.status === "OK" && response.response) {
            setUserData(response.response)
          } else {
            throw new Error("Failed to fetch user data")
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("An error occurred"))
      } finally {
        setLoading(false)
      }
    }

    void fetchData()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  if (!userData) return <div>No user data found.</div>

  return <PromptForm />
}
