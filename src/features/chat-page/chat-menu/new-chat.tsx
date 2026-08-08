"use client";

import { Button } from "@/features/ui/button";
import { LoadingIndicator } from "@/features/ui/loading";
import { Plus } from "lucide-react";
import { useFormStatus } from "react-dom";

export const NewChat = () => {
  const { pending } = useFormStatus();

  return (
    <Button
      aria-disabled={pending}
      size={"default"}
      className="flex-1 flex gap-2 justify-start rounded-lg hover:bg-accent px-3"
      variant={"ghost"}
    >
      {pending ? <LoadingIndicator isLoading={pending} /> : <Plus size={16} />}
      New chat
    </Button>
  );
};
