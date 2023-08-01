"use client";

import { Laptop2, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  return (
    <Tabs defaultValue={theme}>
      <TabsList className="grid grid-cols-3 items-stretch p-1 h-10">
        <TabsTrigger value="light" onClick={() => setTheme("light")}>
          <Sun size={18} />
        </TabsTrigger>
        <TabsTrigger value="dark" onClick={() => setTheme("dark")}>
          <Moon size={18} />
        </TabsTrigger>
        <TabsTrigger value="system" onClick={() => setTheme("system")}>
          <Laptop2 size={18} />
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
