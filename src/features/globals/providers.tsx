"use client"

import { SessionProvider } from "next-auth/react"
import { GlobalMessageProvider } from "./global-message-context"
import { MenuProvider } from "@/features/main-menu/menu-context"
import { MiniMenuProvider } from "@/features/main-menu/mini-menu-context"
import { TooltipProvider } from "@/features/ui/tooltip-provider"
import AppInsightsProvider from "@/features/insights/app-insights-provider"

export const Providers = ({ children }: { children: React.ReactNode }): JSX.Element => {
  return (
    <SessionProvider refetchInterval={15 * 60} basePath="/api/auth">
      <AppInsightsProvider>
        <GlobalMessageProvider>
          <MenuProvider>
            <MiniMenuProvider>
              <TooltipProvider>{children}</TooltipProvider>
            </MiniMenuProvider>
          </MenuProvider>
        </GlobalMessageProvider>
      </AppInsightsProvider>
    </SessionProvider>
  )
}
