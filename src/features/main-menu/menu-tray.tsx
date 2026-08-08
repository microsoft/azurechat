"use client";

import { cn } from "@/ui/lib";
import React from "react";
import { useMenuState } from "./menu-store";

export const MenuTray = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { isMenuOpen } = useMenuState();
  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col bg-secondary overflow-hidden transition-all duration-300 w-64",
        isMenuOpen ? "translate-x-0" : "-translate-x-full -ml-64",
        className
      )}
      {...props}
    >
      {props.children}
    </div>
  );
});
MenuTray.displayName = "MenuTray";
