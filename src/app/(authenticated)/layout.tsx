import { AuthenticatedProviders } from "@/features/globals/providers";
import { MainMenu } from "@/features/main-menu/main-menu";
import { AI_NAME } from "@/features/theme/theme-config";
import ApplicationInsightsProvider from "./application-insights-provider";
import { cn } from "@/ui/lib";

import { unstable_noStore as noStore } from "next/cache";
import InfoModal from "@/features/common/info-modal";

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
  noStore();
  const instrumentationKey = process.env.APPINSIGHTS_INSTRUMENTATIONKEY || "";
  return (
    <AuthenticatedProviders>
      <ApplicationInsightsProvider instrumentationKey={instrumentationKey}>
        <div className={cn("flex flex-1 items-stretch")}>
          <MainMenu />
          <div className="flex-1 flex">{children}</div>
        </div>
        <InfoModal/>
      </ApplicationInsightsProvider>
    </AuthenticatedProviders>
  );
}
