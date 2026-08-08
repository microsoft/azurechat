"use client";
import { cn } from "@/ui/lib";
import { CheckIcon, ClipboardIcon, FileText, PocketKnife } from "lucide-react";
import { useEffect, useState } from "react";

const AttachedDocuments = (props: {
  documents?: Array<{ id: string; name: string }>;
}) => {
  if (!props.documents || props.documents.length === 0) return null;
  return (
    <ul className="w-full flex flex-col items-end gap-1">
      {props.documents.map((document) => (
        <li
          key={document.id}
          className="flex items-center gap-1.5 text-xs text-muted-foreground max-w-[75%]"
        >
          <FileText size={13} className="shrink-0" />
          <span className="truncate">{document.name}</span>
        </li>
      ))}
    </ul>
  );
};

const CopyButton = (props: { copied: boolean; onClick: () => void }) => (
  <button
    type="button"
    title="Copy text"
    aria-label="Copy text"
    onClick={props.onClick}
    className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
  >
    {props.copied ? <CheckIcon size={15} /> : <ClipboardIcon size={15} />}
  </button>
);

export const ChatMessageArea = (props: {
  children?: React.ReactNode;
  profilePicture?: string | null;
  profileName?: string;
  role: "function" | "user" | "assistant" | "system" | "tool";
  documents?: Array<{ id: string; name: string }>;
  onCopy: () => void;
}) => {
  const [isIconChecked, setIsIconChecked] = useState(false);

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

  const prose =
    "prose prose-slate dark:prose-invert whitespace-break-spaces prose-p:leading-relaxed prose-pre:p-0 max-w-none";

  // User turns read as a right-aligned bubble; the author is unambiguous from
  // the alignment, so no avatar or name row.
  if (props.role === "user") {
    return (
      <div className="group flex flex-col items-end gap-1">
        <div
          className={cn(
            prose,
            "bg-secondary dark:bg-accent rounded-3xl px-5 py-2.5 max-w-[75%] overflow-hidden"
          )}
        >
          {props.children}
        </div>
        <AttachedDocuments documents={props.documents} />
        <CopyButton copied={isIconChecked} onClick={handleButtonClick} />
      </div>
    );
  }

  // Tool and function turns are diagnostic output, so they keep a label.
  if (props.role === "function" || props.role === "tool") {
    return (
      <div className="group flex flex-col gap-1">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <PocketKnife size={16} strokeWidth={1.6} />
          {props.profileName}
        </div>
        <div className={prose}>{props.children}</div>
      </div>
    );
  }

  return (
    <div className="group flex flex-col gap-1">
      <div className={prose}>{props.children}</div>
      <div className="flex">
        <CopyButton copied={isIconChecked} onClick={handleButtonClick} />
      </div>
    </div>
  );
};
