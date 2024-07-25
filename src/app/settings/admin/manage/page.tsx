import { redirect } from "next/navigation"

import { APP_VERSION } from "@/app-global"

import Typography from "@/components/typography"
import { isAdmin } from "@/features/auth/helpers"

export const dynamic = "force-dynamic"

export default async function Home(): Promise<JSX.Element> {
  const admin = await isAdmin()
  if (!admin) return redirect("/")

  return (
    <div className="flex size-full flex-col items-center gap-4 bg-altBackground text-center text-foreground">
      <Typography variant="h3">
        <b>App Version {APP_VERSION}</b>
      </Typography>
      <Typography variant="h4">
        Welcome to the admin settings page. Here you can manage tenants, users, and other settings.
      </Typography>
      <Typography variant="h4" className="mt-[9rem]">
        <FancyQuote />
      </Typography>
    </div>
  )
}

type FancyQuoteProps = {
  quote?: string
  author?: string
  initialDelay?: number
}
function FancyQuote({
  quote = "With great power comes great responsibility.",
  author = " ~ Uncle Ben",
  initialDelay = 2,
}: FancyQuoteProps): JSX.Element {
  const quoteWords = quote.split(" ")
  const authorWords = author.split(" ")

  const renderWords = (words: string[], baseDelay: number): JSX.Element[] =>
    words.map((word, index) => (
      <span
        key={index}
        className="animate-[blurOut_0.8s_forwards_cubic-bezier(0.11,0,0.5,0)] opacity-0 blur-sm"
        style={getStyles(index, baseDelay)}
      >
        {word + " "}
      </span>
    ))
  return (
    <div className="scale-95 animate-[scale_3s_forwards_cubic-bezier(0.5,1,0.89,1)] italic">
      <b>{renderWords(quoteWords, initialDelay)}</b>
      <i>{renderWords(authorWords, initialDelay + (quoteWords.length * 2) / 10)}</i>
    </div>
  )
}

const getStyles = (index: number, baseDelay: number): React.CSSProperties => ({
  animationDelay: `${((index + 1) / 10 + baseDelay).toFixed(1)}s`,
})
