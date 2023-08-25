import * as React from "react";

import { cn } from "@/lib/utils";
import Link from "next/link";

const Menu = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("w-80 flex flex-col", className)} {...props} />
));

Menu.displayName = "Menu";

const MenuHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex pb-2 justify-between items-center", className)}
    {...props}
  />
));
MenuHeader.displayName = "MenuHeader";

const MenuContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col flex-1 overflow-y-auto py-2 gap-0.5",
      className
    )}
    {...props}
  />
));
MenuContent.displayName = "MenuContent";

interface MenuItemProps extends React.HTMLAttributes<HTMLLinkElement> {
  href: string;
  isSelected?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = (props) => {
  return (
    <Link
      className={cn(
        props.className,
        "items-center text-sm font-medium flex gap-2 p-2 py-1 rounded-md hover:bg-primary/25",
        props.isSelected && "bg-primary/25"
      )}
      href={props.href}
    >
      {props.children}
    </Link>
  );
};

const MenuFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col", className)} {...props} />
));
MenuFooter.displayName = "MenuFooter";

export { Menu, MenuContent, MenuFooter, MenuHeader, MenuItem };
