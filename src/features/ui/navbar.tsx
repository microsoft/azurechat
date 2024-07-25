import { Session } from "next-auth"
import React from "react"

import { ThemeSwitch } from "@/features/theme/theme-switch"

import { NavBarItems } from "./navbar-item"

export const NavBar = ({ session }: { session: Session | null }): JSX.Element => {
  return (
    <nav aria-label="Main navigation" className="m:h-[44px] border-b-4 border-accent bg-backgroundShade">
      <div className="container hidden md:block">
        <div dir="ltr" className="grid grid-cols-6">
          <NavBarItems session={session} />
          <div className="col-span-1 col-end-7 flex min-h-[40px] items-center justify-center">
            <ThemeSwitch />
          </div>
        </div>
      </div>
    </nav>
  )
}
