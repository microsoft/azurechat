"use client"

import React, { useEffect, useState } from "react"
import { getSession } from "next-auth/react"
import { MenuItem } from "@/components/menu"
import { FileText } from "lucide-react"

export const UserSettings = (): JSX.Element => {
  const [upn, setUPN] = useState<string | null>(null)

  useEffect(() => {
    const fetchSession = async (): Promise<void> => {
      try {
        const session = await getSession()

        if (session?.user?.upn) {
          setUPN(session.user.upn)
        }
      } catch (error) {
        console.error("Failed to get session:", error)
      }
    }

    void fetchSession()
  }, [])

  return (
    <>
      {upn && (
        <MenuItem href={`/settings/${upn}/details`}>
          <FileText size={16} /> <span>Personal Details</span>
        </MenuItem>
      )}
      <MenuItem href="/settings/history">
        <FileText size={16} /> <span>Chat History</span>
      </MenuItem>
      <MenuItem href="/settings/preferences">
        <FileText size={16} /> <span>QChat Preferences</span>
      </MenuItem>
      <MenuItem href="/settings/help">
        <FileText size={16} /> <span>Help & Support</span>
      </MenuItem>
    </>
  )
}
