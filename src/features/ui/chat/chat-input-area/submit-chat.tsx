import { Send } from "lucide-react";
import React from "react";
import { Button } from "../../button";

export const SubmitChat = React.forwardRef<
  HTMLButtonElement,
  React.HTMLAttributes<HTMLButtonElement> // Add ChatInputAreaProps to the type definition
>(({ ...props }, ref) => (
  <Button size="icon" type="submit" variant={"ghost"} {...props} ref={ref} aria-label="Submit chat input">
    <Send size={16} />
  </Button>
));
SubmitChat.displayName = "ChatInputArea";
