"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import React, { useEffect, useState, useCallback } from "react"

import Typography from "@/components/typography"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/features/ui/tabs"

export const ThemeSwitch: React.FC = () => {
  const { setTheme, resolvedTheme } = useTheme()
  const [isThemeLoading, setIsThemeLoading] = useState(true)
  const [clientResolvedTheme, setClientResolvedTheme] = useState<string | undefined>()

  useEffect(() => {
    setIsThemeLoading(!resolvedTheme)
    setClientResolvedTheme(resolvedTheme)
  }, [resolvedTheme])

  const handleSetDarkTheme = useCallback(() => {
    setTheme("dark")
  }, [setTheme])

  const handleSetLightTheme = useCallback(() => {
    setTheme("light")
  }, [setTheme])

  if (isThemeLoading) {
    return (
      <div className="flex size-full items-center justify-center">
        <Typography
          variant="span"
          className="flex size-[35px] items-center justify-center rounded-md opacity-50"
          aria-label="Loading themes..."
        >
          ...
        </Typography>
      </div>
    )
  }

  return (
    <Tabs defaultValue={clientResolvedTheme} aria-label="Theme Switch">
      <TabsList className="flex h-8 w-[70px] items-center justify-center gap-1">
        <TabsTrigger
          value="dark"
          onClick={handleSetDarkTheme}
          className={`size-[35px] rounded-md text-altButton hover:bg-altBackgroundShade hover:text-altButton focus:ring ${
            clientResolvedTheme === "dark" ? "bg-gray-800 text-white" : "bg-altBackground"
          }`}
          aria-controls="dark-mode-content"
          aria-selected={clientResolvedTheme === "dark" ? "true" : "false"}
          role="tab"
          aria-label="Switch to dark mode"
        >
          <Moon size={18} />
        </TabsTrigger>
        <TabsTrigger
          value="light"
          onClick={handleSetLightTheme}
          className={`size-[35px] rounded-md text-altButton hover:bg-altBackgroundShade hover:text-altButton focus:ring ${
            clientResolvedTheme === "light" ? "bg-yellow-500 text-white" : "bg-altBackground"
          }`}
          aria-controls="light-mode-content"
          aria-selected={clientResolvedTheme === "light" ? "true" : "false"}
          role="tab"
          aria-label="Switch to light mode"
        >
          <Sun size={18} />
        </TabsTrigger>
      </TabsList>
      <TabsContent id="dark-mode-content" value="dark" />
      <TabsContent id="light-mode-content" value="light" />
    </Tabs>
  )
}
