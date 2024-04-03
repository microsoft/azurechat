"use client"

import { LogOut, UserCircle } from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import React, { ReactElement } from "react"

import { Avatar, AvatarImage } from "@/features/ui/avatar"
import { Button } from "@/features/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/features/ui/dropdown-menu"

const UserProfile = (): ReactElement => {
  const { data: session } = useSession()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex flex-col items-stretch">
          <Button className="relative size-[40px] justify-center gap-2 rounded-full p-1" variant={"outline"}>
            {session?.user?.image ? (
              <Avatar className="">
                <AvatarImage src={session.user.image} alt={session.user.name ?? "You"} />
              </Avatar>
            ) : (
              <UserCircle />
            )}
          </Button>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{session?.user?.name ?? "Anonymous"}</p>
            <p className="text-xs leading-none text-muted-foreground">{session?.user?.email ?? "No email provided"}</p>
            <p className="text-xs leading-none text-muted-foreground">{session?.user?.qchatAdmin ? "Admin" : ""}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={async () => await signOut({ callbackUrl: "/" })}>
          <LogOut className="mr-2 size-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { UserProfile }
