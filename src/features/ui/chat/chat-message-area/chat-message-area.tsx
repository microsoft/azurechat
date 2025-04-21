"use client";
import { cn } from "@/ui/lib";
import {
  CheckIcon,
  ClipboardIcon,
  PocketKnife,
  UserCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar, AvatarImage } from "../../avatar";
import { Button } from "../../button";
import Image from "next/image";


export const ChatMessageArea = (props: {
  children?: React.ReactNode;
  profilePicture?: string | null;
  profileName?: string;
  role: "function" | "user" | "assistant" | "system" | "tool";
  theme?: string;
  onCopy: () => void;
}) => {
  const [isIconChecked, setIsIconChecked] = useState(false);
  const isUser = props.role === "user";

  const handleButtonClick = () => {
    props.onCopy();
    setIsIconChecked(true);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsIconChecked(false);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [isIconChecked]);

  let profile = null;
  
  switch (props.role) {
    case "assistant":
      if (props.profilePicture) {
        profile = (
          <Avatar>
            <AvatarImage src={props.profilePicture} />
          </Avatar>
        );
      }
      break;
    case "user":
      if (props.profilePicture) {
        profile = (
          <Avatar>
            <AvatarImage src={props.profilePicture} />
          </Avatar>
        );
      } else {
        profile = (
          <UserCircle
            size={28}
            strokeWidth={1.4}
            className="text-muted-foreground"
          />
        );
      }
      break;
    case "tool":
    case "function":
      profile = (
        <PocketKnife
          size={28}
          strokeWidth={1.4}
          className="text-muted-foreground"
        />
      );
      break;
    default:
      break;
  }

  return (
    <div className={cn(
      "flex flex-col mb-6",
      isUser ? "items-end" : "items-start"
    )}>
      <div className={cn(
        "flex items-center gap-2 mb-1 w-full",
        isUser ? "flex-row-reverse justify-start" : "flex-row justify-start"
      )}>
        <div className={cn(
          "flex gap-3",
          isUser ? "flex-row-reverse" : "flex-row"
        )}>
          {profile}
          <div
            className={cn(
              "text-primary capitalize items-center flex",
              props.role === "function" || props.role === "tool"
                ? "text-muted-foreground text-sm"
                : "",
              props.theme === "dark" ? "text-white" : "text-black",
              isUser ? "mr-2" : "ml-2"
            )}
          >
            {props.profileName}
          </div>
        </div>
        <div className="ml-auto">
          <Button
            variant={"ghost"}
            size={"sm"}
            title="Copy text"
            className="justify-right flex"
            onClick={handleButtonClick}
          >
            {isIconChecked ? (
              <CheckIcon size={16} />
            ) : (
              <ClipboardIcon size={16} />
            )}
          </Button>
        </div>
      </div>
      <div className={cn(
        "flex flex-col gap-2 max-w-[85%]",
        isUser ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "prose prose-slate dark:prose-invert whitespace-break-spaces prose-p:leading-relaxed prose-pre:p-0",
          isUser 
            ? "bg-blue-50 dark:bg-blue-900/30 p-3 rounded-xl rounded-tr-none"
            : "bg-white dark:bg-slate-800 p-3 rounded-xl rounded-tl-none",
        )}>
          {props.children}
        </div>
      </div>
    </div>
  );
};
