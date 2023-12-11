"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { CreateChatThread } from "../chat-services/chat-thread-service";
import { useEffect } from "react";
import { useSession } from "next-auth/react";


export const NewChat = async () => {

  const { data: session, status, update } = useSession()

  // Polling the session every 1 hour
  useEffect(() => {

  //   //set 1 hour interval for refetching the session
    const interval = setInterval(() => update(), 1000 * 60 * 60)
    // console.log("current session: ");
    return () => clearInterval(interval)
  }, [update])

  // Listen for when the page is visible, if the user switches tabs
  // and makes our tab visible again, re-fetch the session
  useEffect(() => {
    const visibilityHandler = () =>
      document.visibilityState === "visible" && update()
    window.addEventListener("visibilitychange", visibilityHandler, false)
    return () =>
      window.removeEventListener("visibilitychange", visibilityHandler, false)
  }, [update])



  const router = useRouter();
  const startNewChat = async () => {
    try {
      const newChatThread = await CreateChatThread();
      if (newChatThread) {
        router.push("/chat/" + newChatThread.id);
        router.refresh();
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <Button
      className="gap-2 rounded-full w-[40px] h-[40px] p-1 text-primary"
      variant={"outline"}
      onClick={() => startNewChat()}
    >
      <PlusCircle size={40} strokeWidth={1.2} />
    </Button>
  );
};
