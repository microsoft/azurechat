"use client"

import { usePathname } from "next/navigation"
import { Session } from "next-auth"
import { createElement } from "react"

import Typography from "@/components/typography"
import { MenuItems, validateCondition } from "@/features/common/menu-items"

export const NavBarItems = ({ session }: { session: Session | null }): JSX.Element[] => {
  const visibleLinks = MenuItems.filter(validateCondition(session))
  const pathname = usePathname()

  return visibleLinks.map(link => (
    <div key={link.name} className="relative col-span-1 flex min-h-[40px] items-center justify-center">
      <a
        key={link.name}
        href={link.href}
        className={`group flex w-full flex-1 items-center justify-center rounded-t-md p-2 font-medium ring-offset-background transition-colors focus-within:ring-transparent hover:bg-altBackground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 ${pathname.startsWith(link.href) ? "bg-background" : ""}`}
      >
        {link.icon &&
          createElement(link.icon, {
            className: "h-6 w-5 mr-2",
            "aria-hidden": "true",
          })}
        <Typography variant="h3">{link.name}</Typography>
        <div
          className={`absolute inset-x-0 bottom-0 border-b-4 border-darkAltButton opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${pathname.startsWith(link.href) ? "opacity-100" : "opacity-0"}`}
        />
      </a>
    </div>
  ))
}
