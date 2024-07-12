import { GoogleAnalytics } from "@next/third-parties/google"
import type { Metadata } from "next"
import { Noto_Sans } from "next/font/google"
import { getServerSession } from "next-auth/next"

import { APP_NAME } from "@/app-global"

import ErrorBoundary from "@/components/error-boundary"
import { LogIn } from "@/components/login/login"
import { GetApplicationSettings } from "@/features/application/application-service"
import ApplicationProvider from "@/features/globals/application-provider"
import { Providers } from "@/features/globals/providers"
import { applicationInsights } from "@/features/insights/app-insights"
import { AI_AUTHOR, AI_TAGLINE, APP_URL } from "@/features/theme/theme-config"
import { ThemeProvider } from "@/features/theme/theme-provider"
import { NavBar } from "@/features/ui/navbar"
import { Toaster } from "@/features/ui/toaster"
import { cn } from "@/lib/utils"

import { Footer } from "./footer"
import { Header } from "./header"

import "./globals.css"

const notoSans = Noto_Sans({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: APP_NAME,
  applicationName: APP_NAME,
  authors: [{ name: AI_AUTHOR, url: APP_URL }],
  description: `${APP_NAME} ${AI_TAGLINE}`,
  generator: AI_AUTHOR,
  keywords: ["AI", "Chatbot", "GenerativeAI", "VirtualAssistant", APP_NAME, AI_AUTHOR],
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

if (process.env.NEXT_PUBLIC_APPLICATIONINSIGHTS_CONNECTION_STRING)
  applicationInsights.initialize(process.env.NEXT_PUBLIC_APPLICATIONINSIGHTS_CONNECTION_STRING)

export default async function RootLayout({ children }: { children: React.ReactNode }): Promise<JSX.Element> {
  const session = await getServerSession()
  const settingsResult = await GetApplicationSettings()
  const settings = settingsResult.status === "OK" ? settingsResult.response : undefined

  const isProd = process.env.NODE_ENV === "production"
  const googleAnalyticsId = process.env.NEXT_PUBLIC_GTAG
  return (
    <html lang="en-AU" suppressHydrationWarning className="size-full overflow-hidden text-sm">
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/fse2tsb.css" />
      </head>
      <body className={cn(notoSans.className, "flex size-full min-w-[400px] flex-col bg-background")}>
        <ErrorBoundary>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <ApplicationProvider settings={settings}>
              <Providers>
                <Header />
                <NavBar />
                <main className="grid size-full grid-cols-12 overflow-auto bg-pattern-bg bg-repeat">
                  {!session ? (
                    <div className="col-span-12 size-full">
                      <LogIn />
                    </div>
                  ) : (
                    children
                  )}
                </main>
                <Footer />
                <Toaster />
              </Providers>
            </ApplicationProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
      {isProd && googleAnalyticsId && <GoogleAnalytics gaId={googleAnalyticsId} />}
    </html>
  )
}
