"use client"

import { AI_NAME } from "@/features/theme/theme-config"
import { signIn } from "next-auth/react"
import { Button } from "@/features/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/features/ui/card"
import { signInProvider } from "@/app-global"

export const LogIn: React.FC = () => {
  return (
    <div className="flex h-full items-center justify-center">
      <Card className="flex min-w-[300px] flex-col gap-2">
        <CardHeader className="gap-2">
          <CardTitle className="flex gap-2 text-2xl">
            <span className="text-siteTitle">{AI_NAME}</span>
          </CardTitle>
          <CardDescription>Login in with your Queensland Government account</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button onClick={async () => await signIn(signInProvider)}>Log in to {AI_NAME}</Button>
        </CardContent>
      </Card>
    </div>
  )
}
