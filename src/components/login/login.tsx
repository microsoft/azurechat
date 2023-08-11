"use client";
import {AI_NAME} from "@/features/theme/customise";
import {signIn} from "next-auth/react";
import {Avatar, AvatarImage} from "../ui/avatar";
import {Button} from "../ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardSubTitle, CardTitle,} from "../ui/card";
import Image from "next/image";
import GoogleLogo from "../../../images/google__g__logo.svg"

export const LogIn = () => {
  return (
    <Card className="flex gap-2 flex-col min-w-[300px]">
      <CardHeader className="gap-2">
        <CardTitle className="text-2xl flex justify-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={"ai-icon.png"}/>
          </Avatar>
          <span className="text-primary">{AI_NAME}</span>
        </CardTitle>
        <CardSubTitle className="text-center">powered by ChatGPT</CardSubTitle>
        <CardDescription className="text-center">
          ログイン方法を選択してください
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Button onClick={() => signIn("google")} className="flex gap-2"><Image src={GoogleLogo} alt={"Googleでログイン"} height={20}
                                                                               width={20}/>Googleでログイン</Button>
        {/*<Button onClick={() => signIn("github")}>GitHubでログイン</Button>*/}
        {/*<Button onClick={() => signIn("azure-ad")}>Microsoft 365でログイン</Button>*/}
      </CardContent>
    </Card>
  );
};
