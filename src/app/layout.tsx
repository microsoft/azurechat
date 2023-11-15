import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { GlobalConfigProvider } from "@/features/global-config/global-client-config-context";
import { Providers } from "@/features/providers";
import { AI_NAME } from "@/features/theme/customise";
import { cn } from "@/lib/utils";
import { Inter } from "next/font/google";
import "./globals.css";

export const dynamic = "force-dynamic";

const inter = Inter({ subsets: ["latin"] });

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
    <html lang="en" className="h-full overflow-hidden">
      <body className={cn(inter.className, "flex w-full h-full")}>
        <GlobalConfigProvider
          config={{ speechEnabled: process.env.PUBLIC_SPEECH_ENABLED }}
        >
          <Providers>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <div
                className={cn(
                  inter.className,
                  "flex w-full p-2 h-full gap-2 bg-primary"
                )}
              >
                {children}
              </div>

              <Toaster />
            </ThemeProvider>
          </Providers>
        </GlobalConfigProvider>
      </body>
    </html>
  );
}
