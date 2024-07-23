import { Session } from "next-auth"
import React from "react"

import Typography from "@/components/typography"
import { MenuItems, validateCondition } from "@/features/common/menu-items"
import { ThemeSwitch } from "@/features/theme/theme-switch"

export const NavBar: React.FC<{ session: Session | null }> = ({ session }) => {
  const visibleLinks = MenuItems.filter(validateCondition(session))

  return (
    <nav aria-label="Main navigation" className="m:h-[44px] border-b-4 border-accent bg-backgroundShade">
      <div className="container hidden md:block">
        <div dir="ltr" className="grid grid-cols-6">
          {visibleLinks.map(link => (
            <div key={link.name} className="relative col-span-1 flex min-h-[40px] items-center justify-center">
              <a
                key={link.name}
                href={link.href}
                className="group flex w-full flex-1 items-center justify-center rounded-md p-2 font-medium ring-offset-background transition-colors focus-within:ring-transparent hover:bg-altBackground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                {link.icon &&
                  React.createElement(link.icon, {
                    className: "h-6 w-5 mr-2",
                    "aria-hidden": "true",
                  })}
                <Typography variant="h3">{link.name}</Typography>
                <div className="absolute inset-x-0 bottom-0 border-b-4 border-darkAltButton opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </a>
            </div>
          ))}
          <div className="col-span-1 col-end-7 flex min-h-[40px] items-center justify-center">
            <ThemeSwitch />
          </div>
        </div>
      </div>
    </nav>
  )
}
