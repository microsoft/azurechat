"use client"

import { SessionProvider } from "next-auth/react"

import Announcements from "./announcements"
import { GlobalMessageProvider } from "./global-message-context"

export const Providers = ({ children }: { children: React.ReactNode }): JSX.Element => {
  return (
    <SessionProvider refetchInterval={15 * 60} basePath="/api/auth">
      <GlobalMessageProvider>
        <Announcements />
        {children}
      </GlobalMessageProvider>
    </SessionProvider>
  )
}
