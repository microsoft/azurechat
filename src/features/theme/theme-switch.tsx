"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

import Typography from "@/components/typography"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/features/ui/tabs"

export function ThemeSwitch(): JSX.Element {
  const { setTheme, resolvedTheme } = useTheme()
  const [isThemeLoading, setIsThemeLoading] = useState(true)
  const [clientResolvedTheme, setClientResolvedTheme] = useState<string | undefined>()

  useEffect(() => {
    setIsThemeLoading(!resolvedTheme)
    setClientResolvedTheme(resolvedTheme)
  }, [resolvedTheme])

  return (
    <Tabs defaultValue={clientResolvedTheme} aria-label="Theme Switch">
      <TabsList className="flex h-8 w-[70px] items-center justify-center gap-1">
        {isThemeLoading ? (
          <div className="flex size-full items-center justify-center">
            <Typography
              variant="span"
              className="flex size-[35px] items-center justify-center rounded-md opacity-50"
              aria-label="Loading themes..."
            >
              ...
            </Typography>
          </div>
        ) : (
          <>
            <TabsTrigger
              value="dark"
              onClick={() => setTheme("dark")}
              className="size-[35px] rounded-md text-altButton hover:bg-altBackgroundShade hover:text-altButton focus:ring"
              aria-controls="dark-mode-content"
              aria-selected={clientResolvedTheme === "dark" ? "true" : "false"}
              role="tab"
              aria-label="Switch to dark mode"
            >
              <Moon size={18} />
            </TabsTrigger>
            <TabsTrigger
              value="light"
              onClick={() => setTheme("light")}
              className="size-[35px] rounded-md text-altButton hover:bg-altBackgroundShade hover:text-altButton focus:ring"
              aria-controls="light-mode-content"
              aria-selected={clientResolvedTheme === "light" ? "true" : "false"}
              role="tab"
              aria-label="Switch to light mode"
            >
              <Sun size={18} />
            </TabsTrigger>
          </>
        )}
      </TabsList>
      <TabsContent id="dark-mode-content" value="dark" />
      <TabsContent id="light-mode-content" value="light" />
    </Tabs>
  )
}
