"use client";

import { Button } from "@/features/ui/button";
import { LoadingIndicator } from "@/features/ui/loading";
import { Plus } from "lucide-react";
import { useFormStatus } from "react-dom";

type bSize = "default" | "sm" | "lg"

interface NewChatProps {
  size?: bSize;
  textSize?: string;
}

export const NewChat: React.FC<NewChatProps> = ({ size = "default", textSize}) => {
  const { pending } = useFormStatus();
  const textStyle = { fontSize: textSize, fontWeight: "bold"}

  return (
    <Button
      aria-disabled={pending}
      size={size}
      className="flex gap-2"
      variant={"outline"}
    >
      {pending ? <LoadingIndicator isLoading={pending} /> : <Plus size={18} />}
      <span style={textStyle}>New Chat</span> {/* Apply custom text styles here */}
    </Button>
  );
};
