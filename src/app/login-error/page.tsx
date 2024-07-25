"use client"

import { SquareArrowOutUpRightIcon } from "lucide-react"
import React, { useEffect, useState } from "react"

import { APP_NAME, errorMessages, INTRANET_NAME, INTRANET_URL } from "@/app-global"

import { SignInErrorType } from "@/features/auth/sign-in"
import { Button } from "@/features/ui/button"
import { Card, CardContent, CardHeader, CardDescription } from "@/features/ui/card"

const ErrorPage: React.FC = () => {
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [displaySupportButton, setDisplaySupportButton] = useState<boolean>(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    const urlParams = new URLSearchParams(window.location.search)
    const errorType = urlParams.get("error") as SignInErrorType | null

    let message = ""
    let showSupportButton = false

    switch (errorType) {
      case SignInErrorType.NotAuthorised:
        message = errorMessages.NotAuthorised
        showSupportButton = false
        break
      case SignInErrorType.SignInFailed:
        message = errorMessages.SignInFailed
        showSupportButton = true
        break
      default:
        message = errorMessages.UnknownError
        showSupportButton = true
        break
    }

    setErrorMessage(message)
    setDisplaySupportButton(showSupportButton)
  }, [])

  return (
    <div className="flex size-full items-center justify-center">
      <Card className="flex min-w-[300px] max-w-[700px] flex-col gap-2 rounded-md">
        <CardHeader className="items-center justify-center gap-2">
          Uh-oh we ran into an error signing you in!
          <CardDescription className="items-center justify-center">{errorMessage}</CardDescription>
        </CardHeader>
        <CardContent className="grid items-center justify-center gap-4">
          {displaySupportButton && (
            <Button asChild variant="link" ariaLabel="Support">
              <a href="/support" target="_blank" className="inline-flex max-w-[300px] items-center gap-2 text-text">
                Contact {APP_NAME} Support
                <SquareArrowOutUpRightIcon size={18} />
              </a>
            </Button>
          )}
          <Button asChild variant="link" ariaLabel="Find out more">
            <a href={INTRANET_URL} target="_blank" className="inline-flex max-w-[300px] items-center gap-2 text-text">
              Find out more about {APP_NAME} on {INTRANET_NAME}
              <SquareArrowOutUpRightIcon size={18} />
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default ErrorPage
