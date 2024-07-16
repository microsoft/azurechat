"use client"

import { LogOut, LogIn } from "lucide-react"
import { Session } from "next-auth"
import { signIn, signOut } from "next-auth/react"

import { signInProvider } from "@/app-global"

import Typography from "@/components/typography"
import { Button } from "@/features/ui/button"

export const UserLoginLogout = ({ session }: { session: Session | null }): JSX.Element => {
  return session ? (
    <Button
      onClick={async () => await signOut({ callbackUrl: "/" })}
      className="flex items-center text-white focus-visible:ring-text"
      ariaLabel="Log out"
      variant="link"
    >
      <LogOut className="mr-2 text-darkAltButton" size={20} aria-hidden="true" />
      <Typography variant="span">Log out</Typography>
    </Button>
  ) : (
    <Button
      onClick={async () => await signIn(signInProvider, { callbackUrl: "/" })}
      className="flex items-center text-white"
      ariaLabel="Log in"
      variant="link"
    >
      <LogIn className="mr-2 text-darkAltButton" size={20} aria-hidden="true" />
      <Typography variant="span">Log in</Typography>
    </Button>
  )
}
