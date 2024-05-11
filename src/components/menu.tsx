import { UrlObject } from "url"

import Link from "next/link"
import * as React from "react"

import { cn } from "@/lib/utils"

const Menu = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("size-full overflow-auto bg-altBackground p-2", className)} {...props} />
))

Menu.displayName = "Menu"

const MenuHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center justify-between pb-2", className)} {...props} />
  )
)
MenuHeader.displayName = "MenuHeader"

const MenuContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-1 flex-col gap-1 overflow-y-auto py-2", className)} {...props} />
  )
)
MenuContent.displayName = "MenuContent"

interface MenuItemProps extends React.HTMLAttributes<HTMLAnchorElement> {
  href: UrlObject | string
  isSelected?: boolean
}

const MenuItem: React.FC<MenuItemProps> = ({ href, isSelected, children, className, ...props }) => {
  return (
    <Link
      href={href}
      className={cn(
        className,
        "flex border-separate items-center gap-2 rounded-md border-2 border-transparent p-2 text-base font-medium transition-colors hover:border-altButtonHover hover:bg-backgroundShade",
        isSelected ? "border-altBorder bg-backgroundShade" : ""
      )}
      {...props}
    >
      {children}
    </Link>
  )
}

const MenuFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("flex flex-col", className)} {...props} />
)
MenuFooter.displayName = "MenuFooter"

export { Menu, MenuContent, MenuFooter, MenuHeader, MenuItem }
