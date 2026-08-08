import { ArrowUp } from "lucide-react";
import React from "react";

export const SubmitChat = React.forwardRef<
  HTMLButtonElement,
  React.HTMLAttributes<HTMLButtonElement> // Add ChatInputAreaProps to the type definition
>(({ ...props }, ref) => (
  <button
    type="submit"
    {...props}
    ref={ref}
    aria-label="Submit chat input"
    className="flex size-9 items-center justify-center rounded-full bg-foreground text-background transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
  >
    <ArrowUp size={18} />
  </button>
));
SubmitChat.displayName = "ChatInputArea";
