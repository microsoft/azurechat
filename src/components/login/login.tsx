"use client";
import { AI_NAME } from "@/features/theme/customise";
import { signIn } from "next-auth/react";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

export const LogIn = () => {
  return (
    <Card className="flex gap-2 flex-col min-w-[300px]">
      <CardHeader className="gap-2">
        <CardTitle className="text-2xl flex gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={"ai-icon.png"} />
          </Avatar>
          <span className="text-primary">{AI_NAME}</span>
        </CardTitle>
        <CardDescription>
          Login in with your GitHub or Microsoft 365 account
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Button onClick={() => signIn("github")}>GitHub</Button>
        <Button onClick={() => signIn("azure-ad")}> Microsoft 365</Button>
        {process.env.NODE_ENV === "development" && (
          <Button onClick={() => signIn("localdev")}>Basic Auth (DEV ONLY)</Button>
        )}
      </CardContent>
    </Card>
  );
};
