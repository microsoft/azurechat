"use client";
import { AI_NAME } from "@/features/theme/theme-config";
import { signIn } from "next-auth/react";
import { FC, useState, useEffect } from "react";
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
}

export const LogIn: FC<LoginProps> = (props) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      <div className="flex gap-2 flex-col min-w-[300px] items-center w-[70%]">
        <div className="flex items-center gap-2">
          <img
            src={
              theme === "dark"
                ? "QuaBot_Light_Icon.svg"
                : "QuaBot_Dark_Icon.svg"
            }
            width={40}
          />
          <p className="text-3xl font-semibold">{AI_NAME}</p>
        </div>
        <div className="flex flex-col items-center mt-8 gap-4">
          <p>Login in with your Microsoft 365 account</p>
          <Button
            onClick={() => signIn("azure-ad")}
            className="dark:bg-white dark:hover:bg-primary hover:text-white bg-primary"
          >
            {" "}
            <img src={"login_microsoft_logo.svg"} className="pr-3" />
            Microsoft 365
          </Button>
          {props.isDevMode ? (
            <Button
              onClick={() => signIn("localdev")}
              className="
                dark:bg-white dark:hover:bg-primary dark:hover:text-white bg-primary"
            >
              Basic Auth (DEV ONLY)
            </Button>
          ) : null}
        </div>
      </div>
      <Card className="flex gap-2 flex-col min-w-[480px] relative bg-[#7022D3] dark:bg-opacity-40 bg-opacity-100  h-full w-1/2">
        <img
          src={"login_circles_illustration.svg"}
          className="absolute bottom-0"
          width="400px"
        />
        <Card className="bg-[#E32FAB] bg-opacity-25 border-solid border-white border-opacity-20 backdrop-blur-[8px] m-8 min-h-[458px] pt-8 pl-8 h-full">
          <CardTitle className="text-3xl text-white">
            Welcome to Q Bot!
          </CardTitle>
          <CardDescription className="text-white pt-3 pr-4 font-thin text-base">
            Q Bot is here to assist with your tasks quickly and efficiently.
          </CardDescription>
          <img
            src={"login_ilustration3.svg"}
            className="absolute right-4 -bottom-2 h-[310px]"
          />
        </Card>
      </Card>
    </>
  );
};
