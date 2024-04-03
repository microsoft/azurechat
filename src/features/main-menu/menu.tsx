"use client"

import { LayoutDashboard, PanelLeftClose, PanelRightClose, Home } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"

import { ThemeToggle } from "@/features/theme/theme-toggle"
import { Button } from "@/features/ui/button"
import { UserProfile } from "@/features/user-profile"

import { useMenuContext } from "./menu-context"

export const MainMenu = (): JSX.Element => {
  const { data: session } = useSession()
  const { isMenuOpen, toggleMenu } = useMenuContext()
  return (
    <div className="flex flex-col justify-between p-2">
      <div className="flex flex-col  items-center  gap-2">
        <Button onClick={toggleMenu} variant={"menuRound"}>
          {isMenuOpen ? <PanelLeftClose /> : <PanelRightClose />}
        </Button>
        <Button asChild variant={"menuRound"}>
          <Link href="/" title="Home">
            <Home />
          </Link>
        </Button>
        {session?.user?.qchatAdmin && (
          <Button asChild variant={"menuRound"}>
            <Link href="/reporting" title="Reporting">
              <LayoutDashboard />
            </Link>
          </Button>
        )}
      </div>
      <div className="flex flex-col items-center gap-2">
        <ThemeToggle />
        <UserProfile />
      </div>
    </div>
  )
}
