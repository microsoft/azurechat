"use client"

import { LogIn, LogOut } from "lucide-react"
import { useSession, signIn, signOut } from "next-auth/react"
import React from "react"

import { signInProvider } from "@/app-global"

import Typography from "@/components/typography"
import { Button } from "@/features/ui/button"

export const UserComponent: React.FC = () => {
  const { data: session, status } = useSession({ required: false })

  if (status === "loading") {
    return <div className="flex h-[32px] w-full items-center justify-center opacity-50">Loading...</div>
  }

  return (
    <div>
      {session ? (
        <Button
          onClick={async () => await signOut({ callbackUrl: "/" })}
          className="flex items-center text-white"
          aria-label="Log out"
          variant="link"
        >
          <LogOut className="mr-2 text-darkAltButton" size={20} aria-hidden="true" />
          <Typography variant="span">Log out</Typography>
        </Button>
      ) : (
        <Button
          onClick={async () => await signIn(signInProvider, { callbackUrl: "/" })}
          className="flex items-center text-white"
          aria-label="Log in"
          variant="link"
        >
          <LogIn className="mr-2 text-darkAltButton" size={20} aria-hidden="true" />
          <Typography variant="span">Log in</Typography>
        </Button>
      )}
    </div>
  )
}
