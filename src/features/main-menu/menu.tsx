"use client";

import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  MessageCircle,
  PanelLeftClose,
  PanelRightClose,
  Home,
  Lightbulb,
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
      <div className="flex gap-5  flex-col  items-center">
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
        </Button>
        <Button
          asChild
          className="rounded-full w-[40px] h-[40px] p-2 text-primary"
          variant={"outline"}
        >
          <Link href="/chat" title="新しく会話を始める">
            <Home />
          </Link>
        </Button>
        {session?.user?.isAdmin ? (
          <Button
            asChild
            className="rounded-full w-[40px] h-[40px] p-2 text-primary"
            variant={"outline"}
          >
            <Link href="/reporting" title="管理者向けレポート">
              <LayoutDashboard />
            </Link>
          </Button>
        ) : (
          <></>
        )}
        {session?.user?.isAdmin ? (
        <Button
          asChild
          className="rounded-full w-[40px] h-[40px] p-2 text-primary"
          variant={"outline"}
        >
          <Link target="_blank" href='https://prompt.quel.jp/index.php?imode=1&theme=%E3%83%93%E3%82%B8%E3%83%8D%E3%82%B9' title="便利な使い方change log" className="relative">
            <Lightbulb />
            <UpdateIndicator />
          </Link>
        </Button>
        ) : (
          <></>
        )}
      </div>
      <div className="flex flex-col gap-2 items-center">
        <ThemeToggle />
        <UserProfile />
      </div>
    </div>
  );
};
