"use client";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, UserCircle } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

const UserProfile = () => {
  const { data: session } = useSession();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex flex-col items-stretch">
          <Button
            className="rounded-full w-[40px] h-[40px] p-1 text-primary relative gap-2 justify-center"
            variant={"outline"}
          >
            {session?.user?.image ? (
              <Avatar className="">
                <AvatarImage
                  src={session?.user?.image!}
                  alt={session?.user?.name!}
                />
              </Avatar>
            ) : (
              <UserCircle></UserCircle>
            )}
          </Button>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
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
        <DropdownMenuItem onClick={() => signOut({callbackUrl: '/' })}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { UserProfile };
