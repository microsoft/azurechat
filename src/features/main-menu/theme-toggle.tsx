"use client";
import { Tabs, TabsList, TabsTrigger } from "@/ui/tabs";
import { Laptop2, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export const ThemeToggle = () => {
  const { setTheme, theme } = useTheme();

  return (
    <Tabs defaultValue={theme} className="w-full">
      <TabsList className="flex flex-1">
        <TabsTrigger
          value="light"
          onClick={() => setTheme("light")}
          className="flex-1"
        >
          <Sun size={18} />
        </TabsTrigger>
        <TabsTrigger
          value="dark"
          onClick={() => setTheme("dark")}
          className="flex-1"
        >
          <Moon size={18} />
        </TabsTrigger>
        <TabsTrigger
          value="system"
          onClick={() => setTheme("system")}
          className="flex-1"
        >
          <Laptop2 size={18} />
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
