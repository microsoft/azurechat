import { Forward } from "lucide-react";
import React from "react";
import { Button } from "../../button";

export const SubmitChat = React.forwardRef<
  HTMLButtonElement,
  React.HTMLAttributes<HTMLButtonElement> // Add ChatInputAreaProps to the type definition
>(({ ...props }, ref) => (
  <Button
    size="icon"
    type="submit"
    {...props}
    ref={ref}
    aria-label="Submit chat input"
  >
    <Forward size={16} className="text-white" />
  </Button>
));
SubmitChat.displayName = "ChatInputArea";
