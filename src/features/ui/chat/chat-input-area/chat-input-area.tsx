"use client";

import { PHI_DISCLAIMER } from "@/features/theme/theme-config";
import { FileText } from "lucide-react";
import React from "react";
import { LoadingIndicator } from "../../loading";

export interface ChatInputDocument {
  id: string;
  name: string;
}

interface ChatInputAreaProps {
  status?: string;
  documents?: Array<ChatInputDocument>;
}

export const ChatInputForm = React.forwardRef<
  HTMLFormElement,
  React.HTMLAttributes<HTMLFormElement> & ChatInputAreaProps // Add ChatInputAreaProps to the type definition
>(({ status, documents, ...props }, ref) => (
  <div className="absolute bottom-0 w-full py-2 ">
    <div className="container max-w-3xl flex flex-col gap-1">
      <ChatInputStatus status={status} />
      <ChatInputDocuments documents={documents} />
      <div className="bg-background dark:bg-muted rounded-[28px] overflow-hidden border dark:border-transparent shadow-[0_2px_12px_rgba(0,0,0,0.06)] focus-within:shadow-[0_2px_16px_rgba(0,0,0,0.10)] transition-shadow">
        <form ref={ref} className="p-[2px]" {...props}>
          {props.children}
        </form>
      </div>
      <p className="text-center text-[11px] text-muted-foreground pb-1">
        {PHI_DISCLAIMER}
      </p>
    </div>
  </div>
));
ChatInputForm.displayName = "ChatInputArea";

export const ChatInputDocuments = (props: {
  documents?: Array<ChatInputDocument>;
}) => {
  if (!props.documents || props.documents.length === 0) return null;
  return (
    <ul
      aria-label="Documents attached to this chat"
      className="flex flex-col gap-1"
    >
      {props.documents.map((document) => (
        <li
          key={document.id}
          className="flex items-center gap-2 rounded-xl border bg-background dark:bg-muted px-3 py-1.5 text-xs text-muted-foreground"
        >
          <FileText size={14} className="shrink-0" />
          <span className="truncate">{document.name}</span>
        </li>
      ))}
    </ul>
  );
};

export const ChatInputStatus = (props: { status?: string }) => {
  if (props.status === undefined || props.status === "") return null;
  return (
    <div className=" flex justify-center">
      <div className="border bg-background p-2 px-5  rounded-full flex gap-2 items-center text-sm">
        <LoadingIndicator isLoading={true} /> {props.status}
      </div>
    </div>
  );
};

export const ChatInputActionArea = (props: { children?: React.ReactNode }) => {
  return (
    <div className="flex justify-between items-center p-2">
      {props.children}
    </div>
  );
};

export const ChatInputPrimaryActionArea = (props: {
  children?: React.ReactNode;
}) => {
  return <div className="flex items-center gap-1">{props.children}</div>;
};

export const ChatInputSecondaryActionArea = (props: {
  children?: React.ReactNode;
}) => {
  return <div className="flex items-center gap-1">{props.children}</div>;
};
