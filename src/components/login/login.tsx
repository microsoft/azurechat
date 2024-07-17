"use client"

import { signIn, SignInResponse } from "next-auth/react"

import { signInProvider } from "@/app-global"
import { APP_NAME } from "@/app-global"

import { Button } from "@/features/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/features/ui/card"

const handleSignIn = async (): Promise<SignInResponse | undefined> => await signIn(signInProvider)

export const LogIn: React.FC = () => {
  return (
    <div className="flex h-full items-center justify-center">
      <Card className="flex min-w-[300px] flex-col rounded-md">
        <CardHeader className="gap-2 p-4">
          <CardTitle className="flex gap-2 text-2xl text-siteTitle">{APP_NAME}</CardTitle>
          <CardDescription>Login in with your Queensland Government account</CardDescription>
        </CardHeader>
        <CardContent className="grid justify-center p-4">
          <Button onClick={handleSignIn} className="max-w-[200px]">
            Log in to {APP_NAME}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
