"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import { menuIconProps } from "@/ui/menu";
import { CircleUserRound, LogOut } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { Avatar, AvatarImage } from "../ui/avatar";
import { ThemeToggle } from "./theme-toggle";

export const UserProfile = () => {
  const { data: session } = useSession();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {session?.user?.image ? (
          <Avatar className="">
            <AvatarImage
              src={session?.user?.image!}
              alt={session?.user?.name!}
            />
          </Avatar>
        ) : (
          <CircleUserRound {...menuIconProps} role="button" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" className="w-56" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium leading-none">
              {session?.user?.name}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {session?.user?.email}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {session?.user?.isAdmin ? "Admin" : ""}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium leading-none">Switch themes</p>
            <ThemeToggle />
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="flex gap-2"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut {...menuIconProps} size={18} />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
