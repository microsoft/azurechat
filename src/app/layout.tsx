import { GoogleAnalytics } from "@next/third-parties/google"
import type { Metadata } from "next"
import { Noto_Sans } from "next/font/google"

import "./globals.css"

import { GlobalConfigProvider } from "@/features/globals/global-client-config-context"
import { Providers } from "@/features/globals/providers"
import { AI_AUTHOR, AI_NAME, AI_TAGLINE, APP_URL } from "@/features/theme/theme-config"
import { ThemeProvider } from "@/features/theme/theme-provider"
import { NavBar } from "@/features/ui/navbar"
import { Toaster } from "@/features/ui/toaster"
import { cn } from "@/lib/utils"

import { Footer } from "./footer"
import { Header } from "./header"

const notoSans = Noto_Sans({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: AI_NAME,
  applicationName: AI_NAME,
  authors: [{ name: AI_AUTHOR, url: APP_URL }],
  description: AI_NAME + " " + AI_TAGLINE,
  generator: AI_AUTHOR,
  keywords: ["AI", "Chatbot", "GenerativeAI", "VirtualAssistant", AI_NAME, AI_AUTHOR],
  referrer: "no-referrer",
  creator: AI_AUTHOR,
  publisher: AI_AUTHOR,
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
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/fse2tsb.css" />
      </head>
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
