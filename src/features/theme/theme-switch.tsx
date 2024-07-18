"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import React, { useEffect, useState } from "react"

import { Button } from "@/features/ui/button"

export const ThemeSwitch: React.FC = () => {
  const { setTheme, resolvedTheme } = useTheme()
  const [classes, setClasses] = useState<{ dark: string; light: string }>({ dark: "", light: "" })

  useEffect(() => {
    if (!resolvedTheme) return
    if (resolvedTheme === "dark") setClasses({ light: "", dark: "bg-altBackgroundShade text-altButton" })
    if (resolvedTheme === "light") setClasses({ dark: "", light: "bg-altBackgroundShade text-altButton" })
  }, [resolvedTheme])

  return (
    <div className="flex h-8 w-[70px] items-center justify-center gap-2" aria-label="Theme Switch">
      <Button
        variant={"ghost"}
        className={`rounded-md hover:bg-altBackgroundShade hover:text-altButton focus-visible:ring-text ${classes.dark}`}
        onClick={() => setTheme("dark")}
        ariaLabel="Dark Mode"
      >
        <Moon size={18} />
      </Button>
      <Button
        variant={"ghost"}
        className={`rounded-md hover:bg-altBackgroundShade hover:text-altButton focus-visible:ring-text ${classes.light}`}
        onClick={() => setTheme("light")}
        ariaLabel="Light Mode"
      >
        <Sun size={18} />
      </Button>
    </div>
  )
}
