"use client";
import { AI_NAME } from "@/features/theme/theme-config";
import { signIn } from "next-auth/react";
import { FC } from "react";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { useTheme } from "next-themes";

interface LoginProps {
  isDevMode: boolean;
  githubEnabled: boolean;
  entraIdEnabled: boolean;
}

export const LogIn: FC<LoginProps> = (props) => {
  const { theme } = useTheme();
  
  return (
    <Card className="flex gap-2 flex-col min-h-[200px] min-w-[400px]">
      <CardHeader className="gap-32">
        <CardTitle className="text-2xl flex gap-2 items-center">
          <Avatar className="h-36 w-30">
            <AvatarImage src={theme === 'dark' ? "/Logo-COMAU-white.png" : "/ai-icon.png"} />
          </Avatar>
          <span className={theme === 'dark' ? "text-white" : "text-blue"}>AICO - AI for Comau</span>
        </CardTitle>
        {/* <CardDescription className="text-center text-sm">
        Welcome to Comau Generalist AI platform
        </CardDescription> */}
      </CardHeader>
      <CardContent className="grid gap-32 align-bottom">
        {props.githubEnabled && (
          <Button onClick={() => signIn("github")} className="bg-blue-500 hover:bg-blue-600">GitHub</Button>
        )}
        {props.entraIdEnabled && (
          <Button onClick={() => signIn("azure-ad")} className="bg-blue-500 hover:bg-blue-600">Login</Button>
        )}
        {props.isDevMode && (
          <Button onClick={() => signIn("localdev")} className="bg-blue-400 hover:bg-blue-600">
            Basic Auth (DEV ONLY)
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
