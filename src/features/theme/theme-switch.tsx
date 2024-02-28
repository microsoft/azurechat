"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";

export function ThemeSwitch() {
  const { setTheme, resolvedTheme } = useTheme();
  const [isThemeLoading, setIsThemeLoading] = useState(true);

  // Simplify handling by removing the defaultTab state.
  // You can directly use resolvedTheme for the Tabs defaultValue,
  // which reduces the need for extra state management.
  useEffect(() => {
    setIsThemeLoading(!resolvedTheme); // Directly set loading state based on resolvedTheme presence.
  }, [resolvedTheme]);

  const handleTabChange = (value: string) => {
    setTheme(value);
  };

  if (isThemeLoading) {
    return <span>Loading theme...</span>; // Enhanced loading text for clarity.
  }

  return (
    <Tabs defaultValue={resolvedTheme} aria-label="Theme Switch">
      <TabsList className="flex flex-row items-center justify-center gap-1">
        <TabsTrigger
          value="dark"
          onClick={() => handleTabChange("dark")}
          className="h-[40px] w-[40px] rounded-md focus:ring text-altButton hover:bg-altBackgroundShade hover:text-altButton"
          aria-label="Switch to dark mode"
        >
          <Moon size={18} />
        </TabsTrigger>
        <TabsTrigger
          value="light"
          onClick={() => handleTabChange("light")}
          className="h-[40px] w-[40px] rounded-md focus:ring text-altButton hover:bg-altBackgroundShade hover:text-altButton"
          aria-label="Switch to light mode"
        >
          <Sun size={18} />
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
