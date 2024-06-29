"use client"

import { SessionProvider } from "next-auth/react"

import { MenuProvider } from "@/features/main-menu/menu-context"
import { MiniMenuProvider } from "@/features/main-menu/mini-menu-context"
import { TooltipProvider } from "@/features/ui/tooltip-provider"

import Announcements from "./announcements"
import { GlobalMessageProvider } from "./global-message-context"

export const Providers = ({ children }: { children: React.ReactNode }): JSX.Element => {
  return (
    <SessionProvider refetchInterval={15 * 60} basePath="/api/auth">
      <Announcements />
      <GlobalMessageProvider>
        <MenuProvider>
          <MiniMenuProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </MiniMenuProvider>
        </MenuProvider>
      </GlobalMessageProvider>
    </SessionProvider>
  )
}
