import { GetFeatureFlags } from "@/features/common/feature-flags";
import { FeatureFlagsProvider } from "@/features/globals/feature-flags-context";
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
      <FeatureFlagsProvider flags={GetFeatureFlags()}>
        <div className={cn("flex flex-1 items-stretch")}>
          <MainMenu />
          <div className="flex-1 flex">{children}</div>
        </div>
      </FeatureFlagsProvider>
    </AuthenticatedProviders>
  );
}
