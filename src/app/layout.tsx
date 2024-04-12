import { GoogleAnalytics } from "@next/third-parties/google"
import type { Metadata } from "next"
import { Noto_Sans } from "next/font/google"

import "./globals.css"

import { Footer } from "./footer"
import { Header } from "./header"

import { GlobalConfigProvider } from "@/features/globals/global-client-config-context"
import { Providers } from "@/features/globals/providers"
import { AI_NAME } from "@/features/theme/theme-config"
import { ThemeProvider } from "@/features/theme/theme-provider"
import { NavBar } from "@/features/ui/navbar"
import { Toaster } from "@/features/ui/toaster"
import { cn } from "@/lib/utils"

const notoSans = Noto_Sans({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL("https://qchat.ai.qld.gov.au"),
  title: AI_NAME,
  applicationName: AI_NAME,
  authors: [{ name: "Queensland Government AI Unit", url: "https://www.qld.gov.au" }],
  description: AI_NAME + " the Queensland Government's AI Chatbot",
  generator: "Queensland Government AI Unit",
  keywords: ["Queensland", "Government", "AI", "Chatbot", "GenerativeAI", "VirtualAssistant", AI_NAME],
  referrer: "no-referrer",
  creator: "Queensland Government AI Unit",
  publisher: "Queensland Government AI Unit",
  robots: "no-index, follow",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/apple-icon.png",
    apple: "/apple-icon.png",
  },
}

export const dynamic = "force-dynamic"

export default function RootLayout({ children }: { children: React.ReactNode }): JSX.Element {
  const isProd = process.env.NEXT_PUBLIC_ENV === "production"

  return (
    <html lang="en-AU" suppressHydrationWarning className="size-full overflow-hidden text-sm">
      <body className={cn(notoSans.className, "flex size-full min-w-[400px] flex-col bg-background")}>
        {isProd && <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GTAG || "notset"} />}
        <GlobalConfigProvider>
          <Providers>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
              <Header />
              <NavBar />
              <main className="size-full overflow-auto bg-altBackground">{children}</main>
              <Footer />
              <Toaster />
            </ThemeProvider>
          </Providers>
        </GlobalConfigProvider>
      </body>
    </html>
  )
}
