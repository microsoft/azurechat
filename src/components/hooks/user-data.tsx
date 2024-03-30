// Import React hooks in a consolidated manner
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { GetUserByUpn } from "@/features/user-management/user-service"
import { UserRecord } from "@/features/user-management/user-service"

interface UseUserDataReturnType {
  userData: UserRecord | null
  loading: boolean
  error: Error | null
}

export function useUserData(): UseUserDataReturnType {
  const { data: session, status } = useSession()
  const [userData, setUserData] = useState<UserRecord | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      if (session?.user) {
        setLoading(true)
        try {
          const response = await GetUserByUpn(session.user.tenantId, session.user.upn)

          // Check if the response is a success response
          if (response.status === "OK") {
            setUserData(response.response)
          } else {
            // Since it's not a success response, it must be an error response
            // This is safe because of the exhaustive check on `status`
            const errorMessage = response.errors?.[0]?.message || "Failed to fetch user data"
            throw new Error(errorMessage)
          }
        } catch (err) {
          setError(err instanceof Error ? err : new Error("An error occurred while fetching user data"))
        } finally {
          setLoading(false)
        }
      }
    }

    if (status === "authenticated") {
      fetchData().catch(err => {
        console.error("Error fetching data:", err)
      })
    }
  }, [session, status])

  return { userData, loading, error }
}
