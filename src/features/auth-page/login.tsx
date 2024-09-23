"use client";
import { AI_NAME } from "@/features/theme/theme-config";
import { signIn } from "next-auth/react";
import { FC } from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

interface LoginProps {
  isDevMode: boolean;
}

export const LogIn: FC<LoginProps> = (props) => {
  return (
    <Card className="flex gap-2 flex-col min-w-[300px]">
      <CardHeader className="gap-2">
        <div className="flex items-center justify-between">
          <img src="ai-icon.png" alt="AI Logo" className="w-1/2" />
          <div className="flex w-1/2 items-center justify-center pl-2">
            <CardTitle className="text-2xl text-primary text-center">
              {AI_NAME}
            </CardTitle>
          </div>
        </div>
        <CardDescription className="text-center">
          Login in with your GitHub or Microsoft 365 account
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Button onClick={() => signIn("github")}>GitHub</Button>
        <Button onClick={() => signIn("azure-ad")}>Microsoft 365</Button>
        {props.isDevMode ? (
          <Button onClick={() => signIn("localdev")}>Basic Auth (DEV ONLY)</Button>
        ) : null}
      </CardContent>
    </Card>
  );
};
