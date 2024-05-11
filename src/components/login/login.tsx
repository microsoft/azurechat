"use client"

import { signIn } from "next-auth/react"

import { signInProvider } from "@/app-global"

import { AI_NAME } from "@/features/theme/theme-config"
import { Button } from "@/features/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/features/ui/card"

export const LogIn: React.FC = () => {
  return (
    <div className="flex h-full items-center justify-center">
      <Card className="flex min-w-[300px] flex-col rounded-md">
        <CardHeader className="gap-2 p-4">
          <CardTitle className="flex gap-2 text-2xl text-siteTitle">{AI_NAME}</CardTitle>
          <CardDescription>Login in with your Queensland Government account</CardDescription>
        </CardHeader>
        <CardContent className="grid justify-center p-4">
          <Button onClick={async () => await signIn(signInProvider)} className="max-w-[200px]">
            Log in to {AI_NAME}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
