import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { BarChartHorizontalBig } from "lucide-react";
import Link from "next/link";
import { UserProfile } from "../user-profile";

export const MainMenu = () => {
  return (
    <div className="flex gap-3 flex-col justify-between">
      <div>
        <Link
          href="/"
          className="w-10 h-10 items-center justify-center flex"
          title="Home"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src="/ai-icon.png" />
          </Avatar>
        </Link>
        <Link
          href="/reporting"
          className="w-10 h-10 p-2 items-center justify-center flex border rounded-full"
          title="Reporting"
        >
          <BarChartHorizontalBig />
        </Link>
      </div>
      <UserProfile />
    </div>
  );
};
