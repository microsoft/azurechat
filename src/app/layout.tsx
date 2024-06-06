import { AI_NAME } from "@/features/theme/theme-config";
import { ThemeProvider } from "@/features/theme/theme-provider";
import { Toaster } from "@/features/ui/toaster";
import { cn } from "@/ui/lib";
import { geistMono } from "./fonts";
import "./globals.css";

export const metadata = {
  title: AI_NAME,
  description: AI_NAME,
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full w-full overflow-hidden text-sm">
      <body
        className={cn(
          geistMono.className,
          "h-full w-full flex bg-background antialiased"
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          // enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
