"use client"

import { useRouter } from "next/navigation"
import React from "react"

import Typography from "@/components/typography"
import { useAppInsightsContext } from "@/features/insights/app-insights-context"
import { Button } from "@/features/ui/button"
import { Card } from "@/features/ui/card"

const Home: React.FC = () => {
  const router = useRouter()
  const { logError } = useAppInsightsContext()

  const handleRedirectHome = async (): Promise<void> => {
    try {
      await router.push("/")
      router.refresh()
    } catch (error) {
      if (error instanceof Error) {
        logError(new Error("Redirect failed"), { error: error.message })
      } else {
        logError(new Error("Redirect failed"))
      }
    }
  }

  return (
    <div className="flex h-full items-center justify-center">
      <Card className="flex min-w-[300px] flex-col rounded-md bg-altBackground p-8 text-foreground">
        <Typography variant="h3" className="text-xl font-semibold">
          You are not authorised to view this page
        </Typography>
        <Button onClick={handleRedirectHome} variant="link" ariaLabel="Return Home">
          Please click here to return home.
        </Button>
      </Card>
    </div>
  )
}

export default Home
