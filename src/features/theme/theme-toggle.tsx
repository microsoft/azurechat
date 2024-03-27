"use client"

import React from "react"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex space-x-4">
      <button
        onClick={() => setTheme("dark")}
        aria-label="Set dark theme"
        className={`${theme === "dark" ? "bg-gray-800 text-white" : "bg-gray-200"} rounded-full p-2`}
      >
        <Moon size={18} />
      </button>
      <button
        onClick={() => setTheme("light")}
        aria-label="Set light theme"
        className={`${theme === "light" ? "bg-yellow-500 text-white" : "bg-gray-200"} rounded-full p-2`}
      >
        <Sun size={18} />
      </button>
    </div>
  )
}
