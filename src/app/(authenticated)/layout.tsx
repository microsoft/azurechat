import { AuthenticatedProviders } from "@/features/globals/providers";
import { MainMenu } from "@/features/main-menu/main-menu";
import { AI_NAME } from "@/features/theme/theme-config";
import { cn } from "@/ui/lib";

export const dynamic = "force-dynamic";

export const metadata = {
  title: AI_NAME,
  description: AI_NAME,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthenticatedProviders>
      <div className={cn("flex flex-1 items-stretch")}>
        <img
          src={"login_ilustration1.svg"}
          className="absolute w-1/2 -top-36 -left-32"
        />
        <img
          src={"login_ilustration1.svg"}
          className="absolute top-auto left-1/2 transform -translate-x-1/4 w-2/3"
        />

        {/* <img src={"login_ilustration1.svg"} className="absolute" /> */}
        <MainMenu />
        <div className="flex-1 flex">{children}</div>
      </div>
    </AuthenticatedProviders>
  );
}
