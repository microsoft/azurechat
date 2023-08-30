"use client";

import { Button } from "@/components/ui/button";
import { LayoutDashboard, MessageCircle } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "../theme/theme-toggle";
import { UserProfile } from "../user-profile";

import { useSession } from "next-auth/react";

export const MainMenu = () => {
  const { data: session } = useSession();
  return (
    <div className="flex flex-col justify-between p-2">
      <div className="flex gap-2 flex-col items-center">
      <Button
          asChild
          className="rounded-full w-[40px] h-[40px] p-1 text-primary"
          variant={"outline"}
        >
          <Link href="/" title="Home">
            <img src="/ai-icon.png" />
          </Link>
        </Button>
        <Button
          asChild
          className="rounded-full w-[40px] h-[40px] p-2 text-primary"
          variant={"outline"}
        >
          <Link href="/" title="Chat">
            <MessageCircle />
          </Link>
        </Button>
        {session?.user?.isAdmin ? (
          <Button
            asChild
            className="rounded-full w-[40px] h-[40px] p-2 text-primary"
            variant={"outline"}
          >
            <Link href="/reporting" title="Reporting">
              <LayoutDashboard />
            </Link>
          </Button>
        ) : (<></>)}
      </div>
      <div className="flex flex-col gap-2">
        <ThemeToggle />
        <UserProfile />
      </div>
    </div>
  );
};
