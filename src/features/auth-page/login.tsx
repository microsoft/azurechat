"use client";
import { AI_NAME } from "@/features/theme/theme-config";
import { signIn } from "next-auth/react";
import { FC } from "react";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";

interface LoginProps {
  isDevMode: boolean;
  githubEnabled: boolean;
  entraIdEnabled: boolean;
}

export const LogIn: FC<LoginProps> = (props) => {
  return (
    <div className="flex flex-col items-center gap-8 min-w-[320px]">
      <div className="flex flex-col items-center gap-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={"ai-icon.png"} alt="" />
        </Avatar>
        <h1 className="text-2xl font-normal tracking-tight">{AI_NAME}</h1>
        <p className="text-sm text-muted-foreground">
          Sign in with your BlazerID
        </p>
      </div>
      <div className="flex flex-col gap-2 w-full max-w-[280px]">
        {props.entraIdEnabled && (
          <Button
            className="rounded-full h-11"
            onClick={() => signIn("azure-ad")}
          >
            Continue with BlazerID
          </Button>
        )}
        {props.githubEnabled && (
          <Button
            variant={"outline"}
            className="rounded-full h-11"
            onClick={() => signIn("github")}
          >
            Continue with GitHub
          </Button>
        )}
        {props.isDevMode && (
          <Button
            variant={"outline"}
            className="rounded-full h-11"
            onClick={() => signIn("localdev")}
          >
            Basic auth (dev only)
          </Button>
        )}
      </div>
    </div>
  );
};
