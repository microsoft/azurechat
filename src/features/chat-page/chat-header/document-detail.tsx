"use client";

import { Button } from "@/features/ui/button";
import { ScrollArea } from "@/features/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/features/ui/sheet";
import { File, Trash2 } from "lucide-react";
import { useState, type FC } from "react";
import { SoftDeleteChatDocumentsForCurrentUser } from "../chat-services/chat-thread-service";
import { ChatDocumentModel } from "../chat-services/models";
import { RevalidateCache } from "@/features/common/navigation-helpers";

interface DocumentDetailProps {
  chatDocuments: Array<ChatDocumentModel>;
}

export const DocumentDetail: FC<DocumentDetailProps> = ({ chatDocuments }) => {
  const handleDeletion = async () => {
    const threadId = chatDocuments[0].chatThreadId;
    await SoftDeleteChatDocumentsForCurrentUser(threadId);
    RevalidateCache({
      page: "chat",
      type: "layout",
    });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="gap-2"
          aria-label="Current Chat Documents Menu"
        >
          <File size={16} /> {chatDocuments.length}
        </Button>
      </SheetTrigger>
      <SheetContent className="min-w-[320px] sm:w-[540px] flex flex-col">
        <SheetHeader className="space-y-2">
          <SheetTitle>Documents ({chatDocuments.length})</SheetTitle>
          <SheetDescription>
            Documents attached to this chat conversation.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 mt-6 -mx-6" type="always">
          <div className="pb-6 px-6 flex flex-col gap-3">
            {chatDocuments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No documents attached to this conversation.
              </div>
            ) : (
              chatDocuments.map((doc) => (
                <div
                  className="flex items-center p-3 rounded-md border hover:bg-accent"
                  key={doc.id}
                >
                  <div className="flex items-center gap-4 justify-between">
                    <File size={16} className="min-w-5" />
                    <span className="break-all">{doc.name}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="mt-auto pt-4 border-t">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDeletion()}
            className="gap-2 w-full"
            disabled={chatDocuments.length == 0}
          >
            <Trash2 size={16} /> Remove All Documents
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
