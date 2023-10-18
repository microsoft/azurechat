"use client";

import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  MessageCircle,
  PanelLeftClose,
  PanelRightClose,
  Triangle,
  Speech,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "../theme/theme-toggle";
import { UserProfile } from "../user-profile";

import { useSession } from "next-auth/react";
import { UpdateIndicator } from "../change-log/update-indicator";
import { useMenuContext } from "./menu-context";

export const MainMenu = () => {
  const { data: session } = useSession();
  const { isMenuOpen, toggleMenu } = useMenuContext();
  return (
    <div className="flex flex-col justify-between p-2">
      <div className="flex gap-2  flex-col  items-center">
        <Button
          onClick={toggleMenu}
          className="rounded-full w-[40px] h-[40px] p-1 text-primary"
          variant={"outline"}
        >
          {isMenuOpen ? <PanelLeftClose /> : <PanelRightClose />}
        </Button>
        <Button
          asChild
          className="rounded-full w-[40px] h-[40px] p-1 text-primary"
          variant={"outline"}
        >
          <Link href="/" title="Home">
            <img src="/ai-icon.png" />
          </Link>
        </Button>
        {/* <Button
          asChild
          className="rounded-full w-[40px] h-[40px] p-2 text-primary"
          variant={"outline"}
        >
          <Link href="/" title="Chat">
            <MessageCircle />
          </Link>
        </Button> */}
        <Button
          asChild
          className="rounded-full w-[40px] h-[40px] p-2 text-primary"
          variant={"outline"}
        >
          <Link href="https://microsoft.sharepoint.com/sites/PCN/SitePages/Find-a-Coach.aspx" title="Find a Coach" target="_blank">
            <Speech />
          </Link>
        </Button>
        <Button
          asChild
          className="rounded-full w-[40px] h-[40px] p-2 text-primary"
          variant={"outline"}
        >
          <Link href="https://whoplus.microsoft.com/" title="Find a Mentor" target="_blank">
            <Sparkles />
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
        ) : (
          <></>
        )}
        {/* <Button
          asChild
          className="rounded-full w-[40px] h-[40px] p-2 text-primary"
          variant={"outline"}
        >
          <Link href="/change-log" title="change log" className="relative">
            <Triangle />
            <UpdateIndicator />
          </Link>
        </Button> */}
      </div>
      <div className="flex flex-col gap-2 items-center">
        <ThemeToggle />
        <UserProfile />
      </div>
    </div>
  );
};
