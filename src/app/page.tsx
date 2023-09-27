import { LogIn } from "@/components/login/login";
import { Card } from "@/components/ui/card";
import { userSession } from "@/features/auth/helpers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await userSession();
  if (user) {
    redirect("/chat");
  }
  return (
    <Card className="h-full flex-1 overflow-hidden relative items-center justify-center flex">
      <LogIn />
    </Card>
  );
}
