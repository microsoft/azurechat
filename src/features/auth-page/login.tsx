"use client";
import { AI_NAME } from "@/features/theme/theme-config";
import { FC, useEffect } from "react";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
// import { useRouter } from "next/router"; // Uncomment if using routing

interface LoginProps {
  isDevMode: boolean;
}

export const LogIn: FC<LoginProps> = (props) => {
  // Uncomment the following lines if you want to automatically redirect to the chat page
  /*
  const router = useRouter();

  useEffect(() => {
    router.push("/chat"); // Adjust the path according to your chat page
  }, []);
  */

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
          Access the chat without logging in
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <p>Welcome to the chat application! Click below to start chatting.</p>
        <Button onClick={() => window.location.href = "/chat"}>Go to Chat</Button>
      </CardContent>
    </Card>
  );
};
