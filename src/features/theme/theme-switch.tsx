"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

import { Tabs, TabsList, TabsTrigger } from "@/features/ui/tabs"

export function ThemeSwitch(): JSX.Element {
  const { setTheme, resolvedTheme } = useTheme()
  const [isThemeLoading, setIsThemeLoading] = useState(true)

  useEffect(() => {
    setIsThemeLoading(!resolvedTheme)
  }, [resolvedTheme])

  return (
    <Tabs defaultValue={resolvedTheme} aria-label="Theme Switch">
      <TabsList className="flex h-10 w-[70px] items-center justify-center gap-1">
        {" "}
        {isThemeLoading ? (
          <div className="flex size-full items-center justify-center">
            <span className="flex size-[35px] items-center justify-center rounded-md opacity-50">...</span>{" "}
          </div>
        ) : (
          <>
            <TabsTrigger
              value="dark"
              onClick={() => setTheme("dark")}
              className="size-[35px] rounded-md text-altButton hover:bg-altBackgroundShade hover:text-altButton focus:ring"
              aria-label="Switch to dark mode"
            >
              <Moon size={18} />
            </TabsTrigger>
            <TabsTrigger
              value="light"
              onClick={() => setTheme("light")}
              className="size-[35px] rounded-md text-altButton hover:bg-altBackgroundShade hover:text-altButton focus:ring"
              aria-label="Switch to light mode"
            >
              <Sun size={18} />
            </TabsTrigger>
          </>
        )}
      </TabsList>
    </Tabs>
  )
}
