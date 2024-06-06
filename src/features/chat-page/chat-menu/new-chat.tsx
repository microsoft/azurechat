"use client";

import { Button } from "@/features/ui/button";
import { LoadingIndicator } from "@/features/ui/loading";
import { MessageCirclePlus } from "lucide-react";
import { useFormStatus } from "react-dom";

export const NewChat = () => {
  const { pending } = useFormStatus();

  return (
    <Button
      aria-disabled={pending}
      size={"default"}
      className="flex gap-2 bg-primary text-white w-full mr-8"
      variant={"outline"}
    >
      {pending ? (
        <LoadingIndicator isLoading={pending} />
      ) : (
        <MessageCirclePlus size={18} />
      )}
      New Chat
    </Button>
  );
};
