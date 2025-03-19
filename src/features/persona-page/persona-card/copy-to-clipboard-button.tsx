"use client";

import { FC, useState, useEffect } from "react";
import { Clipboard, Check, icons } from "lucide-react";
import { Button } from "../../ui/button";

interface CopyToClipboardButtonProps {
  relativeLink: string;
}

export const CopyToClipboardButton: FC<CopyToClipboardButtonProps> = ({ relativeLink: link }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin);
    }
  }, []);

  const copyToClipboard = async () => {
    const personaLink = `${baseUrl}${link}`;
    await navigator.clipboard.writeText(personaLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000); // Reset the copied state after 2 seconds
  };

  return (
    <Button
      className="flex items-center gap-2 px-[5px] py-2 rounded transition-colors"
      onClick={copyToClipboard}
      size={"icon"}
      asChild
    >
      {isCopied ? <Check size={18} /> : <Clipboard size={18} />}
    </Button>
  );
};